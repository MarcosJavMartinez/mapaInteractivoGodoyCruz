import {
  WebGLRenderer,
  PerspectiveCamera,
  sRGBEncoding,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
} from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

const MAX_PIXEL_RATIO = 1.5;
const TARGET_FPS = 30;

export function setupRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  renderer.physicallyCorrectLights = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function setupCamera(renderer) {
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.position.set(-50.551, 0, 56.5);
  camera.castShadow = true;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  camera.userData.controls = controls;
  return camera;
}

export function setupResizeHandler(camera, renderer) {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  });
}

export function render(scene, camera, renderer) {
  let then = performance.now();
  const interval = 1000 / TARGET_FPS;

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
