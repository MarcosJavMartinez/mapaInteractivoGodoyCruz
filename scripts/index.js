import { Color, Fog, Scene } from "../vendor/three/build/three.module.js";
import { setupLights } from "./lightModule.js";
import { setupRenderer, setupCamera, setupResizeHandler, render } from "./renderModule.js";
import { loadModels } from "./modelModule.js";
import { createMarkers } from "./markerModule.js";
import { setupEventListeners } from "./eventModule.js";
import { setupQualitySelector } from "./qualityModule.js";

const buttons = [];
let scene;
let renderer;
let camera;

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  const loaderStartButton = document.querySelector(".loader-start-button");
  const loaderStatus = document.querySelector(".loader-status");
  const helpOverlay = document.querySelector(".help-overlay");
  const helpOpenButtons = document.querySelectorAll(".help-open-button");
  const helpStartButton = document.querySelector(".help-start-button");
  const helpCloseButton = document.querySelector(".help-close-button");
  const aboutOverlay = document.querySelector(".about-overlay");
  const aboutOpenButtons = document.querySelectorAll(".about-open-button");
  const aboutCloseButton = document.querySelector(".about-close-button");
  const menuToggleButton = document.querySelector(".menu-toggle-button");
  const siteNav = document.querySelector(".site-nav");
  const qualitySelector = document.querySelector(".quality-selector");
  const sunSlider = document.querySelector(".sun-slider");
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
    setOverlayActive(helpOverlay, true);
  });

  bindOverlayControls(helpOverlay, helpOpenButtons, [helpStartButton, helpCloseButton]);
  bindOverlayControls(aboutOverlay, aboutOpenButtons, [aboutCloseButton]);
  bindMobileMenu(menuToggleButton, siteNav);

  renderer = setupRenderer(quality);

  scene = new Scene();
  scene.background = new Color(0xd7e2e6);
  scene.fog = new Fog(0xd7e2e6, 240, 720);

  const sunController = setupLights(scene, renderer, quality);
  const updateSunFromSlider = () => {
    if (!sunSlider) return;
    sunController.setProgress(Number(sunSlider.value) / 100);
  };
  sunSlider?.addEventListener("input", updateSunFromSlider);
  updateSunFromSlider();

  camera = setupCamera(renderer, quality);
  setupResizeHandler(camera, renderer, quality);

  render(scene, camera, renderer, quality, buttons);

  const loadingFallback = setTimeout(() => {
    markExperienceReady("Ya puedes comenzar; algunos modelos seguiran cargando.");
  }, 12000);

  createMarkers(scene, buttons);
  setupEventListeners(buttons, camera, quality);
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

function bindOverlayControls(overlay, openButtons, closeButtons) {
  openButtons.forEach((button) => {
    button.addEventListener("click", () => setOverlayActive(overlay, true));
  });

  closeButtons.forEach((button) => {
    button?.addEventListener("click", () => setOverlayActive(overlay, false));
  });
}

function setOverlayActive(overlay, isActive) {
  if (!overlay) return;

  overlay.classList.toggle("active", isActive);
  overlay.setAttribute("aria-hidden", String(!isActive));
}

function bindMobileMenu(toggleButton, nav) {
  if (!toggleButton || !nav) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    toggleButton.classList.toggle("active", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      nav.classList.remove("active");
      toggleButton.classList.remove("active");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}
