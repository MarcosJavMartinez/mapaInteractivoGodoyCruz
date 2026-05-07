import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  BasicShadowMap,
  PCFSoftShadowMap,
} from "../vendor/three/build/three.module.js";
import { getQualitySettings } from "./qualityModule.js";

export function setupLights(scene, renderer, quality = getQualitySettings()) {
  renderer.shadowMap.enabled = quality.shadowMap !== "off";
  renderer.shadowMap.type = quality.shadowMap === "pcf-soft" ? PCFSoftShadowMap : BasicShadowMap;

  const skyLight = new HemisphereLight(0xcfe4ff, 0x7b6754, 0.58);
  scene.add(skyLight);

  const ambientLight = new AmbientLight(0xfff1dd, 0.045);
  scene.add(ambientLight);

  const sunLight = createDirectionalLight({
    position: [-160, 220, 180],
    target: [-30, 0, 40],
    color: 0xfff0d0,
    intensity: 1.45,
    shadowSize: quality.sunShadowSize,
    shadowBounds: 220,
    castShadow: quality.shadowMap !== "off",
  });
  scene.add(sunLight);
  scene.add(sunLight.target);

  const coolFillLight = createDirectionalLight({
    position: [180, 90, -220],
    target: [-40, 0, 20],
    color: 0xd6e6ff,
    intensity: 0.24,
    shadowSize: 1024,
    shadowBounds: 300,
    castShadow: false,
  });
  scene.add(coolFillLight);
  scene.add(coolFillLight.target);
}

function createDirectionalLight({ position, target, color, intensity, shadowSize, shadowBounds, castShadow }) {
  const light = new DirectionalLight(color, intensity);
  light.position.set(...position);
  light.target.position.set(...target);
  light.castShadow = castShadow;
  light.shadow.mapSize.width = shadowSize;
  light.shadow.mapSize.height = shadowSize;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 650;
  light.shadow.camera.left = -shadowBounds;
  light.shadow.camera.right = shadowBounds;
  light.shadow.camera.top = shadowBounds;
  light.shadow.camera.bottom = -shadowBounds;
  light.shadow.bias = -0.0008;
  light.shadow.normalBias = 0.06;
  light.shadow.radius = 1.5;
  return light;
}
