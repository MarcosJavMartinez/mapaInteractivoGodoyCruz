import { Color, Scene } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { setupLights } from './lightModule.js';
import { setupRenderer, setupCamera, render } from "./renderModule.js";
import { loadModels } from "./modelModule.js";
import { createMarkers } from "./markerModule.js";
import { currentInfoPanel} from './infoPanelModule.js';
import { setupEventListeners } from './eventModule.js';

const buttons = [];
const scene = new Scene();
let renderer;
let camera;

init();

function init() {
  // RENDER
  renderer = setupRenderer();

  scene.background = new Color(0x464646);
  
  // LUCES
  setupLights(scene, renderer);
  
  // CAMARA
  camera = setupCamera(renderer);
  
  // Renderización utilizando la función importada
  render(scene, camera, renderer);
  
  // CARGA ESCENA
  loadModels(scene, buttons);
  
  // Crear marcadores
  createMarkers(scene, buttons);

  // Configurar event listeners
  setupEventListeners(buttons, camera, currentInfoPanel);
}
