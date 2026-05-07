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
  controls.minDistance = 16;
  controls.maxDistance = 380;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.maxTargetRadius = 240;
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

export function render(scene, camera, renderer, quality = getQualitySettings()) {
  let then = performance.now();
  const interval = 1000 / quality.targetFps;

  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    const delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);
      camera.userData.controls?.update();
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
