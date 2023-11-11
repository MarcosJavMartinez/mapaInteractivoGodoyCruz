import {
    AmbientLight,
    SpotLight,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
  } from "https://unpkg.com/three@0.127.0/build/three.module.js";
  
  export function setupLights(scene, renderer) {
    // Luz Ambiental
    const ambientLight = new AmbientLight(0x999998);
    scene.add(ambientLight);
  
    // Luz Spotlight
    const spotlight = new SpotLight(0xffffff);
    spotlight.position.set(0, 50, 0);
    spotlight.castShadow = true;
    spotlight.distance = 10000;
    spotlight.angle = Math.PI / 0.2;
    spotlight.penumbra = 0.2; // Sombras suaves
    spotlight.target.position.copy(new Vector3(-1, -6, 0));
    spotlight.intensity = 0.9;
  
    spotlight.shadow.mapSize.width = 8000;
    spotlight.shadow.mapSize.height = 8000;
    spotlight.shadow.bias = -0.001;
    spotlight.shadow.camera.near = 1;
    spotlight.shadow.camera.far = 20000;
    renderer.shadowMap.enabled = true;
    scene.add(spotlight);
  
    // Spotlight representación Visible
    const spotlightGeometry = new SphereGeometry(0.1, 32, 32);
    const spotlightMaterial = new MeshBasicMaterial({ color: 0xffffff });
    const spotlightMesh = new Mesh(spotlightGeometry, spotlightMaterial);
    spotlightMesh.position.copy(spotlight.position);
    scene.add(spotlightMesh);
  }