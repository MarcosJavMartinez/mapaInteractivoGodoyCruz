import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "../vendor/three/build/three.module.js";

const TEXTURE_SIZE = 256;
const SHADOW_Y = -1.52;
const SHADOW_COLOR = 0x0f1412;
const PATH_START = { x: -155, z: -92 };
const PATH_END = { x: 96, z: 116 };
const LANE_SPREAD = 82;
const PASS_DURATION_MIN = 16;
const PASS_DURATION_MAX = 28;
const FADE_IN_END = 0.16;
const FADE_OUT_START = 0.76;
const MIN_SIZE_SCALE = 0.8;
const MAX_SIZE_SCALE = 20;
const FEATURED_CLOUD_CHANCE = 0.18;
const BASE_WIDTH = 18;
const BASE_HEIGHT = 10.5;

const CLOUD_SHADOWS = [
  { opacity: 0.24, variant: 0 },
  { opacity: 0.2, variant: 1 },
  { opacity: 0.18, variant: 2 },
  { opacity: 0.16, variant: 1 },
  { opacity: 0.2, variant: 0 },
  { opacity: 0.17, variant: 2 },
  { opacity: 0.19, variant: 1 },
  { opacity: 0.16, variant: 0 },
];

const CLOUD_VARIANTS = [
  [
    [94, 130, 58, 0.72],
    [130, 108, 72, 0.62],
    [164, 132, 52, 0.55],
    [118, 154, 48, 0.5],
  ],
  [
    [82, 126, 52, 0.58],
    [126, 116, 76, 0.72],
    [172, 132, 62, 0.54],
    [148, 160, 54, 0.48],
  ],
  [
    [98, 120, 46, 0.5],
    [132, 126, 62, 0.68],
    [166, 146, 50, 0.5],
  ],
];

export function setupCloudShadows(scene) {
  const group = new Group();
  group.name = "Sombras de nubecitas";
  group.userData.ignoreMarkerEditorProjection = true;
  group.userData.ignoreNavigationObstacle = true;

  const textures = CLOUD_VARIANTS.map(createCloudShadowTexture);
  const startTime = performance.now() * 0.001;
  CLOUD_SHADOWS.forEach((cloud, index) => {
    const mesh = createCloudShadowMesh(cloud, textures[cloud.variant], index, startTime);
    group.add(mesh);
  });

  scene.add(group);
  return group;
}

function createCloudShadowMesh(cloud, texture, index, startTime) {
  const geometry = new PlaneGeometry(BASE_WIDTH, BASE_HEIGHT);
  const material = new MeshBasicMaterial({
    color: SHADOW_COLOR,
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    alphaTest: 0.01,
  });

  const mesh = new Mesh(geometry, material);
  mesh.name = `Sombra de nubecita ${index + 1}`;
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = (index % 3 - 1) * 0.08;
  mesh.renderOrder = 12 + index;
  mesh.frustumCulled = false;
  mesh.userData = {
    baseOpacity: cloud.opacity,
    passStartTime: -(index * 3.4 + randomInRange(0, 2.8)),
    ignoreMarkerEditorProjection: true,
    ignoreNavigationObstacle: true,
  };
  randomizeCloudPass(mesh, index);
  mesh.onBeforeRender = () => {
    updateCloudShadowPosition(mesh, performance.now() * 0.001 - startTime);
  };

  return mesh;
}

function updateCloudShadowPosition(mesh, elapsed) {
  if (elapsed - mesh.userData.passStartTime >= mesh.userData.passDuration) {
    mesh.userData.passStartTime = elapsed;
    randomizeCloudPass(mesh, mesh.userData.orderSeed);
  }

  const progress = (elapsed - mesh.userData.passStartTime) / mesh.userData.passDuration;
  const lane = mesh.userData.laneOffset;
  const x = lerp(PATH_START.x, PATH_END.x, progress);
  const z = lerp(PATH_START.z, PATH_END.z, progress);
  const sway = Math.sin(progress * Math.PI * 2 + mesh.userData.swayPhase) * mesh.userData.swayAmount;

  mesh.position.x = x - lane * 0.34 + sway * 0.25;
  mesh.position.z = z + lane + sway;
  mesh.position.y = SHADOW_Y + mesh.userData.heightOffset;

  mesh.material.opacity = mesh.userData.opacity * getPassFade(progress);
}

function randomizeCloudPass(mesh, seed) {
  const isFeaturedCloud = Math.random() < FEATURED_CLOUD_CHANCE;
  const scale = isFeaturedCloud
    ? randomInRange(13, MAX_SIZE_SCALE)
    : randomInRange(MIN_SIZE_SCALE, 7.4);
  const laneOffset = randomInRange(-LANE_SPREAD, LANE_SPREAD);
  const passDuration = randomInRange(PASS_DURATION_MIN, PASS_DURATION_MAX);

  mesh.scale.set(scale * randomInRange(0.9, 1.2), scale * randomInRange(0.82, 1.06), 1);
  mesh.rotation.z = randomInRange(-0.16, 0.16);
  mesh.renderOrder = 12 + Math.floor(randomInRange(0, 24));
  mesh.userData.orderSeed = seed + randomInRange(0, 100);
  mesh.userData.laneOffset = laneOffset;
  mesh.userData.passDuration = passDuration;
  mesh.userData.opacity = mesh.userData.baseOpacity * getOpacityForScale(scale);
  mesh.userData.swayAmount = randomInRange(2, 7);
  mesh.userData.swayPhase = randomInRange(0, Math.PI * 2);
  mesh.userData.heightOffset = randomInRange(0, 0.035);
}

function getOpacityForScale(scale) {
  if (scale >= MAX_SIZE_SCALE) return 0.62;
  return Math.max(0.82, 1.08 - scale * 0.035);
}

function getPassFade(progress) {
  const fadeIn = smoothStep(0, FADE_IN_END, progress);
  const fadeOut = 1 - smoothStep(FADE_OUT_START, 1, progress);
  return fadeIn * fadeOut;
}

function smoothStep(edge0, edge1, value) {
  const progress = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return progress * progress * (3 - 2 * progress);
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function createCloudShadowTexture(blobs) {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  blobs.forEach(([x, y, radius, alpha]) => {
    drawCloudBlob(context, x, y, radius, alpha);
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function drawCloudBlob(context, x, y, radius, alpha) {
  const gradient = context.createRadialGradient(x, y, radius * 0.12, x, y, radius);
  gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  gradient.addColorStop(0.55, `rgba(0, 0, 0, ${alpha * 0.36})`);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}
