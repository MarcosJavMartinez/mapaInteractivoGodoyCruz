//modelModule
import { GLTFLoader } from "../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { LoadingManager, MeshStandardMaterial, Mesh, Vector3 } from "../vendor/three/build/three.module.js";
import { OBJLoader } from "../vendor/three/examples/jsm/loaders/OBJLoader.js";
import { getQualitySettings } from "./qualityModule.js";

const DEFAULT_MODEL_COLOR = 0xd8c9aa;
const LEGACY_CARDBOARD_COLOR = 0xc8ad7f;

export function loadModels(scene, options = {}) {
  const quality = options.quality || getQualitySettings();
  const manager = new LoadingManager();
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    options.onProgress?.(url, itemsLoaded, itemsTotal);
  };
  manager.onLoad = () => {
    options.onLoad?.();
  };
  manager.onError = (url) => {
    options.onError?.(url);
  };

  const objLoader = new OBJLoader(manager);
  const gltfLoader = new GLTFLoader(manager);
  const modelsToLoad = [
    {
      path: 'models/M00 Plaza.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 0.1, // Sin transparencia
      transparent: true, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path: 'models/M02 Bodega 1.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    }, 
    {
      path: 'models/M02 Bodega 2.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
   {
      path: 'models/M02 Bodega 3.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path: 'models/M03 Club Sirio.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 0.1, // Sin transparencia
      transparent: true, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path: 'models/M04 Casa Olaya.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    }, 
    {
      path: 'models/M05.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
   {
      path: 'models/M06.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path:'models/M07 Galpones FFRR.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
 
      },
    },
    {
      path:'models/M09 Arcanco.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },

    {
      path:'models/M16 Teatro.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/M17 HCD.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/M18 Compañia Maria 1.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/M18 Compañia Maria 2.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
{
      path: 'models/M24.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 0.1, // Sin transparencia
      transparent: true, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path: 'models/M25 Iglesia 1.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    }, 
    {
      path: 'models/M25 Iglesia 2.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
   {
      path: 'models/M25 Iglesia 3.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },
    {
      path:'models/M26.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
 
      },
    },
    {
      path:'models/M49 ECSAL.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },

    {
      path:'models/M53 Cristoforo Colombo.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/M68 Molino del Plata.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/Bloques Entorno.glb',
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
    {
      path:'models/Base.glb',
      visible: false,
      position: new Vector3(1, -2, 1),
      scale: new Vector3(0.3, 0.3, 0.3),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
   
      },
    },
];
modelsToLoad.forEach((model) => {
  if (model.visible === false) return;

  if (model.path.endsWith('.obj')) {
    objLoader.load(
      model.path,
      (object) => {
        try {
          setupObject(object, model, scene, quality);
        } catch (error) {
          console.error('Error al configurar el objeto:', error);
        }
      },
      undefined,
      (error) => {
        console.error(`Error al cargar el modelo OBJ (${model.path}):`, error);
      }
    );
  } else if (model.path.endsWith('.glb') || model.path.endsWith('.gltf')) {
    gltfLoader.load(
      model.path,
      (gltf) => {
        try {
          setupObject(gltf.scene, model, scene, quality);
        } catch (error) {
          console.error('Error al configurar el objeto:', error);
        }
      },
      undefined,
      (error) => {
        console.error(`Error al cargar el modelo GLB/GLTF (${model.path}):`, error);
      }
    );
  }
});
function setupObject(object, model, scene, quality) {
    object.scale.copy(model.scale);
    object.position.copy(model.position);
  
    const roughness = model.materialProps?.roughness === 0.8
      ? 0.86
      : model.materialProps?.roughness || 0.92;
    const metalness = model.materialProps?.metalness === 0.2
      ? 0.02
      : model.materialProps?.metalness ?? 0.03;

    const fallbackMaterial = new MeshStandardMaterial({
      roughness,
      metalness,
      color: model.materialProps?.color === LEGACY_CARDBOARD_COLOR
        ? DEFAULT_MODEL_COLOR
        : model.materialProps?.color || DEFAULT_MODEL_COLOR,
      transparent: false,
      opacity: 1,
      depthWrite: true,
    });
    const normalizedPath = model.path.toLowerCase();
    const isBaseModel = normalizedPath.includes("base");
    const isTransparentModel = false;

    object.traverse(function (child) {
      if (child.isMesh || child instanceof Mesh) {
        child.material = tuneMaterialForRealisticLight(child.material, fallbackMaterial, roughness, metalness);

        child.castShadow = quality.modelCastShadows && !isBaseModel && !isTransparentModel;
        child.receiveShadow = true;
      }
    });
    scene.add(object);
  }
}

function tuneMaterialForRealisticLight(material, fallbackMaterial, roughness, metalness) {
  if (Array.isArray(material)) {
    return material.map((item) => tuneMaterialForRealisticLight(item, fallbackMaterial, roughness, metalness));
  }

  const tunedMaterial = material?.clone ? material.clone() : fallbackMaterial.clone();

  if ("roughness" in tunedMaterial) {
    tunedMaterial.roughness = Math.max(tunedMaterial.roughness ?? roughness, roughness);
  }

  if ("metalness" in tunedMaterial) {
    tunedMaterial.metalness = Math.min(tunedMaterial.metalness ?? metalness, 0.08);
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
