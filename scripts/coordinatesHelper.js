//coordinatesHelper.js
import { Vector3 } from "https://unpkg.com/three@0.127.0/build/three.module.js";

export function showCoordinatesNoMarker(event, camera) {
  const mouse = new Vector2();
  const raycaster = new Raycaster();
  const coordinates = new Vector3();

  // Calcula las coordenadas del mouse en el espacio tridimensional
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), coordinates);

  // Muestra las coordenadas en la consola
  console.log('Coordenadas en el espacio:', coordinates);
}