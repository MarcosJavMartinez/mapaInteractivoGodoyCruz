import { Raycaster, Vector2 } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { showContent } from './infoPanelModule.js';

const raycaster = new Raycaster();
const mouse = new Vector2();

export function setupEventListeners(buttons, camera, currentInfoPanel) {
  document.body.addEventListener('click', (event) => onClick(event, buttons, camera, currentInfoPanel));
  document.body.addEventListener('touchstart', (event) => onTouchStart(event, buttons, camera, currentInfoPanel));
}

function onClick(event, buttons, camera, currentInfoPanel) {
  event.preventDefault();
  handleTouchEvent(event, buttons, camera, currentInfoPanel);
}

function onTouchStart(event, buttons, camera, currentInfoPanel) {
  event.preventDefault();
  handleTouchEvent(event.changedTouches[0], buttons, camera, currentInfoPanel);
}

function handleTouchEvent(event, buttons, camera, currentInfoPanel) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buttons);
  if (intersects.length > 0) {
    const button = intersects[0].object;
    const title = button.userData.title;
    const imageUrl = button.userData.imageUrl;
    const text = button.userData.text;
    const exteriorImages = button.userData.exteriorImages;
    const interiorImages = button.userData.interiorImages;
    if (title || imageUrl || text || (exteriorImages && interiorImages)) {
      showContent(title, imageUrl, text, exteriorImages, interiorImages, currentInfoPanel);
    }
  }
}