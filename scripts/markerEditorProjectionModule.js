import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
} from "../vendor/three/build/three.module.js";
import { vectorToNumberArray } from "./vectorTextUtils.js";

const PREVIEW_MARKER_COLOR = 0x66d9ff;
const PROJECTION_MARKER_COLOR = "rgba(0, 0, 0, 0.56)";
const PROJECTION_RAY_HEIGHT = 220;
const PROJECTION_RAY_DISTANCE = 360;
const PROJECTION_MARKER_SIZE = 1.65;
const PROJECTION_SURFACE_OFFSET = 0.06;
const PREVIEW_MARKER_VERTICAL_OFFSET = 1.85;

let previewTexture = null;
let projectionTexture = null;

export function createMarkerEditorProjection(scene) {
  const projection = {
    previewMarker: createPreviewMarker(),
    surfaceMarker: createProjectionMarker(),
    raycaster: new Raycaster(),
    rayOrigin: new Vector3(),
    rayDirection: new Vector3(0, -1, 0),
    planeNormal: new Vector3(0, 0, 1),
    surfaceNormal: new Vector3(0, 1, 0),
  };

  scene.add(projection.previewMarker);
  scene.add(projection.surfaceMarker);
  return projection;
}

export function hideMarkerEditorProjection(projection) {
  projection.previewMarker.visible = false;
  projection.surfaceMarker.visible = false;
}

export function setPreviewMarkerVisible(projection, isVisible) {
  projection.previewMarker.visible = Boolean(isVisible);
}

export function updatePreviewMarker(projection, position, clampPosition) {
  const clampedPosition = clampPosition(position);
  if (!clampedPosition) {
    projection.previewMarker.visible = false;
    return;
  }

  projection.previewMarker.position.set(...clampedPosition);
  projection.previewMarker.visible = true;
}

export function updateProjectionMarker({ projection, position, scene, clampPosition }) {
  const clampedPosition = clampPosition(position);
  if (!clampedPosition) {
    projection.surfaceMarker.visible = false;
    return null;
  }

  projection.rayOrigin.set(
    clampedPosition[0],
    clampedPosition[1] + PROJECTION_RAY_HEIGHT,
    clampedPosition[2],
  );
  projection.raycaster.set(projection.rayOrigin, projection.rayDirection);
  projection.raycaster.near = 0;
  projection.raycaster.far = PROJECTION_RAY_DISTANCE;

  const targets = getProjectionTargets(scene);
  const hit = intersectProjectionTargets(projection.raycaster, targets)
    .find((intersection) => intersection.object !== projection.surfaceMarker);

  if (!hit) {
    projection.surfaceMarker.visible = false;
    return null;
  }

  projection.surfaceNormal
    .copy(hit.face?.normal || projection.rayDirection)
    .transformDirection(hit.object.matrixWorld)
    .normalize();
  if (projection.surfaceNormal.dot(projection.rayDirection) > 0) {
    projection.surfaceNormal.multiplyScalar(-1);
  }

  projection.surfaceMarker.position.copy(hit.point).addScaledVector(
    projection.surfaceNormal,
    PROJECTION_SURFACE_OFFSET,
  );
  projection.surfaceMarker.quaternion.setFromUnitVectors(
    projection.planeNormal,
    projection.surfaceNormal,
  );
  projection.surfaceMarker.visible = true;

  const previewPosition = projection.surfaceMarker.position.clone();
  previewPosition.y += PREVIEW_MARKER_VERTICAL_OFFSET;
  return vectorToNumberArray(previewPosition);
}

function createPreviewMarker() {
  const material = new SpriteMaterial({
    map: getPreviewTexture(),
    color: PREVIEW_MARKER_COLOR,
    transparent: true,
    opacity: 0.58,
    alphaTest: 0.08,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 1001;
  sprite.frustumCulled = false;
  sprite.scale.set(2.6, 2.6, 2.6);
  sprite.visible = false;
  return sprite;
}

function createProjectionMarker() {
  const geometry = new PlaneGeometry(PROJECTION_MARKER_SIZE, PROJECTION_MARKER_SIZE);
  const material = new MeshBasicMaterial({
    map: getProjectionTexture(),
    transparent: true,
    opacity: 0.64,
    side: DoubleSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const marker = new Mesh(geometry, material);
  marker.renderOrder = 1002;
  marker.frustumCulled = false;
  marker.visible = false;
  marker.userData.ignoreMarkerEditorProjection = true;
  return marker;
}

function getPreviewTexture() {
  if (previewTexture) return previewTexture;

  previewTexture = new TextureLoader().load("images/marcador-de-alfiler-01.png");
  previewTexture.generateMipmaps = false;
  previewTexture.minFilter = LinearFilter;
  previewTexture.magFilter = LinearFilter;
  previewTexture.wrapS = ClampToEdgeWrapping;
  previewTexture.wrapT = ClampToEdgeWrapping;
  previewTexture.offset.set(0.025, 0.025);
  previewTexture.repeat.set(0.95, 0.95);
  return previewTexture;
}

function getProjectionTexture() {
  if (projectionTexture) return projectionTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = PROJECTION_MARKER_COLOR;
  context.lineWidth = 9;
  context.lineCap = "round";
  drawProjectionX(context);

  projectionTexture = new CanvasTexture(canvas);
  projectionTexture.generateMipmaps = false;
  projectionTexture.minFilter = LinearFilter;
  projectionTexture.magFilter = LinearFilter;
  projectionTexture.wrapS = ClampToEdgeWrapping;
  projectionTexture.wrapT = ClampToEdgeWrapping;
  return projectionTexture;
}

function drawProjectionX(context) {
  context.beginPath();
  context.moveTo(28, 28);
  context.lineTo(100, 100);
  context.moveTo(100, 28);
  context.lineTo(28, 100);
  context.stroke();
}

function getProjectionTargets(scene) {
  const targets = [];
  scene.traverse((object) => {
    if (!object.visible || !object.isMesh || object.userData.ignoreMarkerEditorProjection) return;
    targets.push(object);
  });
  return targets;
}

function intersectProjectionTargets(raycaster, targets) {
  const restoredMaterials = [];

  targets.forEach((target) => {
    const materials = Array.isArray(target.material) ? target.material : [target.material];
    materials.forEach((material) => {
      if (!material || material.side === DoubleSide) return;
      restoredMaterials.push({ material, side: material.side });
      material.side = DoubleSide;
    });
  });

  try {
    return raycaster.intersectObjects(targets, true);
  } finally {
    restoredMaterials.forEach(({ material, side }) => {
      material.side = side;
    });
  }
}
