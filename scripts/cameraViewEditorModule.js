import { savePlaceCameraView } from "./apiClient.js";
import {
  parseNumberList,
  vectorToNumberArray,
  vectorToText,
} from "./vectorTextUtils.js";
import { setupControlPanWhileEditing } from "./editorControlPanModule.js";

const UPDATE_INTERVAL_MS = 120;
const EDITOR_PASSWORD = "muvi1950";

export function setupCameraViewEditor(camera) {
  if (!camera) return;

  let activeMarker = null;
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
  closeButton.addEventListener("click", () => hideEditor(panel, camera));
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
  goToViewButton.addEventListener("click", () => goToPastedView(camera, finderInput, goToViewButton));
  finder.append(finderTitle, finderInput);

  saveViewButton.type = "button";
  saveViewButton.textContent = "Guardar vista";
  saveViewButton.addEventListener("click", () => saveCurrentView(camera, activeMarker, saveViewButton));

  actions.className = "camera-view-editor-actions";
  actions.append(saveViewButton);

  finder.append(goToViewButton);

  panel.append(header, marker, currentView, actions, finder);
  document.body.appendChild(panel);
  const controlPan = setupControlPanWhileEditing(panel, camera);
  setupEditorAccessShortcut(panel, controlPan);

  document.addEventListener("marker:selected", (event) => {
    activeMarker = event.detail?.marker || null;
    const markerTitle = event.detail?.title || "sin título";
    const placeId = activeMarker?.userData.placeId;
    marker.textContent = placeId
      ? `Marcador: ${markerTitle} | DB #${placeId}`
      : `Marcador: ${markerTitle} | sin DB`;
  });

  let lastUpdate = 0;

  function update(now) {
    requestAnimationFrame(update);

    if (now - lastUpdate < UPDATE_INTERVAL_MS) return;
    lastUpdate = now;

    const cameraPosition = vectorToText(camera.position, { fixed: true });
    const controlsTarget = vectorToText(camera.userData.controls?.target, { fixed: true });

    currentViewInput.value = `position: [${cameraPosition}]\ntarget: [${controlsTarget}]`;
  }

  requestAnimationFrame(update);
}

function setupEditorAccessShortcut(panel, controlPan) {
  document.addEventListener("keydown", (event) => {
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

    const password = window.prompt("Clave del editor de vistas");
    if (password === EDITOR_PASSWORD) {
      showEditor(panel);
    }
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
    showTemporaryButtonText(button, "Elegir marcador");
    return;
  }

  const view = getCurrentCameraView(camera);

  if (!view) {
    showTemporaryButtonText(button, "Sin target");
    return;
  }

  marker.userData.cameraView = view;

  if (!marker.userData.placeId) {
    showTemporaryButtonText(button, "Sin DB");
    return;
  }

  try {
    const savedPlace = await savePlaceCameraView(marker.userData.placeId, view);
    if (savedPlace?.cameraView) {
      marker.userData.cameraView = savedPlace.cameraView;
    }
    showTemporaryButtonText(button, "Guardada DB");
  } catch (_error) {
    showTemporaryButtonText(button, "Error DB");
  }
}

function getCurrentCameraView(camera) {
  const position = vectorToNumberArray(camera.position);
  const target = vectorToNumberArray(camera.userData.controls?.target);

  return position && target ? { position, target } : null;
}

function goToPastedView(camera, input, button) {
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

