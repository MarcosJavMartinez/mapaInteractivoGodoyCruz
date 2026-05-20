import {
  BackSide,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  CylinderGeometry,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  sRGBEncoding,
} from "../vendor/three/build/three.module.js";

const SKY_RADIUS = 3200;
const SKY_WIDTH = 2048;
const SKY_HEIGHT = 1024;
const SKY_CENTER = [-55, -120, 45];
const HORIZON_RADIUS = 760;
const HORIZON_HEIGHT = 260;
const HORIZON_WIDTH = 4096;
const HORIZON_TEXTURE_HEIGHT = 768;
const HORIZON_CENTER = [-55, 42, 45];
const UNDERFILL_RADIUS = 1400;
const UNDERFILL_CENTER = [-55, -8, 45];

const DAWN = {
  top: "#6fadd5",
  upper: "#f9c694",
  horizon: "#ffd9a9",
  mist: "rgba(255, 224, 189, 0.64)",
  cloud: "rgba(255, 232, 204, 0.42)",
  mountain: "rgba(118, 134, 140, 0.28)",
  fieldA: "rgba(126, 134, 130, 0.2)",
  fieldB: "rgba(110, 120, 120, 0.24)",
  fog: 0xd6c9bd,
};

const NOON = {
  top: "#4fb0ed",
  upper: "#96d9fb",
  horizon: "#d9f2ff",
  mist: "rgba(219, 241, 250, 0.62)",
  cloud: "rgba(255, 255, 255, 0.32)",
  mountain: "rgba(132, 160, 172, 0.18)",
  fieldA: "rgba(126, 145, 150, 0.16)",
  fieldB: "rgba(112, 132, 140, 0.18)",
  fog: 0xcfeeff,
};

const SUNSET = {
  top: "#6a9fd0",
  upper: "#f6b28e",
  horizon: "#ffc384",
  mist: "rgba(255, 205, 165, 0.66)",
  cloud: "rgba(255, 216, 184, 0.4)",
  mountain: "rgba(110, 118, 128, 0.28)",
  fieldA: "rgba(128, 120, 112, 0.2)",
  fieldB: "rgba(118, 108, 104, 0.24)",
  fog: 0xd7b69e,
};

export function setupEnvironment(scene) {
  if (!scene) return null;

  const skyDome = createSkyDome();
  const horizonRing = createHorizonRing();
  const underfill = createUnderfill();
  scene.add(skyDome);
  scene.add(horizonRing);
  scene.add(underfill);
  scene.userData.skyDome = skyDome;
  scene.userData.horizonRing = horizonRing;
  scene.userData.underfill = underfill;

  const controller = createEnvironmentController(scene, skyDome, horizonRing, underfill);
  controller.setProgress(0.5);
  return controller;
}

function createSkyDome() {
  const texture = createSkyTexture();
  const geometry = new SphereGeometry(SKY_RADIUS, 64, 32);
  const material = new MeshBasicMaterial({
    map: texture,
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const skyDome = new Mesh(geometry, material);
  skyDome.name = "Horizonte digital dinamico";
  skyDome.position.set(...SKY_CENTER);
  skyDome.renderOrder = -1000;
  skyDome.frustumCulled = false;
  skyDome.userData.ignoreMarkerEditorProjection = true;
  skyDome.userData.ignoreNavigationObstacle = true;
  return skyDome;
}

function createHorizonRing() {
  const texture = createHorizonTexture();
  const geometry = new CylinderGeometry(
    HORIZON_RADIUS,
    HORIZON_RADIUS,
    HORIZON_HEIGHT,
    96,
    1,
    true
  );
  const material = new MeshBasicMaterial({
    map: texture,
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const horizonRing = new Mesh(geometry, material);
  horizonRing.name = "Horizonte panoramico digital";
  horizonRing.position.set(...HORIZON_CENTER);
  horizonRing.rotation.y = Math.PI * 0.18;
  horizonRing.renderOrder = -990;
  horizonRing.frustumCulled = false;
  horizonRing.userData.ignoreMarkerEditorProjection = true;
  horizonRing.userData.ignoreNavigationObstacle = true;
  return horizonRing;
}

function createUnderfill() {
  const geometry = new CylinderGeometry(UNDERFILL_RADIUS, UNDERFILL_RADIUS, 2, 96, 1, false);
  const material = new MeshBasicMaterial({
    color: 0x829ca8,
    side: DoubleSide,
    fog: false,
  });

  const underfill = new Mesh(geometry, material);
  underfill.name = "Base lejana de horizonte";
  underfill.position.set(...UNDERFILL_CENTER);
  underfill.renderOrder = -980;
  underfill.frustumCulled = false;
  underfill.userData.ignoreMarkerEditorProjection = true;
  underfill.userData.ignoreNavigationObstacle = true;
  return underfill;
}

function createEnvironmentController(scene, skyDome, horizonRing, underfill) {
  const skyTexture = skyDome.material.map;
  const skyCanvas = skyTexture.image;
  const skyContext = skyCanvas.getContext("2d");
  const horizonTexture = horizonRing.material.map;
  const horizonCanvas = horizonTexture.image;
  const horizonContext = horizonCanvas.getContext("2d");
  const fogColor = new Color();
  const whiteBackground = new Color(0xffffff);
  let isWhiteBackground = false;
  let lastProgress = 0.5;

  return {
    setProgress(progress) {
      const clampedProgress = clamp(progress, 0, 1);
      lastProgress = clampedProgress;
      if (isWhiteBackground) {
        applyWhiteBackground(scene, skyDome, horizonRing, underfill, whiteBackground);
        return;
      }

      const palette = getPalette(clampedProgress);

      drawSkyOnly(skyContext, palette, clampedProgress);
      drawPanoramicHorizon(horizonContext, palette, clampedProgress);
      skyTexture.needsUpdate = true;
      horizonTexture.needsUpdate = true;

      fogColor.set(palette.fog);
      if (scene.fog) {
        scene.fog.color.copy(fogColor);
        scene.fog.near = lerp(190, 270, getMiddayAmount(clampedProgress));
        scene.fog.far = lerp(560, 760, getMiddayAmount(clampedProgress));
      }
      if (scene.background?.isColor) {
        scene.background.copy(fogColor);
      }
      updateUnderfillColor(underfill, palette);
    },
    setWhiteBackground(isActive) {
      isWhiteBackground = Boolean(isActive);
      if (isWhiteBackground) {
        applyWhiteBackground(scene, skyDome, horizonRing, underfill, whiteBackground);
        return;
      }

      skyDome.visible = true;
      horizonRing.visible = true;
      underfill.visible = true;
      this.setProgress(lastProgress);
    },
  };
}

function applyWhiteBackground(scene, skyDome, horizonRing, underfill, whiteBackground) {
  skyDome.visible = false;
  horizonRing.visible = false;
  underfill.visible = false;
  if (scene.background?.isColor) {
    scene.background.copy(whiteBackground);
  }
  if (scene.fog) {
    scene.fog.color.copy(whiteBackground);
    scene.fog.near = 320;
    scene.fog.far = 1100;
  }
}

function updateUnderfillColor(underfill, palette) {
  if (!underfill?.material?.color) return;

  underfill.material.color.set(parseRgbaToHex(scaleRgbaAlpha(palette.mountain, 0.86)));
}

function createSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = SKY_WIDTH;
  canvas.height = SKY_HEIGHT;

  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  return texture;
}

function createHorizonTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = HORIZON_WIDTH;
  canvas.height = HORIZON_TEXTURE_HEIGHT;

  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function drawSkyOnly(context, palette, progress) {
  context.clearRect(0, 0, SKY_WIDTH, SKY_HEIGHT);
  drawSkyGradient(context, palette);
  drawSunGlow(context, palette, progress);
  drawCloudLayers(context, palette, progress);
  drawAtmosphereVignette(context, progress);
}

function drawPanoramicHorizon(context, palette, progress) {
  context.clearRect(0, 0, HORIZON_WIDTH, HORIZON_TEXTURE_HEIGHT);
  drawHorizonGradient(context, palette);
  drawHorizonSunWash(context, progress);
  drawHorizonClouds(context, palette, progress);
  drawPanoramicMountains(context, palette, progress);
  drawTreeAndFieldBands(context, palette, progress);
  drawHorizonMist(context, palette);
  sealPanoramaSeam(context);
}

function drawSkyGradient(context, palette) {
  const gradient = context.createLinearGradient(0, 0, 0, SKY_HEIGHT);
  gradient.addColorStop(0, palette.top);
  gradient.addColorStop(0.48, palette.upper);
  gradient.addColorStop(0.82, palette.horizon);
  gradient.addColorStop(1, palette.horizon);

  context.fillStyle = gradient;
  context.fillRect(0, 0, SKY_WIDTH, SKY_HEIGHT);
}

function drawHorizonGradient(context, palette) {
  const gradient = context.createLinearGradient(0, 0, 0, HORIZON_TEXTURE_HEIGHT);
  gradient.addColorStop(0, palette.upper);
  gradient.addColorStop(0.56, palette.horizon);
  gradient.addColorStop(0.84, scaleRgbaAlpha(palette.mountain, 0.46));
  gradient.addColorStop(1, palette.fieldB);

  context.fillStyle = gradient;
  context.fillRect(0, 0, HORIZON_WIDTH, HORIZON_TEXTURE_HEIGHT);
}

function drawSunGlow(context, palette, progress) {
  const sunX = SKY_WIDTH * lerp(0.28, 0.72, progress);
  const sunY = SKY_HEIGHT * (0.55 - Math.sin(progress * Math.PI) * 0.28);
  const radius = SKY_WIDTH * lerp(0.2, 0.14, getMiddayAmount(progress));
  const alpha = lerp(0.32, 0.12, getMiddayAmount(progress));
  const glow = context.createRadialGradient(sunX, sunY, 4, sunX, sunY, radius);

  glow.addColorStop(0, `rgba(255, 236, 194, ${alpha})`);
  glow.addColorStop(0.28, `rgba(255, 214, 162, ${alpha * 0.55})`);
  glow.addColorStop(1, "rgba(255, 214, 162, 0)");

  context.fillStyle = glow;
  context.fillRect(0, 0, SKY_WIDTH, SKY_HEIGHT);
}

function drawCloudLayers(context, palette, progress) {
  drawCloudBand(context, 190, palette.cloud, 0.7, progress, 0.16);
  drawCloudBand(context, 292, palette.cloud, 1.05, progress, 0.12);
  drawCloudBand(context, 396, palette.cloud, 1.35, progress, 0.08);
}

function drawHorizonClouds(context, palette, progress) {
  drawPanoramaCloudBand(context, 106, palette.cloud, 1, progress, 0.2);
  drawPanoramaCloudBand(context, 178, palette.cloud, 2, progress, 0.16);
}

function drawPanoramaCloudBand(context, y, color, wave, progress, alphaScale) {
  const bandY = y + Math.sin(progress * Math.PI * 2 + wave) * 10;
  const gradient = context.createLinearGradient(0, bandY - 38, 0, bandY + 48);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.5, scaleRgbaAlpha(color, alphaScale));
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(0, bandY);

  for (let x = 0; x <= HORIZON_WIDTH; x += 96) {
    const offset = Math.sin((x / HORIZON_WIDTH) * Math.PI * 2 * wave + progress * 2.2) * 20;
    context.lineTo(x, bandY + offset);
  }

  context.lineTo(HORIZON_WIDTH, bandY + 72);
  context.lineTo(0, bandY + 72);
  context.closePath();
  context.fill();
}

function drawHorizonSunWash(context, progress) {
  const sunX = HORIZON_WIDTH * lerp(0.28, 0.72, progress);
  const sunY = HORIZON_TEXTURE_HEIGHT * (0.42 - Math.sin(progress * Math.PI) * 0.18);
  const alpha = lerp(0.24, 0.09, getMiddayAmount(progress));
  const glow = context.createRadialGradient(sunX, sunY, 4, sunX, sunY, HORIZON_WIDTH * 0.18);

  glow.addColorStop(0, `rgba(255, 229, 181, ${alpha})`);
  glow.addColorStop(0.4, `rgba(255, 203, 145, ${alpha * 0.5})`);
  glow.addColorStop(1, "rgba(255, 203, 145, 0)");

  context.fillStyle = glow;
  context.fillRect(0, 0, HORIZON_WIDTH, HORIZON_TEXTURE_HEIGHT);
}

function drawCloudBand(context, y, color, wave, progress, alphaScale) {
  const bandY = y + Math.sin(progress * Math.PI * 2 + wave) * 14;
  const gradient = context.createLinearGradient(0, bandY - 48, 0, bandY + 58);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.5, scaleRgbaAlpha(color, alphaScale));
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(0, bandY);

  for (let x = 0; x <= SKY_WIDTH; x += 72) {
    const offset = Math.sin((x / SKY_WIDTH) * Math.PI * 2 * wave + progress * 2.2) * 18;
    context.lineTo(x, bandY + offset);
  }

  context.lineTo(SKY_WIDTH, bandY + 78);
  context.lineTo(0, bandY + 78);
  context.closePath();
  context.fill();
}

function drawPanoramicMountains(context, palette, progress) {
  drawPanoramaMountainRange(context, 600, 42, scaleRgbaAlpha(palette.mountain, 0.78), 1, progress);
  drawPanoramaMountainRange(context, 626, 27, scaleRgbaAlpha(palette.mountain, 0.52), 2, progress + 0.35);
  drawPanoramaMountainHighlights(context, progress);
}

function drawPanoramaMountainRange(context, baseY, height, color, wave, progress) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, HORIZON_TEXTURE_HEIGHT);

  for (let x = 0; x < HORIZON_WIDTH; x += 42) {
    context.lineTo(x, getMountainRidgeY(x, baseY, height, wave, progress));
  }
  context.lineTo(HORIZON_WIDTH, getMountainRidgeY(HORIZON_WIDTH, baseY, height, wave, progress));

  context.lineTo(HORIZON_WIDTH, HORIZON_TEXTURE_HEIGHT);
  context.closePath();
  context.fill();
}

function getMountainRidgeY(x, baseY, height, wave, progress) {
  const normalized = x / HORIZON_WIDTH;
  const ridge = Math.sin(normalized * Math.PI * 2 * wave + progress * 0.7) * height * 0.24
    + Math.sin(normalized * Math.PI * 2 * 4 + 0.8) * height * 0.16
    + Math.sin(normalized * Math.PI * 2 * 9 + 1.9) * height * 0.08
    + Math.sin(normalized * Math.PI * 2 * 17 + wave * 0.9) * height * 0.035
    + Math.sin(normalized * Math.PI * 2 * 31 + progress * 1.6) * height * 0.02;
  return baseY - height * 0.54 + ridge;
}

function drawPanoramaMountainHighlights(context, progress) {
  context.strokeStyle = `rgba(255, 248, 232, ${lerp(0.12, 0.05, getMiddayAmount(progress)).toFixed(3)})`;
  context.lineWidth = 1;
  context.beginPath();

  for (let x = 0; x <= HORIZON_WIDTH; x += 58) {
    const normalized = x / HORIZON_WIDTH;
    const y = 570
      + Math.sin(normalized * Math.PI * 2 + progress * 0.7) * 12
      + Math.sin(normalized * Math.PI * 2 * 4 + 0.8) * 4
      + Math.sin(normalized * Math.PI * 2 * 13 + 1.4) * 1.8;
    if (x === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}

function drawTreeAndFieldBands(context, palette, progress) {
  drawPanoramaFieldBand(context, 642, 36, scaleRgbaAlpha(palette.mountain, 0.5), 1);
  drawTreeLine(context, 664, palette, progress);
  drawPanoramaFieldBand(context, 684, 42, scaleRgbaAlpha(palette.mountain, 0.6), 2);
  drawPanoramaFieldBand(context, 724, 44, scaleRgbaAlpha(palette.mountain, 0.7), 3);
}

function drawPanoramaFieldBand(context, y, height, color, wave) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, HORIZON_TEXTURE_HEIGHT);

  for (let x = 0; x < HORIZON_WIDTH; x += 70) {
    context.lineTo(x, getFieldBandY(x, y, height, wave));
  }
  context.lineTo(HORIZON_WIDTH, getFieldBandY(HORIZON_WIDTH, y, height, wave));

  context.lineTo(HORIZON_WIDTH, HORIZON_TEXTURE_HEIGHT);
  context.closePath();
  context.fill();
}

function getFieldBandY(x, y, height, wave) {
  const offset = Math.sin((x / HORIZON_WIDTH) * Math.PI * 2 * wave) * height * 0.18;
  return y + offset;
}

function drawTreeLine(context, baseY, palette, progress) {
  const treeColor = scaleRgbaAlpha(palette.mountain, lerp(0.48, 0.26, getMiddayAmount(progress)));
  context.fillStyle = treeColor;

  for (let x = 0; x <= HORIZON_WIDTH; x += 22) {
    const normalized = x / HORIZON_WIDTH;
    const height = 5
      + Math.sin(normalized * Math.PI * 2 * 17) * 2.5
      + Math.sin(normalized * Math.PI * 2 * 41) * 1.5;
    context.beginPath();
    context.ellipse(x, baseY - height * 0.5, 8, height, 0, 0, Math.PI * 2);
    context.fill();
  }
}

function drawHorizonMist(context, palette) {
  const gradient = context.createLinearGradient(0, 470, 0, 690);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.36, scaleRgbaAlpha(palette.mist, 1.18));
  gradient.addColorStop(0.74, scaleRgbaAlpha(palette.mist, 0.58));
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 430, HORIZON_WIDTH, 300);
}

function sealPanoramaSeam(context) {
  const seamWidth = 96;
  const leftEdge = context.getImageData(0, 0, seamWidth, HORIZON_TEXTURE_HEIGHT);
  context.putImageData(leftEdge, HORIZON_WIDTH - seamWidth, 0);
}

function drawAtmosphereVignette(context, progress) {
  const alpha = lerp(0.08, 0.03, getMiddayAmount(progress));
  const gradient = context.createRadialGradient(
    SKY_WIDTH * 0.5,
    SKY_HEIGHT * 0.52,
    SKY_WIDTH * 0.18,
    SKY_WIDTH * 0.5,
    SKY_HEIGHT * 0.52,
    SKY_WIDTH * 0.66
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(35, 40, 46, ${alpha})`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, SKY_WIDTH, SKY_HEIGHT);
}

function getPalette(progress) {
  if (progress <= 0.5) {
    return mixPalettes(DAWN, NOON, progress / 0.5);
  }

  return mixPalettes(NOON, SUNSET, (progress - 0.5) / 0.5);
}

function mixPalettes(from, to, amount) {
  return {
    top: mixCssColor(from.top, to.top, amount),
    upper: mixCssColor(from.upper, to.upper, amount),
    horizon: mixCssColor(from.horizon, to.horizon, amount),
    mist: mixRgba(from.mist, to.mist, amount),
    cloud: mixRgba(from.cloud, to.cloud, amount),
    mountain: mixRgba(from.mountain, to.mountain, amount),
    fieldA: mixRgba(from.fieldA, to.fieldA, amount),
    fieldB: mixRgba(from.fieldB, to.fieldB, amount),
    fog: mixHexColor(from.fog, to.fog, amount),
  };
}

function mixCssColor(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `rgb(${Math.round(lerp(a.r, b.r, amount))}, ${Math.round(lerp(a.g, b.g, amount))}, ${Math.round(lerp(a.b, b.b, amount))})`;
}

function mixHexColor(from, to, amount) {
  const a = intToRgb(from);
  const b = intToRgb(to);
  const r = Math.round(lerp(a.r, b.r, amount));
  const g = Math.round(lerp(a.g, b.g, amount));
  const blue = Math.round(lerp(a.b, b.b, amount));
  return (r << 16) + (g << 8) + blue;
}

function mixRgba(from, to, amount) {
  const a = parseRgba(from);
  const b = parseRgba(to);
  return `rgba(${Math.round(lerp(a.r, b.r, amount))}, ${Math.round(lerp(a.g, b.g, amount))}, ${Math.round(lerp(a.b, b.b, amount))}, ${lerp(a.a, b.a, amount).toFixed(3)})`;
}

function scaleRgbaAlpha(color, alphaScale) {
  const rgba = parseRgba(color);
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${clamp(rgba.a * alphaScale, 0, 1).toFixed(3)})`;
}

function parseRgba(value) {
  const match = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return { r: 255, g: 255, b: 255, a: 1 };
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: Number(match[4]),
  };
}

function parseRgbaToHex(value) {
  const rgba = parseRgba(value);
  return (rgba.r << 16) + (rgba.g << 8) + rgba.b;
}

function hexToRgb(value) {
  const hex = value.replace("#", "");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function intToRgb(value) {
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function getMiddayAmount(progress) {
  return Math.sin(clamp(progress, 0, 1) * Math.PI);
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
