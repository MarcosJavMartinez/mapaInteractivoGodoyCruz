import { requireEditorAccess, savePlaceCameraView } from "./apiClient.js";
import {
  parseNumberList,
  vectorToNumberArray,
  vectorToText,
} from "./vectorTextUtils.js";
import { setupControlPanWhileEditing } from "./editorControlPanModule.js";

const UPDATE_INTERVAL_MS = 120;
const CAMERA_VIEW_SAVE_IDLE_TEXT = "Guardar vista";
const CAMERA_VIEW_SAVE_BUSY_TEXT = "Guardando...";
const CAMERA_VIEW_SAVE_SAVED_TEXT = "\u2713 Guardado";
const CAMERA_VIEW_SAVE_ERROR_TEXT = "Revisar";

export function setupCameraViewEditor(camera) {
  if (!camera) return;

  let activeMarker = null;
  let controlPan = null;
  const panel = document.createElement("aside");
  panel.className = "camera-view-editor-panel";
  panel.setAttribute("aria-label", "Editor de vistas de cámara");
  panel.hidden = true;

  const header = document.createElement("div");
  const closeButton = document.createElement("button");
  const title = document.createElement("h2");

  header.className = "camera-view-editor-header";
  title.textContent = "Editor de vistas";
  closeButton.className = "dialog-close-button camera-view-editor-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => hideEditor(panel, controlPan));
  header.append(title, closeButton);

  const marker = document.createElement("p");
  marker.className = "camera-view-editor-marker";
  marker.textContent = "Marcador: ninguno";

  const currentView = document.createElement("div");
  const currentViewTitle = document.createElement("span");
  const currentViewInput = document.createElement("textarea");

  currentView.className = "camera-view-editor-current";
  currentViewTitle.className = "camera-view-editor-section-title";
  currentViewTitle.textContent = "Vista actual";
  currentViewInput.rows = 2;
  currentViewInput.readOnly = true;
  currentViewInput.setAttribute("aria-label", "Vista actual");
  currentView.append(currentViewTitle, currentViewInput);

  const finder = document.createElement("div");
  const finderTitle = document.createElement("span");
  const finderInput = document.createElement("textarea");
  const goToViewButton = document.createElement("button");
  const actions = document.createElement("div");
  const saveViewButton = document.createElement("button");

  finder.className = "camera-view-editor-finder";
  finderTitle.className = "camera-view-editor-section-title";
  finderTitle.textContent = "Buscar vista";
  finderInput.rows = 3;
  finderInput.placeholder = "{\nposition: [88, 14, 72.8],\ntarget: [88, 8, 30.8]\n}";
  goToViewButton.type = "button";
  goToViewButton.textContent = "Ir a vista";
  goToViewButton.addEventListener("click", () => goToPastedView(camera, finderInput, goToViewButton, saveViewButton));
  finder.append(finderTitle, finderInput);

  saveViewButton.type = "button";
  saveViewButton.textContent = CAMERA_VIEW_SAVE_IDLE_TEXT;
  saveViewButton.setAttribute("aria-live", "polite");
  saveViewButton.addEventListener("click", () => saveCurrentView(camera, activeMarker, saveViewButton));
  finderInput.addEventListener("input", () => resetCameraViewSaveButton(saveViewButton));

  actions.className = "camera-view-editor-actions";
  actions.append(saveViewButton);

  finder.append(goToViewButton);

  panel.append(header, marker, currentView, actions, finder);
  document.body.appendChild(panel);
  controlPan = setupControlPanWhileEditing(panel, camera);
  setupEditorAccessShortcut(panel, controlPan);

  document.addEventListener("marker:selected", (event) => {
    activeMarker = event.detail?.marker || null;
    resetCameraViewSaveButton(saveViewButton);
    const markerTitle = event.detail?.title || "sin título";
    const placeId = activeMarker?.userData.placeId;
    marker.textContent = placeId
      ? `Marcador: ${markerTitle} | guardado #${placeId}`
      : `Marcador: ${markerTitle} | sin guardar`;
  });
  document.addEventListener("marker:deselected", () => {
    activeMarker = null;
    marker.textContent = "Marcador: ninguno";
    resetCameraViewSaveButton(saveViewButton);
  });

  let lastUpdate = 0;

  function update(now) {
    requestAnimationFrame(update);

    if (now - lastUpdate < UPDATE_INTERVAL_MS) return;
    lastUpdate = now;

    const currentViewText = getCurrentCameraViewText(camera);

    if (currentViewInput.value !== currentViewText) {
      currentViewInput.value = currentViewText;
      resetCameraViewSaveButton(saveViewButton);
    }
  }

  requestAnimationFrame(update);
}

function setupEditorAccessShortcut(panel, controlPan) {
  document.addEventListener("keydown", async (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      hideEditor(panel, controlPan);
      return;
    }

    if (!isEditorShortcut(event)) return;

    event.preventDefault();
    if (!panel.hidden) {
      hideEditor(panel, controlPan);
      return;
    }

    if (!await requireEditorAccess("Clave de administrador")) return;
    showEditor(panel);
  });
}

function isEditorShortcut(event) {
  return event.ctrlKey
    && event.altKey
    && event.code === "KeyV";
}

function showEditor(panel) {
  panel.hidden = false;
}

function hideEditor(panel, controlPan) {
  panel.hidden = true;
  controlPan?.disable();
}

async function saveCurrentView(camera, marker, button) {
  if (!marker) {
    setCameraViewSaveButtonState(button, "error", { text: "Elegir marcador" });
    return;
  }

  const view = getCurrentCameraView(camera);

  if (!view) {
    setCameraViewSaveButtonState(button, "error", { text: "Sin vista" });
    return;
  }

  marker.userData.cameraView = view;

  if (!marker.userData.placeId) {
    setCameraViewSaveButtonState(button, "error", { text: "Sin guardar" });
    return;
  }

  try {
    setCameraViewSaveButtonState(button, "busy");
    const savedPlace = await savePlaceCameraView(marker.userData.placeId, view);
    if (savedPlace?.cameraView) {
      marker.userData.cameraView = savedPlace.cameraView;
    }
    setCameraViewSaveButtonState(button, "saved");
  } catch (_error) {
    setCameraViewSaveButtonState(button, "error", { text: "Error" });
  }
}

function getCurrentCameraView(camera) {
  const position = vectorToNumberArray(camera.position);
  const target = vectorToNumberArray(camera.userData.controls?.target);

  return position && target ? { position, target } : null;
}

function getCurrentCameraViewText(camera) {
  const cameraPosition = vectorToText(camera.position, { fixed: true });
  const controlsTarget = vectorToText(camera.userData.controls?.target, { fixed: true });

  return `position: [${cameraPosition}]\ntarget: [${controlsTarget}]`;
}

function resetCameraViewSaveButton(button) {
  if (!button || button.dataset.saveState === "busy") return;
  setCameraViewSaveButtonState(button, "idle");
}

function setCameraViewSaveButtonState(button, state, { text } = {}) {
  if (!button) return;

  const labels = {
    idle: CAMERA_VIEW_SAVE_IDLE_TEXT,
    busy: CAMERA_VIEW_SAVE_BUSY_TEXT,
    saved: CAMERA_VIEW_SAVE_SAVED_TEXT,
    error: text || CAMERA_VIEW_SAVE_ERROR_TEXT,
  };

  button.textContent = labels[state] || labels.idle;
  button.disabled = state === "busy";

  if (state === "idle") {
    delete button.dataset.saveState;
    return;
  }

  button.dataset.saveState = state;
}

function goToPastedView(camera, input, button, saveButton) {
  const view = parseCameraView(input.value);
  if (!view) {
    showTemporaryButtonText(button, "Revisar datos");
    return;
  }

  const controls = camera.userData.controls;
  camera.position.set(...view.position);

  if (controls) {
    controls.target.set(...view.target);
    controls.update();
  } else {
    camera.lookAt(...view.target);
  }

  resetCameraViewSaveButton(saveButton);
  showTemporaryButtonText(button, "Listo");
}

function parseCameraView(text) {
  const positionMatch = text.match(/position\s*:\s*\[([^\]]+)\]/i);
  const targetMatch = text.match(/target\s*:\s*\[([^\]]+)\]/i);
  if (!positionMatch || !targetMatch) return null;

  const position = parseNumberList(positionMatch[1]);
  const target = parseNumberList(targetMatch[1]);
  if (!position || !target) return null;

  return { position, target };
}

function showTemporaryButtonText(button, text) {
  const originalText = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = originalText;
  }, 900);
}

