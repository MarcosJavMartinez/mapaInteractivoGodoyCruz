//eventModule.js
import { Raycaster, Vector2, Vector3 } from "../vendor/three/build/three.module.js";
import { showContent } from './infoPanelModule.js';
import { getQualitySettings } from "./qualityModule.js";
const raycaster = new Raycaster();
const mouse = new Vector2();
let activeCameraAnimation = null;
let activeMarker = null;
let hoveredMarker = null;

const MAP_CENTER = new Vector3(-55, 0, 45);
const FACADE_VIEW_DISTANCE = 42;
const FACADE_VIEW_HEIGHT = 18;
const CAMERA_ANIMATION_DURATION = 900;
const DEFAULT_MARKER_COLOR = 0xffffff;
const ACTIVE_MARKER_COLOR = 0xffd35a;
let lastPointerRaycast = 0;

export function setupEventListeners(buttons, camera, currentInfoPanel, quality = getQualitySettings()) {
  document.body.addEventListener('click', (event) => onClick(event, buttons, camera, currentInfoPanel));
  document.body.addEventListener('touchstart', (event) => onTouchStart(event, buttons, camera, currentInfoPanel));
  document.body.addEventListener('pointermove', (event) => onPointerMove(event, buttons, camera, quality));
}
function onClick(event, buttons, camera, currentInfoPanel) {
  event.preventDefault();
  handleTouchEvent(event, buttons, camera, currentInfoPanel);
}
function onTouchStart(event, buttons, camera, currentInfoPanel) {
  event.preventDefault();
  handleTouchEvent(event.changedTouches[0], buttons, camera, currentInfoPanel);
}
function handleTouchEvent(event, buttons, camera, currentInfoPanel) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buttons);
  if (intersects.length > 0) {
    const button = intersects[0].object;
    setActiveMarker(button);
    focusCameraOnMarker(camera, button);

    const title = button.userData.title;
    const imageUrl = button.userData.imageUrl;
    const text = button.userData.text;
    const exteriorImages = button.userData.exteriorImages;
    const interiorImages = button.userData.interiorImages;
    if (title || imageUrl || text || (exteriorImages && interiorImages)) {
      showContent(title, imageUrl, text, exteriorImages, interiorImages, currentInfoPanel);
    }
  }
}

function setActiveMarker(marker) {
  if (activeMarker && activeMarker !== marker) {
    activeMarker.material?.color?.setHex(DEFAULT_MARKER_COLOR);
  }

  activeMarker = marker;
  activeMarker.material?.color?.setHex(ACTIVE_MARKER_COLOR);
}

function onPointerMove(event, buttons, camera, quality) {
  const now = performance.now();
  if (now - lastPointerRaycast < quality.pointerRaycastInterval) return;
  lastPointerRaycast = now;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(buttons);
  const marker = intersects[0]?.object || null;
  setHoveredMarker(marker);
  document.body.classList.toggle("is-over-marker", Boolean(marker));
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
