import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  Vector3,
} from "../vendor/three/build/three.module.js";
import { saveCollisionOverrides } from "./apiClient.js";

const EDITOR_PASSWORD = "muvi1950";
const VISUAL_OFFSET_Y = 0.01;
const SLIDER_CENTER = 0;
const MOVE_RANGE = 80;
const SIZE_RANGE = 160;
const ROTATE_RANGE = 180;
const SMALL_BOX_SIZE = 8;
const SMALL_BOX_HEIGHT = 4;
const LOCAL_MOVE_AXIS = new Vector3(0, 1, 0);

export function setupCollisionEditor(scene, camera, renderer) {
  if (!scene || !camera || !renderer) return;

  const state = {
    scene,
    camera,
    renderer,
    group: createColliderGroup(),
    raycaster: new Raycaster(),
    pointer: new Vector2(),
    pointerDown: null,
    isControlPanActive: false,
    isControlDown: false,
    visuals: [],
    selectedIndex: -1,
    isOpen: false,
  };

  scene.add(state.group);

  const panel = createPanel(state);
  document.body.appendChild(panel);

  document.addEventListener("navigation:colliders-ready", () => {
    if (!state.isOpen) return;
    refreshColliderVisuals(state);
    updatePanel(panel, state);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !state.isOpen) return;
    closeEditor(panel, state);
  });

  document.addEventListener("keydown", (event) => {
    if (!isCollisionEditorShortcut(event)) return;

    event.preventDefault();
    if (state.isOpen) {
      closeEditor(panel, state);
      return;
    }

    const password = window.prompt("Clave del editor de colisiones");
    if (password !== EDITOR_PASSWORD) return;
    openEditor(panel, state);
  });

  setupColliderSelection(panel, state);
  setupControlPanWhileEditing(panel, state);
}

function createPanel(state) {
  const panel = document.createElement("aside");
  panel.className = "collision-editor-panel";
  panel.setAttribute("aria-label", "Editor de colisiones");
  panel.hidden = true;

  const header = document.createElement("div");
  header.className = "collision-editor-header";

  const title = document.createElement("h2");
  title.textContent = "Editor de colisiones";

  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button collision-editor-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => closeEditor(panel, state));

  header.append(title, closeButton);

  const status = document.createElement("p");
  status.className = "collision-editor-status";

  const details = document.createElement("p");
  details.className = "collision-editor-details";

  const modelSelectField = document.createElement("label");
  modelSelectField.className = "collision-editor-select-field";
  const modelSelectTitle = document.createElement("span");
  modelSelectTitle.textContent = "Modelo";
  const modelSelect = document.createElement("select");
  modelSelect.className = "collision-editor-select";
  modelSelect.addEventListener("change", () => {
    selectCollider(state, Number(modelSelect.value));
    updatePanel(panel, state);
  });
  modelSelectField.append(modelSelectTitle, modelSelect);

  const navigationActions = createActionRow([
    ["Anterior", () => selectRelativeCollider(panel, state, -1)],
    ["Siguiente", () => selectRelativeCollider(panel, state, 1)],
    ["Enfocar", () => focusSelectedCollider(state)],
    ["Caja chica", () => shrinkSelectedColliderToModel(panel, state)],
    ["Desactivar caja", () => toggleSelectedColliderEnabled(panel, state), "toggleEnabled"],
  ]);

  const sliders = [
    createDeltaSlider("Mover X", { min: -MOVE_RANGE, max: MOVE_RANGE, step: 0.05 }, (delta) => moveSelectedCollider(state, delta, 0)),
    createDeltaSlider("Mover Z", { min: -MOVE_RANGE, max: MOVE_RANGE, step: 0.05 }, (delta) => moveSelectedCollider(state, 0, delta)),
    createDeltaSlider("Ancho", { min: -SIZE_RANGE, max: SIZE_RANGE, step: 0.05 }, (delta) => resizeSelectedCollider(state, delta, 0)),
    createDeltaSlider("Fondo", { min: -SIZE_RANGE, max: SIZE_RANGE, step: 0.05 }, (delta) => resizeSelectedCollider(state, 0, delta)),
    createDeltaSlider("Rotar", { min: -ROTATE_RANGE, max: ROTATE_RANGE, step: 0.5, unit: "deg" }, (delta) => rotateSelectedCollider(state, degreesToRadians(delta))),
  ];

  const utilityActions = createActionRow([
    ["Fijar ajuste", () => resetSliders(panel._collisionEditor)],
    ["Guardar", () => saveCurrentColliders(panel, state), "save"],
    ["Actualizar", () => refreshColliderVisuals(state)],
    ["Ocultar mallas", () => toggleVisuals(state, panel), "toggleVisuals"],
  ]);

  panel.append(header, status, details, modelSelectField, navigationActions, ...sliders.map((item) => item.field), utilityActions);
  panel._collisionEditor = {
    status,
    details,
    modelSelect,
    sliders,
    buttons: {
      ...navigationActions.buttons,
      ...utilityActions.buttons,
    },
  };
  attachPanelRefresh(panel, state);
  return panel;
}

function createActionRow(actions) {
  const row = document.createElement("div");
  row.className = "collision-editor-actions";
  row.buttons = {};

  actions.forEach(([label, action, key]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", action);
    if (key) {
      row.buttons[key] = button;
    }
    row.append(button);
  });

  return row;
}

function createDeltaSlider(label, options, onDelta) {
  const field = document.createElement("label");
  field.className = "collision-editor-slider";

  const header = document.createElement("span");
  header.className = "collision-editor-slider-header";

  const title = document.createElement("span");
  title.textContent = label;

  const value = document.createElement("span");
  value.textContent = formatSliderValue(0, options.unit);

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(SLIDER_CENTER);

  const numberInput = document.createElement("input");
  numberInput.className = "collision-editor-number";
  numberInput.type = "number";
  numberInput.min = String(options.min);
  numberInput.max = String(options.max);
  numberInput.step = String(options.step);
  numberInput.value = String(SLIDER_CENTER);

  const controls = document.createElement("span");
  controls.className = "collision-editor-slider-controls";

  let lastValue = SLIDER_CENTER;

  const applyNextValue = (rawValue) => {
    const nextValue = clamp(Number(rawValue), options.min, options.max);
    const delta = nextValue - lastValue;
    lastValue = nextValue;
    input.value = String(nextValue);
    numberInput.value = String(nextValue);
    value.textContent = formatSliderValue(nextValue, options.unit);
    if (delta !== 0) {
      onDelta(delta);
    }
  };

  input.addEventListener("input", () => applyNextValue(input.value));
  numberInput.addEventListener("change", () => applyNextValue(numberInput.value));

  header.append(title, value);
  controls.append(input, numberInput);
  field.append(header, controls);
  return {
    field,
    input,
    numberInput,
    value,
    unit: options.unit,
    setLastValue(nextValue) {
      lastValue = nextValue;
    },
  };
}

function attachPanelRefresh(panel, state) {
  panel.addEventListener("click", () => {
    requestAnimationFrame(() => updatePanel(panel, state));
  });
  panel.addEventListener("input", () => {
    requestAnimationFrame(() => updatePanel(panel, state));
  });
}

function openEditor(panel, state) {
  state.isOpen = true;
  panel.hidden = false;
  refreshColliderVisuals(state);
  state.group.visible = true;
  if (state.selectedIndex < 0 && state.visuals.length) {
    selectCollider(state, 0);
  }
  updatePanel(panel, state);
  setCameraPanEnabled(state, state.isControlDown);
}

function closeEditor(panel, state) {
  state.isOpen = false;
  panel.hidden = true;
  state.group.visible = false;
  setCameraPanEnabled(state, false);
}

function createColliderGroup() {
  const group = new Group();
  group.name = "Editor visual de colisiones";
  group.visible = false;
  group.userData.ignoreMarkerEditorProjection = true;
  group.userData.ignoreNavigationObstacle = true;
  return group;
}

function refreshColliderVisuals(state) {
  clearColliderVisuals(state);

  const colliders = getEditableColliders(state);
  colliders.forEach((obstacle, index) => {
    const visual = createColliderVisual(obstacle, index);
    state.group.add(visual.root);
    state.visuals.push(visual);
  });

  if (!state.visuals.length) {
    state.selectedIndex = -1;
    return;
  }

  selectCollider(state, clampIndex(state.selectedIndex, state.visuals.length));
}

function clearColliderVisuals(state) {
  state.visuals.forEach(({ root, fill, edges, directionMarker }) => {
    state.group.remove(root);
    fill.geometry?.dispose();
    fill.material?.dispose();
    edges.geometry?.dispose();
    edges.material?.dispose();
    directionMarker.geometry?.dispose();
    directionMarker.material?.dispose();
  });
  state.visuals = [];
}

function createColliderVisual(obstacle, index) {
  const root = new Group();
  root.name = `Colision ${index + 1}`;
  root.userData.obstacle = obstacle;

  const fill = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({
      color: 0x2f8795,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );

  const edges = new LineSegments(
    new EdgesGeometry(new BoxGeometry(1, 1, 1)),
    new LineBasicMaterial({
      color: 0x7a145f,
      transparent: true,
      opacity: 0.78,
    })
  );
  const directionMarker = new Mesh(
    new BoxGeometry(0.12, 0.12, 1),
    new MeshBasicMaterial({
      color: 0xffd35a,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );

  fill.userData.ignoreMarkerEditorProjection = true;
  fill.userData.ignoreNavigationObstacle = true;
  edges.userData.ignoreMarkerEditorProjection = true;
  edges.userData.ignoreNavigationObstacle = true;
  directionMarker.userData.ignoreMarkerEditorProjection = true;
  directionMarker.userData.ignoreNavigationObstacle = true;
  root.add(fill, edges, directionMarker);
  const visual = { root, fill, edges, directionMarker, obstacle };
  syncVisualToBox(visual);
  return visual;
}

function syncVisualToBox(visual) {
  const center = visual.obstacle.box.getCenter(new Vector3());
  const size = visual.obstacle.box.getSize(new Vector3());
  center.y += VISUAL_OFFSET_Y;

  visual.root.position.copy(center);
  visual.root.rotation.y = visual.obstacle.rotationY || 0;
  visual.fill.scale.copy(size);
  visual.edges.scale.copy(size);
  visual.directionMarker.position.set(0, size.y * 0.52, -size.z * 0.5);
  visual.directionMarker.scale.set(1, 1, Math.max(size.z * 0.34, 0.6));
  visual.root.updateMatrixWorld(true);
}

function selectCollider(state, index) {
  if (!state.visuals.length) {
    state.selectedIndex = -1;
    return;
  }

  state.selectedIndex = clampIndex(index, state.visuals.length);
  updateColliderMaterials(state);
}

function selectRelativeCollider(panel, state, direction) {
  if (!state.visuals.length) return;

  selectCollider(state, state.selectedIndex + direction);
  updatePanel(panel, state);
}

function updateColliderMaterials(state) {
  state.visuals.forEach((visual, visualIndex) => {
    const isSelected = visualIndex === state.selectedIndex;
    const isEnabled = visual.obstacle.enabled !== false;
    visual.fill.material.color.setHex(isSelected ? 0xffd35a : (isEnabled ? 0x2f8795 : 0x7f858a));
    visual.fill.material.opacity = isSelected ? (isEnabled ? 0.32 : 0.22) : (isEnabled ? 0.18 : 0.13);
    visual.edges.material.color.setHex(isSelected ? 0xffd35a : (isEnabled ? 0x7a145f : 0x6f7478));
    visual.edges.material.opacity = isSelected ? 1 : (isEnabled ? 0.82 : 0.62);
    visual.directionMarker.visible = true;
    visual.directionMarker.material.opacity = isEnabled ? 0.92 : 0.38;
  });
}

function setupColliderSelection(panel, state) {
  const canvas = state.renderer.domElement;

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.isOpen || !state.group.visible) return;
    state.pointerDown = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!state.isOpen || !state.group.visible || !state.pointerDown) return;

    const distance = Math.hypot(event.clientX - state.pointerDown.x, event.clientY - state.pointerDown.y);
    state.pointerDown = null;
    if (distance > 4) return;

    const selectedIndex = getColliderIndexAtPointer(event, state);
    if (selectedIndex < 0) return;

    selectCollider(state, selectedIndex);
    updatePanel(panel, state);
  });
}

function getColliderIndexAtPointer(event, state) {
  const rect = state.renderer.domElement.getBoundingClientRect();
  state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  state.raycaster.setFromCamera(state.pointer, state.camera);

  const targets = state.visuals
    .filter((visual) => visual.obstacle.enabled !== false)
    .map((visual) => visual.fill);
  const hit = state.raycaster
    .intersectObjects(targets, false)
    .sort((a, b) => getColliderVolume(a.object) - getColliderVolume(b.object))[0];
  if (!hit) return -1;

  return state.visuals.findIndex((visual) => visual.fill === hit.object);
}

function getColliderVolume(object) {
  const obstacle = object?.parent?.userData?.obstacle;
  if (!obstacle?.box) return Number.POSITIVE_INFINITY;

  const size = obstacle.box.getSize(new Vector3());
  return size.x * size.y * size.z;
}

function setupControlPanWhileEditing(panel, state) {
  document.addEventListener("keydown", (event) => {
    if (event.code !== "ControlLeft" && event.code !== "ControlRight") return;
    state.isControlDown = true;
    setCameraPanEnabled(state, !panel.hidden);
  }, true);

  document.addEventListener("keyup", (event) => {
    if (event.code !== "ControlLeft" && event.code !== "ControlRight") return;
    state.isControlDown = false;
    setCameraPanEnabled(state, false);
  }, true);

  window.addEventListener("blur", () => {
    state.isControlDown = false;
    setCameraPanEnabled(state, false);
  });
}

function setCameraPanEnabled(state, isEnabled) {
  const controls = state.camera?.userData.controls;
  if (!controls) return;

  state.isControlPanActive = Boolean(isEnabled);
  controls.enablePan = state.isControlPanActive;
  if (state.isControlPanActive && controls.enabled === false) {
    controls.enabled = true;
  } else if (!state.isControlPanActive && document.body.classList.contains("navigation-mode-walk")) {
    controls.enabled = false;
  }
}

function formatSliderValue(value, unit = "") {
  const precision = unit === "deg" ? 1 : 2;
  return `${Number(value).toFixed(precision)}${unit}`;
}

function resetSliders(fields) {
  fields?.sliders?.forEach(({ input, numberInput, value, unit, setLastValue }) => {
    input.value = String(SLIDER_CENTER);
    numberInput.value = String(SLIDER_CENTER);
    setLastValue(SLIDER_CENTER);
    value.textContent = formatSliderValue(0, unit);
  });
}

function moveSelectedCollider(state, x, z) {
  const visual = getSelectedVisual(state);
  if (!visual) return;

  const movement = getLocalMoveVector(visual.obstacle, x, z);
  visual.obstacle.box.min.x += movement.x;
  visual.obstacle.box.max.x += movement.x;
  visual.obstacle.box.min.z += movement.z;
  visual.obstacle.box.max.z += movement.z;
  syncVisualToBox(visual);
}

function getLocalMoveVector(obstacle, x, z) {
  return new Vector3(x, 0, z).applyAxisAngle(LOCAL_MOVE_AXIS, obstacle.rotationY || 0);
}

function resizeSelectedCollider(state, x, z) {
  const visual = getSelectedVisual(state);
  if (!visual) return;

  const nextMinX = visual.obstacle.box.min.x - x / 2;
  const nextMaxX = visual.obstacle.box.max.x + x / 2;
  const nextMinZ = visual.obstacle.box.min.z - z / 2;
  const nextMaxZ = visual.obstacle.box.max.z + z / 2;

  if (nextMaxX - nextMinX >= 0.35) {
    visual.obstacle.box.min.x = nextMinX;
    visual.obstacle.box.max.x = nextMaxX;
  }
  if (nextMaxZ - nextMinZ >= 0.35) {
    visual.obstacle.box.min.z = nextMinZ;
    visual.obstacle.box.max.z = nextMaxZ;
  }
  syncVisualToBox(visual);
}

function rotateSelectedCollider(state, angle) {
  const visual = getSelectedVisual(state);
  if (!visual) return;

  visual.obstacle.rotationY = normalizeAngle((visual.obstacle.rotationY || 0) + angle);
  syncVisualToBox(visual);
}

function toggleSelectedColliderEnabled(panel, state) {
  const visual = getSelectedVisual(state);
  if (!visual) return;

  visual.obstacle.enabled = visual.obstacle.enabled === false;
  syncNavigationObstacles(state);
  updateColliderMaterials(state);
  updatePanel(panel, state);
}

function shrinkSelectedColliderToModel(panel, state) {
  const visual = getSelectedVisual(state);
  if (!visual) return;

  const referenceBox = visual.obstacle.defaultBox || visual.obstacle.box;
  const center = referenceBox.getCenter(new Vector3());
  const halfSize = SMALL_BOX_SIZE / 2;
  const groundY = referenceBox.min.y;
  visual.obstacle.box.min.set(center.x - halfSize, groundY, center.z - halfSize);
  visual.obstacle.box.max.set(center.x + halfSize, groundY + SMALL_BOX_HEIGHT, center.z + halfSize);
  visual.obstacle.enabled = true;
  visual.obstacle.rotationY = 0;
  syncVisualToBox(visual);
  syncNavigationObstacles(state);
  updateColliderMaterials(state);
  updatePanel(panel, state);
}

function focusSelectedCollider(state) {
  const visual = getSelectedVisual(state);
  const controls = state.camera?.userData.controls;
  if (!visual || !controls) return;

  const center = visual.obstacle.box.getCenter(new Vector3());
  const size = visual.obstacle.box.getSize(new Vector3());
  controls.target.copy(center);
  state.camera.position.set(center.x + size.x * 1.8 + 8, center.y + size.y + 8, center.z + size.z * 1.8 + 8);
  controls.update();
}

function toggleVisuals(state, panel) {
  state.group.visible = !state.group.visible;
  updatePanel(panel, state);
}

function updatePanel(panel, state) {
  const fields = panel._collisionEditor;
  if (!fields) return;

  const selected = getSelectedVisual(state);
  const enabledCount = getEditableColliders(state).filter((collider) => collider.enabled !== false).length;
  fields.status.textContent = state.visuals.length
    ? `Cajas activas: ${enabledCount}/${state.visuals.length}`
    : "Todavia no hay mallas de colision cargadas.";

  if (!selected) {
    fields.details.textContent = "Esperando modelos del recorrido.";
    return;
  }

  syncModelSelect(fields.modelSelect, state);

  const size = selected.obstacle.box.getSize(new Vector3());
  const center = selected.obstacle.box.getCenter(new Vector3());
  const rotation = radiansToDegrees(selected.obstacle.rotationY || 0);
  const enabledLabel = selected.obstacle.enabled === false ? "sin caja" : "con caja";
  fields.details.textContent = `${state.selectedIndex + 1}/${state.visuals.length} | ${getShortModelName(selected.obstacle.path)} | ${enabledLabel} | centro ${formatVector(center)} | tamano ${formatVector(size)} | rotY ${rotation.toFixed(1)}deg`;

  if (fields.buttons.toggleEnabled) {
    fields.buttons.toggleEnabled.textContent = selected.obstacle.enabled === false ? "Activar caja" : "Desactivar caja";
  }

  if (fields.buttons.toggleVisuals) {
    fields.buttons.toggleVisuals.textContent = state.group.visible ? "Ocultar mallas" : "Ver mallas";
  }
}

function syncModelSelect(select, state) {
  if (!select) return;

  if (select.options.length !== state.visuals.length) {
    select.replaceChildren(...state.visuals.map((visual, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${index + 1}. ${getShortModelName(visual.obstacle.path)} ${visual.obstacle.enabled === false ? "(sin caja)" : "(con caja)"}`;
      return option;
    }));
  } else {
    state.visuals.forEach((visual, index) => {
      const nextText = `${index + 1}. ${getShortModelName(visual.obstacle.path)} ${visual.obstacle.enabled === false ? "(sin caja)" : "(con caja)"}`;
      if (select.options[index]?.textContent !== nextText) {
        select.options[index].textContent = nextText;
      }
    });
  }

  select.value = String(state.selectedIndex);
}

async function saveCurrentColliders(panel, state) {
  const fields = panel._collisionEditor;
  const saveButton = fields?.buttons.save;
  if (!fields || !state.visuals.length) return;

  setCollisionEditorBusy(saveButton, true, "Guardando...");
  try {
    const saved = await saveCollisionOverrides(serializeColliders(getEditableColliders(state)));
    const enabledCount = saved.colliders.filter((collider) => collider.enabled !== false).length;
    fields.status.textContent = `Colisiones guardadas: ${enabledCount}/${saved.colliders.length}`;
    setCollisionEditorBusy(saveButton, false);
    showTemporaryButtonText(saveButton, "Guardado");
  } catch (error) {
    console.warn("No se pudieron guardar las colisiones", error);
    fields.status.textContent = "No se pudieron guardar las colisiones.";
    setCollisionEditorBusy(saveButton, false);
    showTemporaryButtonText(saveButton, "Error");
  }
}

function serializeColliders(obstacles) {
  return obstacles
    .filter((obstacle) => obstacle?.box && typeof obstacle.path === "string")
    .map((obstacle) => ({
      path: obstacle.path,
      min: obstacle.box.min.toArray(),
      max: obstacle.box.max.toArray(),
      enabled: obstacle.enabled !== false,
      rotationY: obstacle.rotationY || 0,
    }));
}

function getEditableColliders(state) {
  return state.scene.userData.navigationColliderCandidates || state.scene.userData.navigationObstacles || [];
}

function syncNavigationObstacles(state) {
  state.scene.userData.navigationObstacles = getEditableColliders(state)
    .filter((collider) => collider.enabled !== false);
  state.scene.userData.navigationCollidersReady = state.scene.userData.navigationObstacles.length > 0;
  document.dispatchEvent(new CustomEvent("navigation:colliders-ready", {
    detail: {
      count: state.scene.userData.navigationObstacles.length,
      ready: state.scene.userData.navigationCollidersReady,
    },
  }));
}

function setCollisionEditorBusy(button, isBusy, label) {
  if (!button) return;
  if (isBusy) {
    button.dataset.originalText = button.textContent;
    button.textContent = label;
  } else {
    button.textContent = button.dataset.originalText || "Guardar";
    delete button.dataset.originalText;
  }
  button.disabled = isBusy;
}

function showTemporaryButtonText(button, label) {
  if (!button) return;
  const originalText = button.dataset.originalText || "Guardar";
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1200);
}

function getSelectedVisual(state) {
  return state.visuals[state.selectedIndex] || null;
}

function clampIndex(index, length) {
  if (length <= 0) return -1;
  return ((index % length) + length) % length;
}

function formatVector(vector) {
  return [vector.x, vector.y, vector.z].map((value) => value.toFixed(2)).join(", ");
}

function getShortModelName(path = "sin modelo") {
  return path.split(/[\\/]/).pop() || path;
}

function isCollisionEditorShortcut(event) {
  return event.ctrlKey
    && event.altKey
    && event.shiftKey
    && event.code === "KeyC";
}

function normalizeAngle(angle) {
  const fullTurn = Math.PI * 2;
  return ((angle + Math.PI) % fullTurn + fullTurn) % fullTurn - Math.PI;
}

function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
