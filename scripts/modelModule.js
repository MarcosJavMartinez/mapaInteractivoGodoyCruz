import { GLTFLoader } from "../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { LoadingManager, Mesh, MeshStandardMaterial, Vector3 } from "../vendor/three/build/three.module.js";
import { getQualitySettings } from "./qualityModule.js";

const DEFAULT_MODEL_COLOR = 0xd8c9aa;
const DEFAULT_MODEL_ROUGHNESS = 0.86;
const DEFAULT_MODEL_METALNESS = 0.02;
const DEFAULT_MODEL_POSITION = new Vector3(1, -2, 1);
const DEFAULT_MODEL_SCALE = new Vector3(0.3, 0.3, 0.3);

const MODEL_PATHS = [
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

export function loadModels(scene, options = {}) {
  const quality = options.quality || getQualitySettings();
  const manager = new LoadingManager();
  const gltfLoader = new GLTFLoader(manager);

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    options.onProgress?.(url, itemsLoaded, itemsTotal);
  };
  manager.onLoad = () => {
    options.onLoad?.();
  };
  manager.onError = (url) => {
    options.onError?.(url);
  };

  MODEL_PATHS.forEach((path) => {
    gltfLoader.load(
      path,
      (gltf) => {
        try {
          setupObject(gltf.scene, path, scene, quality);
        } catch (error) {
          console.error("Error al configurar el objeto:", error);
        }
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
