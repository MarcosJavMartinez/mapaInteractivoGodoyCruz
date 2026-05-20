import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  BasicShadowMap,
  PCFSoftShadowMap,
  Color,
} from "../vendor/three/build/three.module.js";
import { getQualitySettings } from "./qualityModule.js";

const SUN_TARGET = [-55, 0, 45];
const SUN_PATH = {
  sunrise: [180, 42, -220],
  noon: [-40, 260, 30],
  sunset: [-260, 48, 210],
};

export function setupLights(scene, renderer, quality = getQualitySettings()) {
  renderer.shadowMap.enabled = quality.shadowMap !== "off";
  renderer.shadowMap.type = quality.shadowMap === "pcf-soft" ? PCFSoftShadowMap : BasicShadowMap;

  const skyLight = new HemisphereLight(0xcfe4ff, 0x7b6754, 0.58);
  scene.add(skyLight);

  const ambientLight = new AmbientLight(0xfff1dd, 0.045);
  scene.add(ambientLight);

  const sunLight = createDirectionalLight({
    position: [-160, 220, 180],
    target: SUN_TARGET,
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

  const sunController = createSunController({
    sunLight,
    skyLight,
    ambientLight,
    coolFillLight,
  });
  sunController.setProgress(0.5);
  return sunController;
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

function createSunController({ sunLight, skyLight, ambientLight, coolFillLight }) {
  const sunriseColor = new Color(0xffb36f);
  const noonColor = new Color(0xfff0d0);
  const sunsetColor = new Color(0xff9f63);
  const dawnSkyColor = new Color(0xb9cfe8);
  const noonSkyColor = new Color(0xd9eaff);
  const sunsetSkyColor = new Color(0xd0b5d4);
  const dawnGroundColor = new Color(0x7b6754);
  const noonGroundColor = new Color(0x7f775f);
  const sunsetGroundColor = new Color(0x745b55);
  const dawnFillColor = new Color(0xc7d9ff);
  const noonFillColor = new Color(0xd6e6ff);
  const sunsetFillColor = new Color(0xc6b2ff);

  return {
    setProgress(progress) {
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      const firstHalf = clampedProgress <= 0.5;
      const localProgress = firstHalf ? clampedProgress / 0.5 : (clampedProgress - 0.5) / 0.5;
      const from = firstHalf ? SUN_PATH.sunrise : SUN_PATH.noon;
      const to = firstHalf ? SUN_PATH.noon : SUN_PATH.sunset;
      const fromColor = firstHalf ? sunriseColor : noonColor;
      const toColor = firstHalf ? noonColor : sunsetColor;
      const fromSkyColor = firstHalf ? dawnSkyColor : noonSkyColor;
      const toSkyColor = firstHalf ? noonSkyColor : sunsetSkyColor;
      const fromGroundColor = firstHalf ? dawnGroundColor : noonGroundColor;
      const toGroundColor = firstHalf ? noonGroundColor : sunsetGroundColor;
      const fromFillColor = firstHalf ? dawnFillColor : noonFillColor;
      const toFillColor = firstHalf ? noonFillColor : sunsetFillColor;

      sunLight.position.set(
        lerp(from[0], to[0], localProgress),
        lerp(from[1], to[1], localProgress),
        lerp(from[2], to[2], localProgress)
      );
      sunLight.color.copy(fromColor).lerp(toColor, localProgress);
      sunLight.intensity = firstHalf
        ? lerp(1.05, 1.45, localProgress)
        : lerp(1.45, 1.08, localProgress);
      sunLight.target.position.set(...SUN_TARGET);
      sunLight.target.updateMatrixWorld();

      skyLight.color.copy(fromSkyColor).lerp(toSkyColor, localProgress);
      skyLight.groundColor.copy(fromGroundColor).lerp(toGroundColor, localProgress);
      skyLight.intensity = firstHalf
        ? lerp(0.46, 0.58, localProgress)
        : lerp(0.58, 0.48, localProgress);

      ambientLight.intensity = firstHalf
        ? lerp(0.035, 0.045, localProgress)
        : lerp(0.045, 0.034, localProgress);

      coolFillLight.color.copy(fromFillColor).lerp(toFillColor, localProgress);
      coolFillLight.intensity = firstHalf
        ? lerp(0.18, 0.24, localProgress)
        : lerp(0.24, 0.16, localProgress);
    },
  };
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}
