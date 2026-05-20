import { GLTFLoader } from "../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, LoadingManager, Mesh, MeshStandardMaterial, Vector3 } from "../vendor/three/build/three.module.js";
import { fetchCollisionOverrides } from "./apiClient.js";
import { getQualitySettings } from "./qualityModule.js";

const DEFAULT_MODEL_COLOR = 0xd8c9aa;
const DEFAULT_MODEL_ROUGHNESS = 0.86;
const DEFAULT_MODEL_METALNESS = 0.02;
const DEFAULT_MODEL_POSITION = new Vector3(1, -2, 1);
const DEFAULT_MODEL_SCALE = new Vector3(0.3, 0.3, 0.3);
const NAVIGATION_COLLIDER_PADDING = 0.18;
const NAVIGATION_MIN_FOOTPRINT = 0.55;
const NAVIGATION_MIN_HEIGHT = 0.45;
const NAVIGATION_MAX_FOOTPRINT = 95;

const NON_BLOCKING_MODEL_KEYWORDS = [
  "base",
  "bloques entorno",
  "plaza",
];

const MODEL_PATHS = [
  "models/Base.glb",
  "models/M00 Plaza.glb",
  "models/M02 Bodega 1.glb",
  "models/M02 Bodega 2.glb",
  "models/M02 Bodega 3.glb",
  "models/M03 Club Sirio.glb",
  "models/M04 Casa Olaya.glb",
  "models/M05.glb",
  "models/M06.glb",
  "models/M07 Galpones FFRR.glb",
  "models/M09 Arcanco.glb",
  "models/M16 Teatro.glb",
  "models/M17 HCD.glb",
  "models/M18 Compañia Maria 1.glb",
  "models/M18 Compañia Maria 2.glb",
  "models/M24.glb",
  "models/M25 Iglesia 1.glb",
  "models/M25 Iglesia 2.glb",
  "models/M25 Iglesia 3.glb",
  "models/M26.glb",
  "models/M49 ECSAL.glb",
  "models/M53 Cristoforo Colombo.glb",
  "models/M68 Molino del Plata.glb",
  "models/Bloques Entorno.glb",
];

let collisionOverridesPromise = null;

export function loadModels(scene, options = {}) {
  const quality = options.quality || getQualitySettings();
  const manager = new LoadingManager();
  const gltfLoader = new GLTFLoader(manager);
  const pendingSetups = [];
  scene.userData.navigationObstacles = [];
  scene.userData.navigationColliderCandidates = [];
  scene.userData.navigationCollidersReady = false;
  scene.userData.navigationCollisionOverrides = {};
  collisionOverridesPromise = loadCollisionOverrides(scene);

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    options.onProgress?.(url, itemsLoaded, itemsTotal);
  };
  manager.onLoad = async () => {
    await collisionOverridesPromise;
    await Promise.allSettled(pendingSetups);
    markNavigationCollidersReady(scene);
    options.onLoad?.();
  };
  manager.onError = (url) => {
    options.onError?.(url);
  };

  MODEL_PATHS.forEach((path) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const setup = collisionOverridesPromise.then(() => {
          try {
            setupObject(gltf.scene, path, scene, quality);
          } catch (error) {
            console.error("Error al configurar el objeto:", error);
          }
        });
        pendingSetups.push(setup);
      },
      undefined,
      (error) => {
        console.error(`Error al cargar el modelo (${path}):`, error);
      }
    );
  });
}

function setupObject(object, path, scene, quality) {
  object.scale.copy(DEFAULT_MODEL_SCALE);
  object.position.copy(DEFAULT_MODEL_POSITION);
  object.updateMatrixWorld(true);

  const fallbackMaterial = new MeshStandardMaterial({
    roughness: DEFAULT_MODEL_ROUGHNESS,
    metalness: DEFAULT_MODEL_METALNESS,
    color: DEFAULT_MODEL_COLOR,
    transparent: false,
    opacity: 1,
    depthWrite: true,
  });
  const isBaseModel = path.toLowerCase().includes("base");

  object.traverse((child) => {
    if (child.isMesh || child instanceof Mesh) {
      child.material = tuneMaterialForRealisticLight(child.material, fallbackMaterial);
      child.castShadow = quality.modelCastShadows && !isBaseModel;
      child.receiveShadow = true;
    }
  });

  scene.add(object);
  object.updateMatrixWorld(true);
  registerNavigationObstacle(object, path, scene);
}

function registerNavigationObstacle(object, path, scene) {
  const box = new Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const navigationBox = box.clone();
  navigationBox.min.x -= NAVIGATION_COLLIDER_PADDING;
  navigationBox.min.z -= NAVIGATION_COLLIDER_PADDING;
  navigationBox.max.x += NAVIGATION_COLLIDER_PADDING;
  navigationBox.max.z += NAVIGATION_COLLIDER_PADDING;

  const override = scene.userData.navigationCollisionOverrides?.[path];
  const defaultEnabled = shouldCreateNavigationObstacle(path) && isBlockingObstacle(box);
  const colliderBox = override ? boxFromOverride(override, navigationBox) : navigationBox;
  const size = colliderBox.getSize(new Vector3());
  const collider = {
    box: colliderBox,
    defaultBox: navigationBox.clone(),
    path,
    size: size.toArray(),
    enabled: typeof override?.enabled === "boolean" ? override.enabled : defaultEnabled,
    rotationY: Number.isFinite(override?.rotationY) ? override.rotationY : 0,
  };

  scene.userData.navigationColliderCandidates ||= [];
  scene.userData.navigationColliderCandidates.push(collider);
  if (collider.enabled) {
    scene.userData.navigationObstacles ||= [];
    scene.userData.navigationObstacles.push(collider);
  }
}

async function loadCollisionOverrides(scene) {
  try {
    const data = await fetchCollisionOverrides();
    scene.userData.navigationCollisionOverrides = createOverrideMap(data?.colliders);
  } catch (error) {
    console.warn("No se pudieron cargar los ajustes de colision", error);
    scene.userData.navigationCollisionOverrides = {};
  }
}

function createOverrideMap(colliders) {
  if (!Array.isArray(colliders)) return {};

  return colliders.reduce((map, collider) => {
    if (typeof collider?.path === "string" && isVectorArray(collider.min) && isVectorArray(collider.max)) {
      map[collider.path] = collider;
    }
    return map;
  }, {});
}

function boxFromOverride(override, fallbackBox) {
  const box = new Box3(
    new Vector3(override.min[0], override.min[1], override.min[2]),
    new Vector3(override.max[0], override.max[1], override.max[2])
  );

  return box.isEmpty() ? fallbackBox : box;
}

function isVectorArray(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every(Number.isFinite);
}

function isBlockingObstacle(box) {
  const size = box.getSize(new Vector3());
  const footprint = Math.max(size.x, size.z);
  const thinSide = Math.min(size.x, size.z);
  const height = size.y;

  return footprint >= NAVIGATION_MIN_FOOTPRINT
    && thinSide >= NAVIGATION_MIN_FOOTPRINT
    && height >= NAVIGATION_MIN_HEIGHT
    && footprint <= NAVIGATION_MAX_FOOTPRINT;
}

function shouldCreateNavigationObstacle(path) {
  const normalizedPath = path.toLowerCase();
  return !NON_BLOCKING_MODEL_KEYWORDS.some((keyword) => normalizedPath.includes(keyword));
}

function markNavigationCollidersReady(scene) {
  scene.userData.navigationCollidersReady = (scene.userData.navigationObstacles || []).length > 0;
  document.dispatchEvent(new CustomEvent("navigation:colliders-ready", {
    detail: {
      count: scene.userData.navigationObstacles?.length || 0,
      ready: scene.userData.navigationCollidersReady,
    },
  }));
}

function tuneMaterialForRealisticLight(material, fallbackMaterial) {
  if (Array.isArray(material)) {
    return material.map((item) => tuneMaterialForRealisticLight(item, fallbackMaterial));
  }

  const tunedMaterial = material?.clone ? material.clone() : fallbackMaterial.clone();

  if ("roughness" in tunedMaterial) {
    tunedMaterial.roughness = Math.max(tunedMaterial.roughness ?? DEFAULT_MODEL_ROUGHNESS, DEFAULT_MODEL_ROUGHNESS);
  }

  if ("metalness" in tunedMaterial) {
    tunedMaterial.metalness = Math.min(tunedMaterial.metalness ?? DEFAULT_MODEL_METALNESS, 0.08);
  }

  if (tunedMaterial.color) {
    enhanceMaterialColor(tunedMaterial.color);
  }

  tunedMaterial.opacity = 1;
  tunedMaterial.transparent = false;
  tunedMaterial.depthWrite = true;
  tunedMaterial.needsUpdate = true;

  return tunedMaterial;
}

function enhanceMaterialColor(color) {
  const hsl = {};
  color.getHSL(hsl);

  hsl.s = Math.min(hsl.s * 1.22 + 0.035, 0.72);

  if (hsl.l >= 0.52) {
    hsl.l = Math.min(hsl.l * 1.06 + 0.015, 0.82);
  } else {
    hsl.l = Math.max(hsl.l * 0.88, 0.18);
  }

  color.setHSL(hsl.h, hsl.s, hsl.l);
}
