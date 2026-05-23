import { Color, Fog, Scene } from "../vendor/three/build/three.module.js";
import { setupLights } from "./lightModule.js";
import { setupRenderer, setupCamera, setupResizeHandler, render } from "./renderModule.js";
import { loadModels } from "./modelModule.js";
import { createMarkersFromPlaces } from "./markerModule.js";
import { setupEventListeners } from "./eventModule.js";
import { setupQualitySelector } from "./qualityModule.js";
import { setupCameraViewEditor } from "./cameraViewEditorModule.js";
import { setupMarkerEditor } from "./markerEditorModule.js";
import { setupCloudShadows } from "./cloudShadowModule.js";
import { setupEnvironment } from "./environmentModule.js";
import { setupCollisionEditor } from "./collisionEditorModule.js";
import { fetchPlaces } from "./apiClient.js";

const buttons = [];
let scene;
let renderer;
let camera;

document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.querySelector(".loader");
  const loaderStartButton = document.querySelector(".loader-start-button");
  const loaderStatus = document.querySelector(".loader-status");
  const loaderProgress = document.querySelector(".loader-progress");
  const loaderProgressBar = document.querySelector(".loader-progress-bar");
  const loaderProgressValue = document.querySelector(".loader-progress-value");
  const helpOverlay = document.querySelector(".help-overlay");
  const helpOpenButtons = document.querySelectorAll(".help-open-button");
  const helpStartButton = document.querySelector(".help-start-button");
  const helpCloseButton = document.querySelector(".help-close-button");
  const aboutOverlay = document.querySelector(".about-overlay");
  const aboutOpenButtons = document.querySelectorAll(".about-open-button");
  const aboutCloseButton = document.querySelector(".about-close-button");
  const loaderReturnButtons = document.querySelectorAll(".loader-return-button");
  const menuToggleButton = document.querySelector(".menu-toggle-button");
  const siteNav = document.querySelector(".site-nav");
  const qualitySelector = document.querySelector(".quality-selector");
  const sunSlider = document.querySelector(".sun-slider");
  const environmentToggleButtons = document.querySelectorAll(".environment-toggle-button");
  const quality = setupQualitySelector(qualitySelector, { reloadOnChange: true });

  loader?.classList.add("active");
  let canStartExperience = false;
  let emergencyReadyTimer = null;

  const setLoaderProgress = (value) => {
    const progress = Math.min(Math.max(Math.round(value), 0), 100);
    if (loaderProgressBar) {
      loaderProgressBar.style.width = `${progress}%`;
    }
    if (loaderProgressValue) {
      loaderProgressValue.textContent = `${progress}%`;
    }
    if (loaderProgress) {
      loaderProgress.setAttribute("aria-valuenow", String(progress));
    }
  };

  const markExperienceReady = (message = "Recorrido listo.") => {
    if (canStartExperience) return;
    canStartExperience = true;
    clearTimeout(emergencyReadyTimer);
    setLoaderProgress(100);
    loader?.classList.add("ready");
    if (loaderStatus) {
      loaderStatus.textContent = message;
    }
    if (loaderStartButton) {
      loaderStartButton.disabled = false;
    }
  };

  emergencyReadyTimer = setTimeout(() => {
    markExperienceReady("Ya puedes comenzar; el recorrido sigue preparando contenido.");
  }, 12000);

  setLoaderProgress(8);

  loaderStartButton?.addEventListener("click", () => {
    loader?.classList.remove("active");
    setOverlayActive(helpOverlay, true);
  });

  bindOverlayControls(helpOverlay, helpOpenButtons, [helpStartButton, helpCloseButton]);
  bindOverlayControls(aboutOverlay, aboutOpenButtons, [aboutCloseButton]);
  bindLoaderReturn(loader, loaderReturnButtons, [helpOverlay, aboutOverlay]);
  bindMobileMenu(menuToggleButton, siteNav);
  setupHelpDemo(helpOverlay);

  try {
    renderer = setupRenderer(quality);

    scene = new Scene();
    scene.background = new Color(0xd7e2e6);
    scene.fog = new Fog(0xd7e2e6, 240, 720);

    const sunController = setupLights(scene, renderer, quality);
    const environmentController = setupEnvironment(scene);
    bindEnvironmentToggle(environmentController, environmentToggleButtons);
    setupCloudShadows(scene);
    const updateSunFromSlider = () => {
      if (!sunSlider) return;
      const sunProgress = Number(sunSlider.value) / 100;
      sunController.setProgress(sunProgress);
      environmentController?.setProgress(sunProgress);
    };
    sunSlider?.addEventListener("input", updateSunFromSlider);
    updateSunFromSlider();

    camera = setupCamera(renderer, quality);
    setupResizeHandler(camera, renderer, quality);
    setupCameraViewEditor(camera);
    setupMarkerEditor(camera, scene, buttons);
    setupCollisionEditor(scene, camera, renderer);
    setupNavigationModesWhenAvailable(camera, renderer, scene);
    setupEventListeners(buttons, camera, scene, quality);
    setLoaderProgress(32);

    render(scene, camera, renderer, quality, buttons);
    setLoaderProgress(48);

    const databasePlaces = await loadDatabasePlaces(loaderStatus);
    setLoaderProgress(72);
    if (databasePlaces.length > 0) {
      createMarkersFromPlaces(scene, buttons, databasePlaces);
      setLoaderProgress(88);
      markExperienceReady("Podés comenzar; los modelos se cargarán en segundo plano.");
    } else {
      markExperienceReady("La base de datos no respondio; no hay marcadores para mostrar.");
    }

    setTimeout(() => {
      loadModels(scene, {
        onProgress: (_url, itemsLoaded, itemsTotal) => {
          if (!loaderStatus || !itemsTotal || canStartExperience) return;
          const progress = 88 + Math.round((itemsLoaded / itemsTotal) * 12);
          setLoaderProgress(progress);
          loaderStatus.textContent = `Cargando recorrido... ${Math.min(progress, 100)}%`;
        },
        onLoad: () => {
          markExperienceReady("Recorrido listo.");
        },
        onError: (url) => {
          console.warn(`No se pudo cargar: ${url}`);
        },
        quality,
      });
    }, 250);
  } catch (error) {
    console.error("No se pudo iniciar la experiencia", error);
    markExperienceReady("No se pudo cargar todo el recorrido; revisa la consola del navegador.");
  }
});

async function loadDatabasePlaces(loaderStatus) {
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve([]), 7000);
  });

  try {
    const places = await Promise.race([fetchPlaces(), timeout]);
    if (!places.length && loaderStatus) {
      loaderStatus.textContent = "Recorrido listo; la base de datos no respondio.";
    }
    return places;
  } catch (error) {
    console.warn(error);
    if (loaderStatus) {
      loaderStatus.textContent = "Recorrido listo; la base de datos no respondio.";
    }
    return [];
  }
}

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

function bindLoaderReturn(loader, buttons, overlays) {
  if (!loader) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      overlays.forEach((overlay) => setOverlayActive(overlay, false));
      loader.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
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

function bindEnvironmentToggle(environmentController, buttons) {
  if (!environmentController || !buttons.length) return;

  const setWhiteBackground = (isActive) => {
    environmentController.setWhiteBackground(isActive);
    buttons.forEach((button) => {
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.textContent = isActive ? "Ver cielo" : "Fondo blanco";
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setWhiteBackground(button.getAttribute("aria-pressed") !== "true");
    });
  });
}

async function setupNavigationModesWhenAvailable(camera, renderer, scene) {
  try {
    const module = await import("./navigationModeModule.js");
    module.setupNavigationModes(camera, renderer, scene);
  } catch (error) {
    console.warn("No se pudo iniciar el modo persona", error);
  }
}

function setupHelpDemo(helpOverlay) {
  if (!helpOverlay) return;

  const demo = helpOverlay.querySelector(".help-demo");
  const actionButtons = helpOverlay.querySelectorAll("[data-help-action]");
  if (!demo || !actionButtons.length) return;

  const setHelpAction = (activeButton) => {
    const action = activeButton.dataset.helpAction;
    demo.dataset.helpDemo = action;
    actionButtons.forEach((item) => {
      const isActive = item === activeButton;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  };

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setHelpAction(button);
    });
  });

  setHelpAction(actionButtons[0]);
}
