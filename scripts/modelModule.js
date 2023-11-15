import {MeshStandardMaterial  ,Mesh, Vector3 } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OBJLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/OBJLoader.js';

export function loadModels(scene, buttons) {
  const modelsToLoad = [

    //transparente Agua
    {
      path: 'models/untitled.obj',
      position: new Vector3(3, -2, -19),
      scale: new Vector3(0.1, 0.1, 0.1),
      materialProps: {
        roughness: 1, // Reducir la rugosidad para simular vidrio
        metalness: 0.1, // Reducir la metalicidad para simular vidrio
        color: 0xC8Affff,
        opacity: 0.5, // Valor de opacidad menor para transparencia
        transparent: true, // Hacer el material transparente
        depthWrite: false, // Evitar que el material escriba en el buffer de profundidad para transparencia correcta
      },
    },
   //Carton Clasico
    {
      path: 'models/untitled.obj',
      position: new Vector3(9, 10, -19),
      scale: new Vector3(0.1, 0.1, 0.1),
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
      path: 'models/untitled.obj',
      position: new Vector3(12, 20, -19),
      scale: new Vector3(0.1, 0.1, 0.1),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0xC8Ad7f, // Color del cartón
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    },

    
    //Carton Clasico oscuro 
    {
      path: 'models/untitled.obj',
      position: new Vector3(15, 30, -19),
      scale: new Vector3(0.1, 0.1, 0.1),
      materialProps: {
      roughness: 0.8, // Aumentar la rugosidad para dar una apariencia más áspera
      metalness: 0.2, // Reducir la metalicidad para simular un material no metálico
      color: 0x5E4934, // Cambiar el color a un tono más oscuro o hacia el borde
      opacity: 1, // Sin transparencia
      transparent: false, // No transparente
      depthWrite: true, // Permitir que el material escriba en el buffer de profundidad
      },
    }
    
    
    // Agrega más objetos con sus propiedades, incluyendo opacidad si es necesario
  ];

  const loader = new OBJLoader();

  modelsToLoad.forEach((model) => {
    loader.load(model.path, (object) => {
      object.scale.copy(model.scale);
      object.position.copy(model.position);

      const modelMaterial = new MeshStandardMaterial({
        roughness: model.materialProps.roughness,
        metalness: model.materialProps.metalness,
        color: model.materialProps.color,
        transparent: model.materialProps.transparent !== undefined ? model.materialProps.transparent : true,
        opacity: model.materialProps.opacity !== undefined ? model.materialProps.opacity : 1,
        depthWrite: model.materialProps.depthWrite !== undefined ? model.materialProps.depthWrite : false,
      });

      object.traverse(function (child) {
        if (child instanceof Mesh) {
          const clonedMaterial = modelMaterial.clone();
          clonedMaterial.opacity = model.materialProps.opacity !== undefined ? model.materialProps.opacity : 1;

          child.material = clonedMaterial;
        }
      });

      scene.add(object);
      createMarkers(scene, buttons, object, model.scale);
    });
  });
}
