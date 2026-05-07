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
  const storedValue = localStorage.getItem(QUALITY_STORAGE_KEY);
  return QUALITY_PRESETS[storedValue] ? storedValue : "balanced";
}

export function getQualitySettings(key = getStoredQualityKey()) {
  return QUALITY_PRESETS[key] || QUALITY_PRESETS.balanced;
}

export function setupQualitySelector(selector, options = {}) {
  if (!selector) return getQualitySettings();

  selector.value = getStoredQualityKey();
  selector.addEventListener("change", () => {
    localStorage.setItem(QUALITY_STORAGE_KEY, selector.value);
    if (options.reloadOnChange) {
      window.location.reload();
    }
  });

  return getQualitySettings(selector.value);
}
