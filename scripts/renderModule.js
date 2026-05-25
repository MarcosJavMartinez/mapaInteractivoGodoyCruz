import {
  WebGLRenderer,
  PerspectiveCamera,
  sRGBEncoding,
  BasicShadowMap,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
} from "../vendor/three/build/three.module.js";
import { OrbitControls } from "../vendor/three/examples/jsm/controls/OrbitControls.js";
import { getQualitySettings } from "./qualityModule.js";

const IDLE_AUTO_ROTATE_DELAY = 22000;
const IDLE_AUTO_ROTATE_SPEED = 0.18;
const MARKER_HOVER_SCALE = 0.14;
const MARKER_ACTIVE_OUTLINE_SCALE = 1.16;
const MARKER_ACTIVE_OUTLINE_PULSE_SCALE = 0.18;

export function setupRenderer(quality = getQualitySettings()) {
  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  renderer.physicallyCorrectLights = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(getPixelRatio(quality));
  renderer.shadowMap.enabled = quality.shadowMap !== "off";
  renderer.shadowMap.type = getShadowMapType(quality);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function setupCamera(renderer, quality = getQualitySettings()) {
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.position.set(-50.551, 0, 56.5);
  camera.castShadow = true;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = quality.rotateSpeed;
  controls.zoomSpeed = quality.zoomSpeed;
  controls.panSpeed = quality.panSpeed;
  controls.enablePan = false;
  controls.minDistance = 16;
  controls.maxDistance = 380;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.maxTargetRadius = 240;
  setupIdleAutoRotate(controls, renderer.domElement);
  camera.userData.controls = controls;
  return camera;
}

export function setupResizeHandler(camera, renderer, quality = getQualitySettings()) {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(getPixelRatio(quality));
  });
}

export function render(scene, camera, renderer, quality = getQualitySettings(), markers = []) {
  let then = performance.now();
  const interval = 1000 / quality.targetFps;

  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    const delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);
      const controls = camera.userData.controls;
      if (!controls || controls.enabled !== false) {
        controls?.update();
      }
      updateMarkerScales(markers, camera, now);
      renderer.render(scene, camera);
    }
  }

  renderLoop(performance.now());
}

function getPixelRatio(quality) {
  return Math.min(window.devicePixelRatio, quality.maxPixelRatio);
}

function getShadowMapType(quality) {
  return quality.shadowMap === "pcf-soft" ? PCFSoftShadowMap : BasicShadowMap;
}

function updateMarkerScales(markers, camera, now) {
  for (const marker of markers) {
    const distance = camera.position.distanceTo(marker.position);
    const baseScale = clamp(
      distance * (marker.userData.markerScreenScale || 0.032),
      marker.userData.markerMinScale || 1,
      marker.userData.markerMaxScale || 12
    );
    const pulse = marker.userData.isHovered
      ? (Math.sin(now * 0.006) + 1) * 0.5 * MARKER_HOVER_SCALE
      : 0;
    const scale = baseScale * (1 + pulse);

    marker.scale.setScalar(scale);
    updateMarkerActiveOutline(marker, now);

    if (marker.material) {
      marker.material.opacity = marker.userData.isHovered
        ? 0.78 + (pulse / MARKER_HOVER_SCALE) * 0.22
        : 1;
      marker.material.transparent = true;
    }
  }
}

function updateMarkerActiveOutline(marker, now) {
  const outline = marker.userData.activeOutline;
  if (!outline?.material) return;

  const isActive = Boolean(marker.userData.isActive);
  outline.visible = isActive;
  if (!isActive) {
    outline.material.opacity = 0;
    return;
  }

  const pulse = (Math.sin(now * 0.0052) + 1) * 0.5;
  outline.scale.setScalar(MARKER_ACTIVE_OUTLINE_SCALE + pulse * MARKER_ACTIVE_OUTLINE_PULSE_SCALE);
  outline.material.opacity = 0.36 + pulse * 0.28;
  outline.material.transparent = true;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupIdleAutoRotate(controls, interactionTarget) {
  let idleTimer = null;

  controls.autoRotate = false;
  controls.autoRotateSpeed = IDLE_AUTO_ROTATE_SPEED;

  const scheduleAutoRotate = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (isExperienceOverlayOpen()) {
        scheduleAutoRotate();
        return;
      }

      controls.autoRotate = true;
    }, IDLE_AUTO_ROTATE_DELAY);
  };

  const stopAutoRotate = () => {
    controls.autoRotate = false;
    scheduleAutoRotate();
  };

  controls.addEventListener("start", stopAutoRotate);
  interactionTarget.addEventListener("pointerdown", stopAutoRotate, { passive: true });
  interactionTarget.addEventListener("wheel", stopAutoRotate, { passive: true });
  interactionTarget.addEventListener("touchstart", stopAutoRotate, { passive: true });
  window.addEventListener("keydown", stopAutoRotate);

  scheduleAutoRotate();
}

function isExperienceOverlayOpen() {
  return Boolean(document.querySelector(
    ".loader.active, .help-overlay.active, .about-overlay.active, .image-viewer-overlay"
  ));
}
