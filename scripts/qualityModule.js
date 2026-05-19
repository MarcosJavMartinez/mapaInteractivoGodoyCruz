export const QUALITY_STORAGE_KEY = "hasta1950Quality";

export const QUALITY_PRESETS = {
  performance: {
    key: "performance",
    label: "Rendimiento",
    maxPixelRatio: 1,
    targetFps: 45,
    shadowMap: "basic",
    sunShadowSize: 1024,
    modelCastShadows: false,
    pointerRaycastInterval: 120,
    rotateSpeed: 0.85,
    zoomSpeed: 1.2,
    panSpeed: 0.95,
  },
  balanced: {
    key: "balanced",
    label: "Equilibrado",
    maxPixelRatio: 1.25,
    targetFps: 60,
    shadowMap: "basic",
    sunShadowSize: 2048,
    modelCastShadows: true,
    pointerRaycastInterval: 80,
    rotateSpeed: 0.85,
    zoomSpeed: 1.15,
    panSpeed: 0.9,
  },
  high: {
    key: "high",
    label: "Alta calidad",
    maxPixelRatio: 1.5,
    targetFps: 60,
    shadowMap: "pcf-soft",
    sunShadowSize: 4096,
    modelCastShadows: true,
    pointerRaycastInterval: 40,
    rotateSpeed: 0.8,
    zoomSpeed: 1.05,
    panSpeed: 0.85,
  },
};

export function getStoredQualityKey() {
  const storedValue = readStoredQualityKey();
  return QUALITY_PRESETS[storedValue] ? storedValue : "balanced";
}

export function getQualitySettings(key = getStoredQualityKey()) {
  return QUALITY_PRESETS[key] || QUALITY_PRESETS.balanced;
}

export function setupQualitySelector(selector, options = {}) {
  if (!selector) return getQualitySettings();

  if (selector.matches("select")) {
    selector.value = getStoredQualityKey();
    selector.addEventListener("change", () => {
      saveQualitySelection(selector.value, options);
    });

    return getQualitySettings(selector.value);
  }

  return setupCustomQualitySelector(selector, options);
}

function setupCustomQualitySelector(selector, options) {
  const button = selector.querySelector(".quality-selector-button");
  const value = selector.querySelector(".quality-selector-value");
  const menu = selector.querySelector(".quality-selector-menu");
  const optionButtons = Array.from(selector.querySelectorAll(".quality-selector-option"));
  const storedQualityKey = getStoredQualityKey();

  const closeMenu = () => {
    selector.classList.remove("open");
    button?.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    selector.classList.add("open");
    button?.setAttribute("aria-expanded", "true");
    selector.querySelector(".quality-selector-option.selected")?.focus();
  };

  const setSelectedQuality = (qualityKey) => {
    const quality = getQualitySettings(qualityKey);
    selector.dataset.value = quality.key;
    if (value) {
      value.textContent = quality.label;
    }
    optionButtons.forEach((optionButton) => {
      const isSelected = optionButton.dataset.qualityValue === quality.key;
      optionButton.classList.toggle("selected", isSelected);
      optionButton.setAttribute("aria-selected", String(isSelected));
    });
  };

  setSelectedQuality(storedQualityKey);

  button?.addEventListener("click", () => {
    if (selector.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  optionButtons.forEach((optionButton) => {
    optionButton.addEventListener("click", () => {
      const nextQualityKey = optionButton.dataset.qualityValue;
      const currentQualityKey = selector.dataset.value;
      setSelectedQuality(nextQualityKey);
      closeMenu();
      if (nextQualityKey !== currentQualityKey) {
        saveQualitySelection(nextQualityKey, options);
      }
    });
  });

  selector.addEventListener("keydown", (event) => {
    if (event.target.closest(".quality-selector-option")) return;

    if (event.key === "Escape") {
      closeMenu();
      button?.focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (selector.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!selector.contains(event.target)) {
      closeMenu();
    }
  });

  return getQualitySettings(storedQualityKey);
}

function saveQualitySelection(qualityKey, options) {
  try {
    localStorage.setItem(QUALITY_STORAGE_KEY, qualityKey);
  } catch (_error) {
    // La seleccion sigue funcionando durante la sesion aunque el navegador bloquee el almacenamiento.
  }

  if (options.reloadOnChange) {
    window.location.reload();
  }
}

function readStoredQualityKey() {
  try {
    return localStorage.getItem(QUALITY_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}
