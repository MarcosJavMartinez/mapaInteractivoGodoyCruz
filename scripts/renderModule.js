// renderModule.js
import { WebGLRenderer, PerspectiveCamera, sRGBEncoding } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

export function setupRenderer() {
  const renderer = new WebGLRenderer();
  renderer.outputEncoding = sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  return renderer;
}

export function setupCamera(renderer) {
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.position.set(0, 0, 3);
  const controls = new OrbitControls(camera, renderer.domElement);

  return camera;
}

export function render(scene, camera, renderer) {
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
