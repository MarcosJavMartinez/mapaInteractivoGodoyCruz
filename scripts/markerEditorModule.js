import { createPlace, deletePlace, savePlace } from "./apiClient.js";
import { createMarkerFromPlace } from "./markerModule.js";
import {
  createButton,
  createEditorSection,
  createInput,
  createTextarea,
  insertSnippet,
  showTemporaryButtonText,
} from "./markerEditorUi.js";
import {
  ClampToEdgeWrapping,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  TextureLoader,
} from "../vendor/three/build/three.module.js";
import {
  EMPTY_VECTOR_TEXT,
  numberListToText,
  parseNumberList,
  vectorToNumberArray,
  vectorToText,
} from "./vectorTextUtils.js";

const EDITOR_PASSWORD = "muvi1950";
const MARKER_MIN_Y = 0;
const MARKER_MIN_Z = -74;
const PREVIEW_MARKER_COLOR = 0x66d9ff;
const EDITOR_STAGE_IDLE = "idle";
const EDITOR_STAGE_GHOST = "ghost";
const EDITOR_STAGE_POSITION = "position";
const EDITOR_STAGE_SELECTED = "selected";
const EDITOR_STAGE_EDIT = "edit";

let previewTexture = null;

export function setupMarkerEditor(camera, scene, buttons) {
  if (!camera) return;

  let activeMarker = null;
  let isCreatingNewMarker = false;
  let isPreviewFollowingTarget = false;
  let editorStage = EDITOR_STAGE_IDLE;
  const previewMarker = createPreviewMarker();
  scene.add(previewMarker);
  const panel = document.createElement("aside");
  panel.className = "marker-editor-panel";
  panel.setAttribute("aria-label", "Editor de marcadores");
  panel.hidden = true;

  const header = document.createElement("div");
  header.className = "marker-editor-header";
  const title = document.createElement("h2");
  title.textContent = "Editor de marker";
  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button marker-editor-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => hideEditor(panel));
  header.append(title, closeButton);

  const status = document.createElement("p");
  status.className = "marker-editor-status";
  status.textContent = "Marker: ninguno";
  const workflowHelp = document.createElement("p");
  workflowHelp.className = "marker-editor-workflow";
  workflowHelp.textContent = "Crea un marker nuevo o selecciona uno del mapa.";

  const markerSection = createEditorSection("Marker", { open: true });
  const locationSection = createEditorSection("Ubicacion", { open: true });
  const contentSection = createEditorSection("Contenido");
  const gallerySection = createEditorSection("Galerias");

  const titleInput = createInput("Titulo");
  const positionInput = createInput("Coordenadas del marker");
  const cameraPreview = document.createElement("p");
  cameraPreview.className = "marker-editor-coordinate-preview";
  cameraPreview.textContent = "Punto mirado: 0, 0, 0";
  const placedPositionPreview = document.createElement("p");
  placedPositionPreview.className = "marker-editor-coordinate-preview";
  placedPositionPreview.textContent = "Punto ubicado: 0, 0, 0";
  const mainImageInput = createInput("Foto principal");
  const textInput = createTextarea("Contenido del panel", 8);
  const exteriorImagesInput = createTextarea("Fotos exteriores", 4);
  const interiorImagesInput = createTextarea("Fotos interiores", 4);
  const fields = {
    titleInput: titleInput.input,
    positionInput: positionInput.input,
    mainImageInput: mainImageInput.input,
    textInput: textInput.input,
    exteriorImagesInput: exteriorImagesInput.input,
    interiorImagesInput: interiorImagesInput.input,
    status,
  };

  const positionActions = document.createElement("div");
  positionActions.className = "marker-editor-actions";
  const newMarkerButton = createButton("Nuevo marker");
  const followTargetButton = createButton("Anclar marker");
  const updateAnchorButton = () => {
    followTargetButton.textContent = isPreviewFollowingTarget ? "Desanclar marker" : "Anclar marker";
    followTargetButton.classList.toggle("active", isPreviewFollowingTarget);
  };
  const startFollowingTarget = () => {
    isPreviewFollowingTarget = true;
    updateAnchorButton();
  };
  const stopFollowingTarget = () => {
    isPreviewFollowingTarget = false;
    updateAnchorButton();
  };
  newMarkerButton.addEventListener("click", () => {
    isCreatingNewMarker = true;
    activeMarker = null;
    startFollowingTarget();
    clearEditor(fields, camera);
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_GHOST);
  });
  positionInput.input.addEventListener("input", () => {
    if (editorStage !== EDITOR_STAGE_POSITION || !activeMarker) return;

    const position = clampMarkerPosition(parseNumberList(positionInput.input.value));
    if (position) {
      activeMarker.position.set(...position);
      updatePlacedPositionPreview(placedPositionPreview, position);
    }
  });
  followTargetButton.addEventListener("click", () => {
    if (isPreviewFollowingTarget) {
      const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
      positionInput.input.value = numberListToText(targetPosition);
      stopFollowingTarget();
    } else {
      startFollowingTarget();
    }

    previewMarker.visible = isPreviewFollowingTarget || Boolean(parseNumberList(positionInput.input.value));
  });
  positionActions.append(followTargetButton);

  const insertActions = document.createElement("div");
  insertActions.className = "marker-editor-actions marker-editor-actions-inline";
  const paragraphButton = createButton("Parrafo");
  const subtitleButton = createButton("Subtitulo");
  const sourcesButton = createButton("Fuentes");
  paragraphButton.addEventListener("click", () => insertSnippet(textInput.input, "\n<p>Nuevo parrafo.</p>\n"));
  subtitleButton.addEventListener("click", () => insertSnippet(textInput.input, "\n<h3>Subtitulo</h3>\n"));
  sourcesButton.addEventListener("click", () => insertSnippet(textInput.input, "\n<h3>Fuentes</h3>\n<ul>\n  <li>Fuente o bibliografia.</li>\n</ul>\n"));
  insertActions.append(paragraphButton, subtitleButton, sourcesButton);

  const saveActions = document.createElement("div");
  saveActions.className = "marker-editor-actions marker-editor-actions-inline";
  const saveButton = createButton("Guardar marker");
  const placeDraftButton = createButton("Ubicar");
  const cancelLocationButton = createButton("Cancelar ubicacion");
  const finishPositionButton = createButton("Crear marker");
  const editContentButton = createButton("Editar datos");
  const editPositionButton = createButton("Editar posicion");
  const cancelDraftButton = createButton("Eliminar marker");
  const cancelPositionDraftButton = createButton("Eliminar marker");
  const deselectButton = createButton("Deseleccionar");
  const deleteButton = createButton("Eliminar marker");
  const positionConfirmActions = document.createElement("div");
  positionConfirmActions.className = "marker-editor-actions marker-editor-actions-inline";
  deleteButton.className = "marker-editor-delete-button";
  cancelLocationButton.className = "marker-editor-delete-button";
  cancelDraftButton.className = "marker-editor-delete-button";
  cancelPositionDraftButton.className = "marker-editor-delete-button";
  const deleteDraftMarker = () => {
    removeMarkerFromScene(activeMarker, scene, buttons);
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    clearFields(fields, "Marker: ninguno");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_IDLE);
  };
  placeDraftButton.addEventListener("click", () => {
    const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
    const position = isPreviewFollowingTarget
      ? targetPosition
      : clampMarkerPosition(parseNumberList(positionInput.input.value));

    if (!position) {
      showTemporaryButtonText(placeDraftButton, "Revisar coords");
      return;
    }

    positionInput.input.value = numberListToText(position);
    activeMarker = createDraftMarker(scene, buttons, position);
    stopFollowingTarget();
    previewMarker.visible = false;
    updatePlacedPositionPreview(placedPositionPreview, position);
    populateEditor(activeMarker, fields);
    setWorkflowStage(EDITOR_STAGE_POSITION);
  });
  cancelLocationButton.addEventListener("click", () => {
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    previewMarker.visible = false;
    clearFields(fields, "Marker: ninguno");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_IDLE);
  });
  finishPositionButton.addEventListener("click", () => {
    const position = clampMarkerPosition(parseNumberList(positionInput.input.value));
    if (!position) {
      showTemporaryButtonText(finishPositionButton, "Revisar coords");
      return;
    }

    positionInput.input.value = numberListToText(position);
    activeMarker?.position.set(...position);
    updatePlacedPositionPreview(placedPositionPreview, position);
    stopFollowingTarget();
    setWorkflowStage(EDITOR_STAGE_EDIT);
  });
  editContentButton.addEventListener("click", () => {
    setWorkflowStage(EDITOR_STAGE_EDIT);
  });
  editPositionButton.addEventListener("click", () => {
    stopFollowingTarget();
    setWorkflowStage(EDITOR_STAGE_POSITION);
  });
  cancelDraftButton.addEventListener("click", deleteDraftMarker);
  cancelPositionDraftButton.addEventListener("click", deleteDraftMarker);
  saveButton.addEventListener("click", () => saveCurrentMarker(activeMarker, {
    ...fields,
    saveButton,
  }, { scene, buttons, camera, isCreatingNewMarker, onCreated: (marker) => {
    activeMarker = marker;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    setWorkflowStage(EDITOR_STAGE_SELECTED);
  }, onSaved: () => {
    isCreatingNewMarker = false;
    stopFollowingTarget();
    setWorkflowStage(EDITOR_STAGE_SELECTED);
  } }));
  deleteButton.addEventListener("click", () => deleteCurrentMarker(activeMarker, {
    ...fields,
    deleteButton,
  }, { scene, buttons, onDeleted: () => {
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    setWorkflowStage(EDITOR_STAGE_IDLE);
  } }));
  deselectButton.addEventListener("click", () => {
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    clearFields(fields, "Marker: ninguno");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_IDLE);
  });
  saveActions.append(
    newMarkerButton,
    placeDraftButton,
    cancelLocationButton,
    editPositionButton,
    editContentButton,
    saveButton,
    cancelDraftButton,
    deleteButton,
    deselectButton
  );
  positionConfirmActions.append(finishPositionButton, cancelPositionDraftButton);

  markerSection.body.append(status, workflowHelp, cameraPreview, positionActions, saveActions);
  locationSection.body.append(
    placedPositionPreview,
    positionInput.field,
    positionConfirmActions
  );
  contentSection.body.append(
    titleInput.field,
    mainImageInput.field,
    textInput.field,
    insertActions
  );
  gallerySection.body.append(
    exteriorImagesInput.field,
    interiorImagesInput.field
  );

  panel.append(
    header,
    markerSection.section,
    locationSection.section,
    contentSection.section,
    gallerySection.section
  );
  document.body.appendChild(panel);

  document.addEventListener("marker:selected", (event) => {
    const selectedMarker = event.detail?.marker || null;
    if (activeMarker?.userData.isDraftMarker && activeMarker !== selectedMarker) {
      removeMarkerFromScene(activeMarker, scene, buttons);
    }

    activeMarker = selectedMarker;
    isCreatingNewMarker = Boolean(activeMarker?.userData.isDraftMarker);
    stopFollowingTarget();
    populateEditor(activeMarker, fields);
    const nextStage = getSelectedMarkerStage(activeMarker, isCreatingNewMarker, editorStage);
    setWorkflowStage(nextStage);
  });

  let lastPreviewUpdate = 0;

  function updatePreview(now) {
    requestAnimationFrame(updatePreview);

    if (now - lastPreviewUpdate < 140) return;
    lastPreviewUpdate = now;

    const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
    cameraPreview.textContent = `Punto mirado: ${numberListToText(targetPosition)}`;
    if (activeMarker) {
      updatePlacedPositionPreview(placedPositionPreview, vectorToNumberArray(activeMarker.position));
    }

    if (panel.hidden) {
      previewMarker.visible = false;
      return;
    }

    if (editorStage !== EDITOR_STAGE_GHOST) {
      previewMarker.visible = false;
      return;
    }

    if (isPreviewFollowingTarget) {
      positionInput.input.value = numberListToText(targetPosition);
    }

    updatePreviewMarker(previewMarker, parseNumberList(positionInput.input.value));
  }

  requestAnimationFrame(updatePreview);

  setupEditorShortcut(panel, () => {
    populateEditor(activeMarker, fields);
    const nextStage = getSelectedMarkerStage(activeMarker, isCreatingNewMarker, editorStage);
    setWorkflowStage(nextStage);
  });

  setWorkflowStage(EDITOR_STAGE_IDLE);

  function setWorkflowStage(stage) {
    editorStage = stage;
    updateWorkflowUi({
      stage,
      isCreatingNewMarker,
      hasActiveMarker: Boolean(activeMarker),
      workflowHelp,
      sections: {
        location: locationSection.section,
        content: contentSection.section,
        gallery: gallerySection.section,
      },
      buttons: {
        newMarkerButton,
        placeDraftButton,
        cancelLocationButton,
        finishPositionButton,
        editContentButton,
        editPositionButton,
        saveButton,
        deselectButton,
        cancelDraftButton,
        cancelPositionDraftButton,
        deleteButton,
      },
      fields: {
        status,
        positionField: positionInput.field,
        cameraPreview,
        placedPositionPreview,
        positionActions,
        positionConfirmActions,
      },
    });
  }
}

function getSelectedMarkerStage(marker, isCreatingNewMarker, currentStage) {
  if (!marker) return EDITOR_STAGE_IDLE;
  if (!isCreatingNewMarker) return EDITOR_STAGE_SELECTED;
  return currentStage === EDITOR_STAGE_EDIT ? EDITOR_STAGE_EDIT : EDITOR_STAGE_POSITION;
}

function updateWorkflowUi({ stage, isCreatingNewMarker, hasActiveMarker, workflowHelp, sections, buttons, fields }) {
  const isIdle = stage === EDITOR_STAGE_IDLE;
  const isGhostStage = stage === EDITOR_STAGE_GHOST;
  const isPositionStage = stage === EDITOR_STAGE_POSITION;
  const isSelectedStage = stage === EDITOR_STAGE_SELECTED;
  const isEditStage = stage === EDITOR_STAGE_EDIT;
  const hasExistingMarker = hasActiveMarker && !isCreatingNewMarker;

  buttons.newMarkerButton.hidden = !isIdle;
  buttons.placeDraftButton.hidden = !isGhostStage;
  buttons.cancelLocationButton.hidden = !isGhostStage;
  buttons.finishPositionButton.hidden = !isPositionStage;
  buttons.editContentButton.hidden = !isSelectedStage;
  buttons.editPositionButton.hidden = !isSelectedStage;
  buttons.saveButton.hidden = !isEditStage;
  buttons.deselectButton.hidden = isIdle || isCreatingNewMarker;
  buttons.cancelDraftButton.hidden = !isCreatingNewMarker || !isEditStage;
  buttons.cancelPositionDraftButton.hidden = !isCreatingNewMarker || !isPositionStage;
  buttons.deleteButton.hidden = !hasExistingMarker;

  buttons.finishPositionButton.textContent = isCreatingNewMarker ? "Crear marker" : "Listo";
  buttons.saveButton.textContent = isCreatingNewMarker ? "Guardar marker" : "Guardar cambios";
  buttons.deselectButton.textContent = isCreatingNewMarker ? "Cancelar" : "Deseleccionar";

  sections.location.hidden = !isPositionStage;
  sections.content.hidden = !isEditStage;
  sections.gallery.hidden = !isEditStage;
  sections.location.open = isPositionStage;
  sections.content.open = isEditStage;
  sections.gallery.open = false;
  fields.status.hidden = isIdle || isGhostStage;
  fields.positionField.hidden = !isPositionStage;
  fields.cameraPreview.hidden = !isGhostStage;
  fields.placedPositionPreview.hidden = !isPositionStage;
  fields.positionActions.hidden = !isGhostStage;
  fields.positionConfirmActions.hidden = !isPositionStage;

  if (isIdle) {
    workflowHelp.textContent = "Crea un marker nuevo o selecciona uno del mapa.";
    return;
  }

  if (isGhostStage) {
    workflowHelp.textContent = "Mueve la camara y desplazate presionando Control hasta el lugar donde queres crear el marker.";
    return;
  }

  if (isPositionStage && isCreatingNewMarker) {
    workflowHelp.textContent = "Marker ubicado. Ajusta las coordenadas si hace falta, eliminalo si no sirve o crea el marker para cargar datos.";
    return;
  }

  if (isPositionStage) {
    workflowHelp.textContent = "Ajusta la posicion del marker seleccionado con coordenadas y despues pasa a editar datos.";
    return;
  }

  if (isSelectedStage) {
    workflowHelp.textContent = "Marker seleccionado: edita datos, cambia posicion o eliminalo.";
    return;
  }

  workflowHelp.textContent = isCreatingNewMarker
    ? "Completa el contenido y guarda para crear el marker en la base."
    : "Edita los datos y guarda los cambios en la base.";
}

function populateEditor(marker, fields) {
  const placeId = marker?.userData.placeId;
  fields.status.textContent = getMarkerStatusText(marker, placeId);

  fields.titleInput.value = marker?.userData.title || "";
  fields.positionInput.value = marker ? vectorToText(marker.position) : EMPTY_VECTOR_TEXT;
  fields.mainImageInput.value = marker?.userData.imageUrl || "";
  fields.textInput.value = marker?.userData.text || "";
  fields.exteriorImagesInput.value = (marker?.userData.exteriorImages || []).join("\n");
  fields.interiorImagesInput.value = (marker?.userData.interiorImages || []).join("\n");
}

async function saveCurrentMarker(marker, fields, context) {
  const title = fields.titleInput.value.trim();
  if (!title) {
    showTemporaryButtonText(fields.saveButton, "Falta titulo");
    return;
  }

  const rawPosition = parseNumberList(fields.positionInput.value);
  const position = clampMarkerPosition(rawPosition);
  if (!position) {
    showTemporaryButtonText(fields.saveButton, "Revisar coords");
    return;
  }
  fields.positionInput.value = numberListToText(position);

  const payload = {
    title,
    position,
    imageUrl: fields.mainImageInput.value,
    text: fields.textInput.value,
    exteriorImages: splitLines(fields.exteriorImagesInput.value),
    interiorImages: splitLines(fields.interiorImagesInput.value),
  };

  try {
    if (context.isCreatingNewMarker || !marker?.userData.placeId) {
      payload.cameraView = getCurrentCameraView(context.camera);
      const savedPlace = await createPlace(payload);
      const createdMarker = marker || createMarkerFromPlace(context.scene, context.buttons, savedPlace);
      syncMarker(createdMarker, savedPlace);
      context.onCreated(createdMarker);
      populateEditor(createdMarker, fields);
      showTemporaryButtonText(fields.saveButton, "Creado DB");
      return;
    }

    const savedPlace = await savePlace(marker.userData.placeId, payload);
    syncMarker(marker, savedPlace);
    populateEditor(marker, fields);
    showTemporaryButtonText(fields.saveButton, "Guardado DB");
    context.onSaved?.(marker);
  } catch (_error) {
    showTemporaryButtonText(fields.saveButton, "Error DB");
  }
}

function clearEditor(fields, camera) {
  fields.status.textContent = "Marker nuevo | sin guardar";
  fields.titleInput.value = "Nuevo marker";
  fields.positionInput.value = numberListToText(clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target)));
  fields.mainImageInput.value = "";
  fields.textInput.value = "<p>Descripcion del nuevo marker.</p>";
  fields.exteriorImagesInput.value = "";
  fields.interiorImagesInput.value = "";
}

function getCurrentCameraView(camera) {
  const target = camera.userData.controls?.target;
  if (!target) return null;

  return {
    position: [camera.position.x, camera.position.y, camera.position.z]
      .map((value) => Number(Number(value).toFixed(2))),
    target: [target.x, target.y, target.z]
      .map((value) => Number(Number(value).toFixed(2))),
  };
}

function createDraftMarker(scene, buttons, position) {
  const marker = createMarkerFromPlace(scene, buttons, {
    id: null,
    slug: null,
    title: "Nuevo marker",
    imageUrl: null,
    text: "<p>Descripcion del nuevo marker.</p>",
    exteriorImages: [],
    interiorImages: [],
    cameraView: null,
    position,
  });

  marker.userData.isDraftMarker = true;
  return marker;
}

function getMarkerStatusText(marker, placeId) {
  if (!marker) return "Marker: ninguno";
  if (!placeId || marker.userData.isDraftMarker) return "Marker ubicado | sin guardar";
  return `Marker: ${marker.userData.title || "sin titulo"} | DB #${placeId}`;
}

function syncMarker(marker, place) {
  marker.position.set(...place.position);
  marker.userData.placeId = place.id;
  marker.userData.title = place.title;
  marker.userData.imageUrl = place.imageUrl;
  marker.userData.text = place.text;
  marker.userData.exteriorImages = place.exteriorImages || [];
  marker.userData.interiorImages = place.interiorImages || [];
  marker.userData.cameraView = place.cameraView;
  marker.userData.slug = place.slug;
  marker.userData.isDraftMarker = false;
}

async function deleteCurrentMarker(marker, fields, context) {
  if (!marker?.userData.placeId) {
    showTemporaryButtonText(fields.deleteButton, "Sin DB");
    return;
  }

  const markerTitle = marker.userData.title || "sin titulo";
  const confirmed = window.confirm(`Eliminar "${markerTitle}" de SQLite y del mapa? Esta accion no se puede deshacer desde la interfaz.`);
  if (!confirmed) return;

  try {
    await deletePlace(marker.userData.placeId);
    removeMarkerFromScene(marker, context.scene, context.buttons);
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    context.onDeleted();
    clearFields(fields);
    showTemporaryButtonText(fields.deleteButton, "Eliminado");
  } catch (_error) {
    showTemporaryButtonText(fields.deleteButton, "Error DB");
  }
}

function removeMarkerFromScene(marker, scene, buttons) {
  if (!marker) return;

  scene.remove(marker);
  marker.material?.dispose?.();
  const index = buttons.indexOf(marker);
  if (index >= 0) {
    buttons.splice(index, 1);
  }
}

function clearFields(fields, statusText = "Marker eliminado") {
  fields.status.textContent = statusText;
  fields.titleInput.value = "";
  fields.positionInput.value = "";
  fields.mainImageInput.value = "";
  fields.textInput.value = "";
  fields.exteriorImagesInput.value = "";
  fields.interiorImagesInput.value = "";
}

function updatePlacedPositionPreview(preview, position) {
  preview.textContent = `Punto ubicado: ${numberListToText(position)}`;
}

function createPreviewMarker() {
  const material = new SpriteMaterial({
    map: getPreviewTexture(),
    color: PREVIEW_MARKER_COLOR,
    transparent: true,
    opacity: 0.58,
    alphaTest: 0.08,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 1001;
  sprite.frustumCulled = false;
  sprite.scale.set(2.6, 2.6, 2.6);
  sprite.visible = false;
  return sprite;
}

function updatePreviewMarker(previewMarker, position) {
  const clampedPosition = clampMarkerPosition(position);
  if (!clampedPosition) {
    previewMarker.visible = false;
    return;
  }

  previewMarker.position.set(...clampedPosition);
  previewMarker.visible = true;
}

function getPreviewTexture() {
  if (previewTexture) return previewTexture;

  previewTexture = new TextureLoader().load("images/marcador-de-alfiler-01.png");
  previewTexture.generateMipmaps = false;
  previewTexture.minFilter = LinearFilter;
  previewTexture.magFilter = LinearFilter;
  previewTexture.wrapS = ClampToEdgeWrapping;
  previewTexture.wrapT = ClampToEdgeWrapping;
  previewTexture.offset.set(0.025, 0.025);
  previewTexture.repeat.set(0.95, 0.95);
  return previewTexture;
}

function setupEditorShortcut(panel, onOpen) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      hideEditor(panel);
      return;
    }

    if (!isMarkerEditorShortcut(event)) return;

    event.preventDefault();
    if (!panel.hidden) {
      hideEditor(panel);
      return;
    }

    const password = window.prompt("Clave del editor de markers");
    if (password === EDITOR_PASSWORD) {
      onOpen();
      showEditor(panel);
    }
  });
}

function isMarkerEditorShortcut(event) {
  return event.ctrlKey
    && event.altKey
    && event.code === "KeyM";
}

function showEditor(panel) {
  panel.hidden = false;
}

function hideEditor(panel) {
  panel.hidden = true;
}

function clampMarkerPosition(position) {
  if (!position) return null;

  return [
    position[0],
    Math.max(position[1], MARKER_MIN_Y),
    Math.max(position[2], MARKER_MIN_Z),
  ];
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
