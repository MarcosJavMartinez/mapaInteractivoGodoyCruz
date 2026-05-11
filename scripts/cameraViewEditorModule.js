import { saveCameraView } from "./cameraViewStorage.js";
import { savePlaceCameraView } from "./apiClient.js";

const UPDATE_INTERVAL_MS = 120;
const EMPTY_VECTOR_TEXT = "0, 0, 0";
const EDITOR_PASSWORD = "muvi1950";

export function setupCameraViewEditor(camera) {
  if (!camera) return;

  let activeMarker = null;
  const panel = document.createElement("aside");
  panel.className = "camera-view-editor-panel";
  panel.setAttribute("aria-label", "Editor de vistas de camara");
  panel.hidden = true;

  const header = document.createElement("div");
  const closeButton = document.createElement("button");
  const title = document.createElement("strong");

  header.className = "camera-view-editor-header";
  title.textContent = "Editor de vistas";
  closeButton.className = "camera-view-editor-close";
  closeButton.type = "button";
  closeButton.textContent = "Cerrar";
  closeButton.addEventListener("click", () => hideEditor(panel));
  header.append(title, closeButton);

  const marker = document.createElement("p");
  marker.className = "camera-view-editor-marker";
  marker.textContent = "Marcador: ninguno";

  const currentView = document.createElement("div");
  const currentViewTitle = document.createElement("span");
  const position = document.createElement("p");
  const target = document.createElement("p");
  const snippet = document.createElement("code");

  currentView.className = "camera-view-editor-current";
  currentViewTitle.className = "camera-view-editor-section-title";
  currentViewTitle.textContent = "Vista actual";
  currentView.append(currentViewTitle, position, target, snippet);

  const finder = document.createElement("div");
  const finderTitle = document.createElement("span");
  const finderInput = document.createElement("textarea");
  const goToViewButton = document.createElement("button");
  const actions = document.createElement("div");
  const saveViewButton = document.createElement("button");

  finder.className = "camera-view-editor-finder";
  finderTitle.className = "camera-view-editor-section-title";
  finderTitle.textContent = "Probar vista";
  finderInput.rows = 3;
  finderInput.placeholder = "{ position: [-183, 14, 45], target: [-183, 6, 3] }";
  goToViewButton.type = "button";
  goToViewButton.textContent = "Ir a vista";
  goToViewButton.addEventListener("click", () => goToPastedView(camera, finderInput, goToViewButton));
  finder.append(finderTitle, finderInput);

  saveViewButton.type = "button";
  saveViewButton.textContent = "Guardar vista";
  saveViewButton.addEventListener("click", () => saveCurrentView(camera, activeMarker, saveViewButton));

  actions.className = "camera-view-editor-actions";
  actions.append(saveViewButton, goToViewButton);

  panel.append(header, marker, currentView, finder, actions);
  document.body.appendChild(panel);
  setupEditorAccessShortcut(panel);

  document.addEventListener("marker:selected", (event) => {
    activeMarker = event.detail?.marker || null;
    marker.textContent = `Marcador: ${event.detail?.title || "sin titulo"}`;
  });

  let lastUpdate = 0;

  function update(now) {
    requestAnimationFrame(update);

    if (now - lastUpdate < UPDATE_INTERVAL_MS) return;
    lastUpdate = now;

    const cameraPosition = vectorToArray(camera.position);
    const controlsTarget = vectorToArray(camera.userData.controls?.target);

    position.textContent = `position: [${cameraPosition}]`;
    target.textContent = `target: [${controlsTarget}]`;
    snippet.textContent = `{ position: [${cameraPosition}], target: [${controlsTarget}] }`;
  }

  requestAnimationFrame(update);
}

function setupEditorAccessShortcut(panel) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      hideEditor(panel);
      return;
    }

    if (!isEditorShortcut(event)) return;

    event.preventDefault();
    if (!panel.hidden) {
      hideEditor(panel);
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
    && event.key.toLowerCase() === "v";
}

function showEditor(panel) {
  panel.hidden = false;
}

function hideEditor(panel) {
  panel.hidden = true;
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
  if (marker.userData.placeId) {
    try {
      await savePlaceCameraView(marker.userData.placeId, view);
      showTemporaryButtonText(button, "Guardada DB");
      return;
    } catch (_error) {
      showTemporaryButtonText(button, "Local");
    }
  }

  showTemporaryButtonText(button, saveCameraView(marker.userData.title, view) ? "Guardada" : "Error");
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

function parseNumberList(value) {
  const numbers = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((number) => Number.isFinite(number));

  return numbers.length === 3 ? numbers : null;
}

function showTemporaryButtonText(button, text) {
  const originalText = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = originalText;
  }, 900);
}

function vectorToArray(vector) {
  if (!vector) return EMPTY_VECTOR_TEXT;

  return vectorToNumberArray(vector)
    .map((value) => Number(value).toFixed(2))
    .join(", ");
}

function vectorToNumberArray(vector) {
  if (!vector) return null;

  return [vector.x, vector.y, vector.z]
    .map((value) => Number(Number(value).toFixed(2)));
}
