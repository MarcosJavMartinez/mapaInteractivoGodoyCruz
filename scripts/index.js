import { Color, Fog, Scene } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { setupLights } from "./lightModule.js";
import { setupRenderer, setupCamera, setupResizeHandler, render } from "./renderModule.js";
import { loadModels } from "./modelModule.js";
import { createMarkers } from "./markerModule.js";
import { currentInfoPanel } from "./infoPanelModule.js";
import { setupEventListeners } from "./eventModule.js";

const buttons = [];
let scene;
let renderer;
let camera;

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  const loaderStartButton = document.querySelector(".loader-start-button");
  const helpOverlay = document.querySelector(".help-overlay");
  const helpStartButton = document.querySelector(".help-start-button");
  const aboutOverlay = document.querySelector(".about-overlay");
  const aboutOpenButton = document.querySelector(".about-open-button");
  const aboutCloseButton = document.querySelector(".about-close-button");
  loader.classList.add("active");

  loaderStartButton?.addEventListener("click", () => {
    loader.classList.remove("active");
    helpOverlay?.classList.add("active");
    helpOverlay?.setAttribute("aria-hidden", "false");
  });

  helpStartButton?.addEventListener("click", () => {
    helpOverlay?.classList.remove("active");
    helpOverlay?.setAttribute("aria-hidden", "true");
  });

  aboutOpenButton?.addEventListener("click", () => {
    aboutOverlay?.classList.add("active");
    aboutOverlay?.setAttribute("aria-hidden", "false");
  });

  aboutCloseButton?.addEventListener("click", () => {
    aboutOverlay?.classList.remove("active");
    aboutOverlay?.setAttribute("aria-hidden", "true");
  });

  renderer = setupRenderer();

  scene = new Scene();
  scene.background = new Color(0xd7e2e6);
  scene.fog = new Fog(0xd7e2e6, 240, 720);

  setupLights(scene, renderer);

  camera = setupCamera(renderer);
  setupResizeHandler(camera, renderer);

  render(scene, camera, renderer);

  const loaderStatus = document.querySelector(".loader-status");

  loadModels(scene, {
    onProgress: (_url, itemsLoaded, itemsTotal) => {
      if (!loaderStatus || !itemsTotal) return;
      const progress = Math.round((itemsLoaded / itemsTotal) * 100);
      loaderStatus.textContent = `Cargando recorrido... ${progress}%`;
    },
    onLoad: () => {
      loader.classList.add("ready");
      if (loaderStatus) {
        loaderStatus.textContent = "Recorrido listo";
      }
      if (loaderStartButton) {
        loaderStartButton.disabled = false;
      }
    },
  });
  createMarkers(scene, buttons);
  setupEventListeners(buttons, camera, currentInfoPanel);
});
