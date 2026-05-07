import { Color, Fog, Scene } from "../vendor/three/build/three.module.js";
import { setupLights } from "./lightModule.js";
import { setupRenderer, setupCamera, setupResizeHandler, render } from "./renderModule.js";
import { loadModels } from "./modelModule.js";
import { createMarkers } from "./markerModule.js";
import { currentInfoPanel } from "./infoPanelModule.js";
import { setupEventListeners } from "./eventModule.js";
import { setupQualitySelector } from "./qualityModule.js";

const buttons = [];
let scene;
let renderer;
let camera;

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  const loaderStartButton = document.querySelector(".loader-start-button");
  const helpOverlay = document.querySelector(".help-overlay");
  const helpStartButton = document.querySelector(".help-start-button");
  const helpCloseButton = document.querySelector(".help-close-button");
  const aboutOverlay = document.querySelector(".about-overlay");
  const aboutOpenButton = document.querySelector(".about-open-button");
  const aboutCloseButton = document.querySelector(".about-close-button");
  const qualitySelector = document.querySelector(".quality-selector");
  const quality = setupQualitySelector(qualitySelector, { reloadOnChange: true });
  loader.classList.add("active");
  let experienceReady = false;

  const markExperienceReady = (message = "Recorrido listo") => {
    if (experienceReady) return;
    experienceReady = true;
    loader.classList.add("ready");
    if (loaderStatus) {
      loaderStatus.textContent = message;
    }
    if (loaderStartButton) {
      loaderStartButton.disabled = false;
    }
  };

  loaderStartButton?.addEventListener("click", () => {
    loader.classList.remove("active");
    helpOverlay?.classList.add("active");
    helpOverlay?.setAttribute("aria-hidden", "false");
  });

  helpStartButton?.addEventListener("click", () => {
    helpOverlay?.classList.remove("active");
    helpOverlay?.setAttribute("aria-hidden", "true");
  });

  helpCloseButton?.addEventListener("click", () => {
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

  renderer = setupRenderer(quality);

  scene = new Scene();
  scene.background = new Color(0xd7e2e6);
  scene.fog = new Fog(0xd7e2e6, 240, 720);

  setupLights(scene, renderer, quality);

  camera = setupCamera(renderer, quality);
  setupResizeHandler(camera, renderer, quality);

  render(scene, camera, renderer, quality);

  const loaderStatus = document.querySelector(".loader-status");

  const loadingFallback = setTimeout(() => {
    markExperienceReady("Ya puedes comenzar; algunos modelos seguiran cargando.");
  }, 12000);

  createMarkers(scene, buttons);
  setupEventListeners(buttons, camera, currentInfoPanel, quality);
  markExperienceReady("Puedes comenzar; los modelos se cargaran en segundo plano.");

  setTimeout(() => {
    loadModels(scene, {
      onProgress: (_url, itemsLoaded, itemsTotal) => {
        if (!loaderStatus || !itemsTotal || experienceReady) return;
        const progress = Math.round((itemsLoaded / itemsTotal) * 100);
        loaderStatus.textContent = `Cargando recorrido... ${progress}%`;
      },
      onLoad: () => {
        clearTimeout(loadingFallback);
      },
      onError: (url) => {
        console.warn(`No se pudo cargar: ${url}`);
      },
      quality,
    });
  }, 250);
});
