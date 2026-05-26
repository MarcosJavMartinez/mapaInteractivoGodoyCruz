import { Raycaster, Vector2, Vector3 } from "../vendor/three/build/three.module.js";
import { showContent } from "./infoPanelModule.js";
import { getQualitySettings } from "./qualityModule.js";

const raycaster = new Raycaster();
const mouse = new Vector2();
let activeCameraAnimation = null;
let activeMarker = null;
let hoveredMarker = null;
let lastPointerRaycast = 0;
let markerFeedback = null;

const MAP_CENTER = new Vector3(-55, 0, 45);
const FACADE_VIEW_DISTANCE = 42;
const FACADE_VIEW_HEIGHT = 18;
const CAMERA_ANIMATION_DURATION = 900;
const DEFAULT_MARKER_COLOR = 0xffffff;
const ACTIVE_MARKER_COLOR = 0xffffff;
const CENTER_POINTER = { clientX: 0, clientY: 0 };
const MARKER_OCCLUSION_MARGIN = 0.55;
const CAMERA_UPDATED_EVENT = "scene:camera-updated";
const MARKER_LABEL_HEIGHT_OFFSET = 1.2;

export function setupEventListeners(buttons, camera, scene, quality = getQualitySettings()) {
  document.body.addEventListener("click", (event) => onClick(event, buttons, camera, scene));
  document.body.addEventListener("touchstart", (event) => onTouchStart(event, buttons, camera, scene));
  document.body.addEventListener("pointermove", (event) => onPointerMove(event, buttons, camera, scene, quality));
  document.addEventListener("marker:deselected", clearActiveMarker);
  document.addEventListener("navigation:mode-changed", clearHoveredMarker);
  document.addEventListener("navigation:interact-centered", () => {
    handleSceneInteraction(getCenterPointer(), buttons, camera, scene, { keepCameraPosition: true });
  });
  setupMarkerSelectionFeedback(camera);
  setupCenteredMarkerRaycast(buttons, camera, scene, quality);
}

function onClick(event, buttons, camera, scene) {
  if (!isSceneEvent(event)) return;

  if (isWalkPointerMode()) {
    if (document.pointerLockElement !== event.target) return;

    event.preventDefault();
    handleSceneInteraction(getCenterPointer(), buttons, camera, scene, { keepCameraPosition: true });
    return;
  }

  event.preventDefault();
  handleSceneInteraction(event, buttons, camera, scene);
}

function onTouchStart(event, buttons, camera, scene) {
  if (!isSceneEvent(event)) return;

  event.preventDefault();
  handleSceneInteraction(event.changedTouches[0], buttons, camera, scene);
}

function handleSceneInteraction(event, buttons, camera, scene, options = {}) {
  const button = getMarkerAtScreenPoint(event, buttons, camera, scene);
  if (button) {
    setActiveMarker(button);
    if (!options.keepCameraPosition) {
      focusCameraOnMarker(camera, button);
    }

    const title = button.userData.title;
    const imageUrl = button.userData.imageUrl;
    const text = button.userData.text;
    const exteriorImages = button.userData.exteriorImages;
    const interiorImages = button.userData.interiorImages;

    if (title || imageUrl || text || exteriorImages?.length || interiorImages?.length) {
      if (options.keepCameraPosition && document.pointerLockElement) {
        document.exitPointerLock?.();
        setHoveredMarker(null);
        document.body.classList.remove("is-over-marker");
      }
      showContent(title, imageUrl, text, exteriorImages, interiorImages);
    }
  }
}

function setActiveMarker(marker) {
  if (activeMarker && activeMarker !== marker) {
    activeMarker.userData.isActive = false;
    activeMarker.material?.color?.setHex(DEFAULT_MARKER_COLOR);
  }

  activeMarker = marker;
  activeMarker.userData.isActive = true;
  activeMarker.material?.color?.setHex(ACTIVE_MARKER_COLOR);
  document.dispatchEvent(new CustomEvent("marker:selected", {
    detail: {
      title: marker.userData.title,
      marker,
      cameraView: marker.userData.cameraView,
      position: marker.position.toArray(),
    },
  }));
}

function clearActiveMarker() {
  if (activeMarker) {
    activeMarker.userData.isActive = false;
    activeMarker.material?.color?.setHex(DEFAULT_MARKER_COLOR);
  }
  activeMarker = null;
  hideMarkerSelectionFeedback();
}

function onPointerMove(event, buttons, camera, scene, quality) {
  if (isWalkPointerMode()) return;

  if (!isSceneEvent(event)) {
    setHoveredMarker(null);
    document.body.classList.remove("is-over-marker");
    return;
  }

  const now = performance.now();
  if (now - lastPointerRaycast < quality.pointerRaycastInterval) return;
  lastPointerRaycast = now;

  const marker = getMarkerAtScreenPoint(event, buttons, camera, scene);
  setHoveredMarker(marker);
  document.body.classList.toggle("is-over-marker", Boolean(marker));
}

function isSceneEvent(event) {
  return event.target instanceof HTMLCanvasElement;
}

function setupCenteredMarkerRaycast(buttons, camera, scene, quality) {
  let lastCenteredRaycast = 0;

  function updateCenteredMarker(now) {
    requestAnimationFrame(updateCenteredMarker);

    if (!isWalkPointerMode() || !isCenteredWalkInteractionAvailable()) return;
    if (now - lastCenteredRaycast < quality.pointerRaycastInterval) return;
    lastCenteredRaycast = now;

    const marker = getMarkerAtScreenPoint(getCenterPointer(), buttons, camera, scene);
    setHoveredMarker(marker);
    document.body.classList.toggle("is-over-marker", Boolean(marker));
  }

  requestAnimationFrame(updateCenteredMarker);
}

function getMarkerAtScreenPoint(point, buttons, camera, scene) {
  mouse.x = (point.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(point.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const markerIntersections = raycaster.intersectObjects(buttons);
  if (!markerIntersections.length) return null;

  const occluderDistance = getClosestMarkerOccluderDistance(scene);
  return markerIntersections
    .find((intersection) => isMarkerIntersectionVisible(intersection, occluderDistance))
    ?.object || null;
}

function getCenterPointer() {
  CENTER_POINTER.clientX = window.innerWidth / 2;
  CENTER_POINTER.clientY = window.innerHeight / 2;
  return CENTER_POINTER;
}

function isWalkPointerMode() {
  return document.body.classList.contains("navigation-mode-walk");
}

function isCenteredWalkInteractionAvailable() {
  return document.pointerLockElement instanceof HTMLCanvasElement
    || document.body.classList.contains("navigation-mode-touch");
}

function getClosestMarkerOccluderDistance(scene) {
  if (!scene) return Infinity;

  const occluder = raycaster.intersectObjects(scene.children, true)
    .find((intersection) => isMarkerOccluder(intersection.object));
  return occluder?.distance ?? Infinity;
}

function isMarkerIntersectionVisible(markerIntersection, occluderDistance) {
  return markerIntersection.distance <= occluderDistance + MARKER_OCCLUSION_MARGIN;
}

function isMarkerOccluder(object) {
  if (!object || object.isSprite) return false;
  if (!object.visible || !object.isMesh) return false;

  let current = object;
  while (current) {
    if (
      current.userData?.ignoreMarkerInteractionOcclusion
      || current.userData?.ignoreMarkerEditorProjection
      || current.userData?.isDraftMarker
    ) {
      return false;
    }
    current = current.parent;
  }

  return true;
}

function setHoveredMarker(marker) {
  if (hoveredMarker === marker) return;

  resetHoveredMarker();
  hoveredMarker = marker;

  if (!hoveredMarker) return;

  hoveredMarker.userData.isHovered = true;
  hoveredMarker.material.opacity = 1;
  hoveredMarker.material.transparent = true;
}

function resetHoveredMarker() {
  if (!hoveredMarker) return;

  hoveredMarker.userData.isHovered = false;
  hoveredMarker.material.opacity = 1;
  hoveredMarker = null;
}

function clearHoveredMarker() {
  resetHoveredMarker();
  document.body.classList.remove("is-over-marker");
}

function setupMarkerSelectionFeedback(camera) {
  // DOM overlay projected from the selected 3D marker, so the pin reads as active without changing scene geometry.
  markerFeedback = document.createElement("div");
  markerFeedback.className = "marker-selection-feedback";
  markerFeedback.hidden = true;
  markerFeedback.innerHTML = `
    <span class="marker-selection-ring" aria-hidden="true"></span>
    <span class="marker-selection-card">
      <strong></strong>
      <span>Ver información</span>
      <i aria-hidden="true">></i>
    </span>
  `;
  document.body.appendChild(markerFeedback);

  const title = markerFeedback.querySelector("strong");

  document.addEventListener("marker:selected", (event) => {
    title.textContent = event.detail?.title || "Edificio seleccionado";
    markerFeedback.hidden = false;
    markerFeedback.classList.add("active");
    updateFeedbackPosition();
  });

  const markerPosition = new Vector3();
  const markerTopPosition = new Vector3();
  const projectedMarkerPosition = new Vector3();
  const projectedMarkerTopPosition = new Vector3();
  const cameraUp = new Vector3();
  const updateFeedbackPosition = () => {
    if (!markerFeedback || markerFeedback.hidden || !activeMarker) return;

    activeMarker.getWorldPosition(markerPosition);
    cameraUp.copy(camera.up).normalize();
    markerTopPosition.copy(markerPosition).addScaledVector(cameraUp, activeMarker.scale.y * MARKER_LABEL_HEIGHT_OFFSET);
    projectedMarkerPosition.copy(markerPosition).project(camera);
    projectedMarkerTopPosition.copy(markerTopPosition).project(camera);

    const isVisible = projectedMarkerPosition.z >= -1 && projectedMarkerPosition.z <= 1;
    markerFeedback.classList.toggle("is-hidden", !isVisible);
    if (!isVisible) return;

    const markerTopScreenX = ((projectedMarkerTopPosition.x + 1) / 2) * window.innerWidth;
    const markerTopScreenY = ((-projectedMarkerTopPosition.y + 1) / 2) * window.innerHeight;

    markerFeedback.style.transform = `translate3d(${markerTopScreenX}px, ${markerTopScreenY}px, 0)`;
  };

  document.addEventListener(CAMERA_UPDATED_EVENT, updateFeedbackPosition);
  window.addEventListener("resize", updateFeedbackPosition);
}

function hideMarkerSelectionFeedback() {
  if (!markerFeedback) return;
  markerFeedback.hidden = true;
  markerFeedback.classList.remove("active");
}

function focusCameraOnMarker(camera, marker) {
  const controls = camera.userData.controls;
  const target = getCameraTarget(marker);
  const destination = getCameraDestination(marker, target);
  const startPosition = camera.position.clone();
  const startTarget = controls?.target?.clone() || target.clone();
  const startTime = performance.now();

  if (activeCameraAnimation) {
    cancelAnimationFrame(activeCameraAnimation);
  }

  function animateCamera(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / CAMERA_ANIMATION_DURATION, 1);
    const easedProgress = easeInOutCubic(progress);

    camera.position.lerpVectors(startPosition, destination, easedProgress);

    if (controls) {
      controls.target.lerpVectors(startTarget, target, easedProgress);
      controls.update();
    } else {
      camera.lookAt(target);
    }
    document.dispatchEvent(new Event(CAMERA_UPDATED_EVENT));

    if (progress < 1) {
      activeCameraAnimation = requestAnimationFrame(animateCamera);
    } else {
      activeCameraAnimation = null;
    }
  }

  activeCameraAnimation = requestAnimationFrame(animateCamera);
}

function getCameraTarget(marker) {
  const cameraView = marker.userData.cameraView;

  if (cameraView?.target) {
    return new Vector3(...cameraView.target);
  }

  return marker.position.clone().add(new Vector3(0, cameraView?.targetHeight || 0, 0));
}

function getCameraDestination(marker, target) {
  const cameraView = marker.userData.cameraView;

  if (cameraView?.position) {
    return new Vector3(...cameraView.position);
  }

  const direction = cameraView?.direction
    ? new Vector3(cameraView.direction[0], 0, cameraView.direction[1]).normalize()
    : getFacadeViewDirection(marker.position);
  const distance = cameraView?.distance || FACADE_VIEW_DISTANCE;
  const height = cameraView?.height || FACADE_VIEW_HEIGHT;

  return target.clone()
    .add(direction.multiplyScalar(distance))
    .add(new Vector3(0, height, 0));
}

function getFacadeViewDirection(target) {
  const direction = new Vector3(
    MAP_CENTER.x - target.x,
    0,
    MAP_CENTER.z - target.z
  );

  if (direction.lengthSq() < 0.001) {
    direction.set(0, 0, 1);
  }

  return direction.normalize();
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}
