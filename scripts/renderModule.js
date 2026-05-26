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
const MARKER_ACTIVE_GLOW_BASE_OPACITY = 0.34;
const MARKER_ACTIVE_GLOW_PULSE_OPACITY = 0.44;
const MARKER_ACTIVE_RIPPLE_COUNT = 3;
const MARKER_ACTIVE_RIPPLE_SPEED = 0.00052;
const MARKER_ACTIVE_RIPPLE_MIN_SCALE = 1.05;
const MARKER_ACTIVE_RIPPLE_PULSE_SCALE = 0.85;
const MARKER_ACTIVE_RIPPLE_MAX_OPACITY = 0.46;
const CAMERA_UPDATED_EVENT = "scene:camera-updated";

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
      document.dispatchEvent(new Event(CAMERA_UPDATED_EVENT));
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
    updateMarkerActiveEffects(marker, now);

    if (marker.material) {
      marker.material.opacity = marker.userData.isHovered
        ? 0.78 + (pulse / MARKER_HOVER_SCALE) * 0.22
        : 1;
      marker.material.transparent = true;
    }
  }
}

function updateMarkerActiveEffects(marker, now) {
  const outline = marker.userData.activeOutline;
  const ripples = marker.userData.activeRipples
    || (marker.userData.activeRipple ? [marker.userData.activeRipple] : []);

  const isActive = Boolean(marker.userData.isActive);
  if (outline?.material) {
    outline.visible = isActive;
  }
  ripples.forEach((ripple) => {
    if (ripple?.material) {
      ripple.visible = isActive;
    }
  });

  if (!isActive) {
    if (outline?.material) {
      outline.material.opacity = 0;
    }
    ripples.forEach((ripple) => {
      if (ripple?.material) {
        ripple.material.opacity = 0;
      }
    });
    return;
  }

  if (outline?.material) {
    const glowPulse = getRippleStartPulse(now, ripples.length || MARKER_ACTIVE_RIPPLE_COUNT);
    outline.scale.setScalar(1);
    outline.material.opacity = MARKER_ACTIVE_GLOW_BASE_OPACITY + glowPulse * MARKER_ACTIVE_GLOW_PULSE_OPACITY;
    outline.material.transparent = true;
  }

  ripples.forEach((ripple, index) => {
    if (!ripple?.material) return;

    const ripplePhase = getRipplePhase(now, index, ripples.length);
    const rippleScale = MARKER_ACTIVE_RIPPLE_MIN_SCALE + ripplePhase * MARKER_ACTIVE_RIPPLE_PULSE_SCALE;
    ripple.scale.set(rippleScale, rippleScale, rippleScale);
    ripple.material.opacity = MARKER_ACTIVE_RIPPLE_MAX_OPACITY * Math.pow(1 - ripplePhase, 1.25);
    ripple.material.transparent = true;
  });
}

function getRippleStartPulse(now, count) {
  let pulse = 0;

  for (let index = 0; index < count; index += 1) {
    const phase = getRipplePhase(now, index, count);
    if (phase > 0.34) continue;
    pulse = Math.max(pulse, Math.pow(1 - phase / 0.34, 2));
  }

  return pulse;
}

function getRipplePhase(now, index, count) {
  const cycle = (now * MARKER_ACTIVE_RIPPLE_SPEED) % 1;
  return (cycle - index / count + 1) % 1;
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
