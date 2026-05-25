import { createPlace, deletePlace, requireEditorAccess, savePlace } from "./apiClient.js";
import {
  addContentBlock,
  addImagePath,
  animateEditorPreviewSaved,
  cleanupEditorUploadedImages,
  cleanupRemovedEditorUploadedImages,
  createContentBlockList,
  createEditorPreviewPanel,
  createImageCounters,
  createImageListEditor,
  createImageDropZone,
  setupContentBlockList,
  setupImageDropZone,
  setupImageListEditor,
  stopPreviewMapGestures,
  rememberEditorImagePaths,
  syncContentBlockList,
  syncImageListEditors,
  updateContentPreview,
  updateEditorPreview,
} from "./markerEditorContentModule.js";
import { createMarkerFromPlace } from "./markerModule.js";
import { sanitizeHtml } from "./htmlSanitizer.js";
import {
  createMarkerEditorProjection,
  hideMarkerEditorProjection,
  setPreviewMarkerVisible,
  updatePreviewMarker,
  updateProjectionMarker,
} from "./markerEditorProjectionModule.js";
import {
  createButton,
  createEditorSection,
  createInput,
  createTextarea,
  showTemporaryButtonText,
} from "./markerEditorUi.js";
import {
  EMPTY_VECTOR_TEXT,
  numberListToText,
  parseNumberList,
  vectorToNumberArray,
  vectorToText,
} from "./vectorTextUtils.js";
import { setupControlPanWhileEditing } from "./editorControlPanModule.js";

const MARKER_MIN_Y = 0;
const MARKER_MIN_Z = -74;
const EDITOR_STAGE_IDLE = "idle";
const EDITOR_STAGE_GHOST = "ghost";
const EDITOR_STAGE_POSITION = "position";
const EDITOR_STAGE_SELECTED = "selected";
const EDITOR_STAGE_EDIT = "edit";
const FEEDBACK_INFO = "info";
const FEEDBACK_SUCCESS = "success";
const FEEDBACK_ERROR = "error";
const MARKER_SAVE_BUTTON_BUSY_TEXT = "Guardando...";
const MARKER_SAVE_BUTTON_CREATE_TEXT = "Creando...";
const MARKER_SAVE_BUTTON_SAVED_TEXT = "\u2713 Guardado";
const MARKER_SAVE_BUTTON_ERROR_TEXT = "Revisar";

export function setupMarkerEditor(camera, scene, buttons) {
  if (!camera) return;

  let activeMarker = null;
  let isCreatingNewMarker = false;
  let isPreviewFollowingTarget = false;
  let editorStage = EDITOR_STAGE_IDLE;
  const markerProjection = createMarkerEditorProjection(scene);
  let projectedMarkerPosition = null;
  let controlPan = null;
  let saveButton = null;
  const markEditorDirty = () => resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
  const panel = document.createElement("aside");
  panel.className = "marker-editor-panel";
  panel.setAttribute("aria-label", "Editor de marcadores");
  panel.hidden = true;

  const header = document.createElement("div");
  header.className = "marker-editor-header";
  const title = document.createElement("h2");
  title.textContent = "Editor de marcadores";
  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button marker-editor-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => {
    controlPan?.disable();
    hideEditor(panel);
  });
  header.append(title, closeButton);

  const status = document.createElement("p");
  status.className = "marker-editor-status";
  status.textContent = "Sin marcador seleccionado";
  const workflowHelp = document.createElement("p");
  workflowHelp.className = "marker-editor-workflow";
  workflowHelp.textContent = "Crea un marcador nuevo o selecciona uno del mapa.";
  const feedback = document.createElement("p");
  feedback.className = "marker-editor-feedback";
  feedback.setAttribute("aria-live", "polite");
  feedback.hidden = true;

  const markerSection = createEditorSection("Marcador", { open: true });
  const locationSection = createEditorSection("Ubicacion", { open: true });
  const contentSection = createEditorSection("Contenido");
  const gallerySection = createEditorSection("Galerias");

  const titleInput = createInput("Titulo");
  const positionInput = createInput("Ubicacion exacta");
  const cameraPreview = document.createElement("p");
  cameraPreview.className = "marker-editor-coordinate-preview";
  cameraPreview.textContent = "Lugar actual: 0, 0, 0";
  const placedPositionPreview = document.createElement("p");
  placedPositionPreview.className = "marker-editor-coordinate-preview";
  placedPositionPreview.textContent = "Lugar elegido: 0, 0, 0";
  const mainImageInput = createInput("Foto principal");
  mainImageInput.input.placeholder = "images/carpeta/foto.jpg";
  const imageDraftInput = createInput("Foto nueva");
  imageDraftInput.input.placeholder = "Tambien podes pegar una ruta de foto.";
  const mainImageDropZone = createImageDropZone("Soltá una foto principal");
  const exteriorImagesDropZone = createImageDropZone("Soltá fotos exteriores");
  const interiorImagesDropZone = createImageDropZone("Soltá fotos interiores");
  const imageCounters = createImageCounters();
  const contentDraftInput = createTextarea("Texto nuevo", 4);
  contentDraftInput.input.placeholder = "Escribi el texto y elegi como agregarlo.";
  const contentPreview = document.createElement("div");
  contentPreview.className = "marker-editor-content-preview";
  contentPreview.textContent = "Todavía no hay contenido.";
  const contentBlockList = createContentBlockList();
  const textInput = createTextarea("Edicion avanzada", 8);
  textInput.field.classList.add("marker-editor-advanced-field");
  const exteriorImagesInput = createTextarea("Fotos exteriores", 4);
  exteriorImagesInput.input.placeholder = "Una ruta de imagen por linea.";
  const interiorImagesInput = createTextarea("Fotos interiores", 4);
  interiorImagesInput.input.placeholder = "Una ruta de imagen por linea.";
  mainImageInput.field.classList.add("marker-editor-advanced-field");
  const mainImageList = createImageListEditor("foto principal");
  const exteriorImageList = createImageListEditor("fotos exteriores");
  const interiorImageList = createImageListEditor("fotos interiores");
  const fields = {
    titleInput: titleInput.input,
    positionInput: positionInput.input,
    mainImageInput: mainImageInput.input,
    imageDraftInput: imageDraftInput.input,
    contentDraftInput: contentDraftInput.input,
    contentPreview,
    contentBlockList,
    textInput: textInput.input,
    exteriorImagesInput: exteriorImagesInput.input,
    interiorImagesInput: interiorImagesInput.input,
    imageCounters,
    imageListEditors: {
      main: mainImageList,
      exterior: exteriorImageList,
      interior: interiorImageList,
    },
    status,
    feedback,
  };
  const previewPanel = createEditorPreviewPanel();
  stopPreviewMapGestures(previewPanel.panel);
  document.body.appendChild(previewPanel.panel);
  fields.previewPanel = previewPanel;
  titleInput.input.addEventListener("input", () => {
    markEditorDirty();
    if (titleInput.input.value.trim()) {
      clearFieldInvalid(titleInput.input);
    }
    updateEditorPreview(fields);
  });
  mainImageInput.input.addEventListener("input", () => {
    markEditorDirty();
    syncImageListEditors(fields);
    updateEditorPreview(fields);
  });
  mainImageInput.input.addEventListener("change", () => {
    cleanupRemovedEditorUploadedImages(fields);
  });
  exteriorImagesInput.input.addEventListener("input", () => {
    markEditorDirty();
    syncImageListEditors(fields);
    updateEditorPreview(fields);
  });
  exteriorImagesInput.input.addEventListener("change", () => {
    cleanupRemovedEditorUploadedImages(fields);
  });
  interiorImagesInput.input.addEventListener("input", () => {
    markEditorDirty();
    syncImageListEditors(fields);
    updateEditorPreview(fields);
  });
  interiorImagesInput.input.addEventListener("change", () => {
    cleanupRemovedEditorUploadedImages(fields);
  });
  setupContentBlockList({
    list: contentBlockList,
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });
  setupImageListEditor({
    list: mainImageList,
    type: "main",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });
  setupImageListEditor({
    list: exteriorImageList,
    type: "exterior",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });
  setupImageListEditor({
    list: interiorImageList,
    type: "interior",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });

  const positionActions = document.createElement("div");
  positionActions.className = "marker-editor-actions";
  const newMarkerButton = createButton("Nuevo marcador");
  const followTargetButton = createButton("Seguir vista");
  const updateAnchorButton = () => {
    followTargetButton.textContent = isPreviewFollowingTarget ? "Usar este lugar" : "Seguir vista";
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
  const stopFollowingTargetForManualPosition = () => {
    if (!isPreviewFollowingTarget) return;

    stopFollowingTarget();
    setPreviewMarkerVisible(markerProjection, Boolean(parseNumberList(positionInput.input.value)));
    setFeedback(fields, "Editá la ubicación manualmente o tocá Seguir vista para volver a tomarla.");
  };
  const getPositionFromCurrentTarget = () => {
    const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
    if (!targetPosition) return null;

    projectedMarkerPosition = updateProjectionMarker({
      projection: markerProjection,
      position: targetPosition,
      scene,
      clampPosition: clampMarkerPosition,
    });
    updatePreviewMarker(markerProjection, projectedMarkerPosition || targetPosition, clampMarkerPosition);
    return projectedMarkerPosition || targetPosition;
  };
  newMarkerButton.addEventListener("click", () => {
    isCreatingNewMarker = true;
    activeMarker = null;
    resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
    startFollowingTarget();
    clearEditor(fields, camera);
    setFeedback(fields, "Mové la vista hasta el lugar elegido y tocá Ubicar acá.");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_GHOST);
  });
  positionInput.input.addEventListener("focus", stopFollowingTargetForManualPosition);
  positionInput.input.addEventListener("input", () => {
    stopFollowingTargetForManualPosition();
    markEditorDirty();
    const position = clampMarkerPosition(parseNumberList(positionInput.input.value));
    setFieldInvalid(positionInput.input, !position);
    if (editorStage !== EDITOR_STAGE_POSITION || !activeMarker) return;

    if (position) {
      activeMarker.position.set(...position);
      updatePlacedPositionPreview(placedPositionPreview, position);
    }
  });
  followTargetButton.addEventListener("click", () => {
    if (isPreviewFollowingTarget) {
      const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
      positionInput.input.value = numberListToText(projectedMarkerPosition || targetPosition);
      stopFollowingTarget();
      setFeedback(fields, "Lugar elegido. Ahora tocá Ubicar acá.");
    } else {
      startFollowingTarget();
      setFeedback(fields, "La marca vuelve a seguir la vista.");
    }

    setPreviewMarkerVisible(markerProjection, isPreviewFollowingTarget || Boolean(parseNumberList(positionInput.input.value)));
  });
  positionActions.append(followTargetButton);

  const insertActions = document.createElement("div");
  insertActions.className = "marker-editor-actions marker-editor-actions-inline";
  const subtitleButton = createButton("Agregar subtítulo");
  const paragraphButton = createButton("Agregar párrafo");
  const sourcesButton = createButton("Agregar fuente");
  const addDraftContentBlock = (type) => {
    const didChange = addContentBlock({
      type,
      draftInput: contentDraftInput.input,
      textInput: textInput.input,
      preview: contentPreview,
      fields,
      setFeedback,
    });
    if (didChange) markEditorDirty();
  };
  subtitleButton.addEventListener("click", () => addDraftContentBlock("subtitle"));
  paragraphButton.addEventListener("click", () => addDraftContentBlock("paragraph"));
  sourcesButton.addEventListener("click", () => addDraftContentBlock("source"));
  insertActions.append(subtitleButton, paragraphButton, sourcesButton);
  textInput.input.addEventListener("input", () => {
    markEditorDirty();
    syncContentBlockList(fields);
    updateContentPreview(contentPreview, textInput.input.value);
    updateEditorPreview(fields);
  });
  contentDraftInput.input.addEventListener("input", markEditorDirty);
  imageDraftInput.input.addEventListener("input", markEditorDirty);

  const advancedContentSection = createEditorSection("Avanzado");
  advancedContentSection.section.classList.add("marker-editor-advanced-section");
  advancedContentSection.body.append(textInput.field);

  const imageActions = document.createElement("div");
  imageActions.className = "marker-editor-actions marker-editor-actions-inline";
  const mainImageButton = createButton("Usar principal");
  const exteriorImageButton = createButton("Agregar exterior");
  const interiorImageButton = createButton("Agregar interior");
  const addDraftImagePath = (type) => {
    const didChange = addImagePath({
      type,
      draftInput: imageDraftInput.input,
      fields,
      setFeedback,
    });
    if (didChange) markEditorDirty();
  };
  mainImageButton.addEventListener("click", () => addDraftImagePath("main"));
  exteriorImageButton.addEventListener("click", () => addDraftImagePath("exterior"));
  interiorImageButton.addEventListener("click", () => addDraftImagePath("interior"));
  imageActions.append(mainImageButton, exteriorImageButton, interiorImageButton);
  setupImageDropZone({
    dropZone: mainImageDropZone,
    type: "main",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });
  setupImageDropZone({
    dropZone: exteriorImagesDropZone,
    type: "exterior",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });
  setupImageDropZone({
    dropZone: interiorImagesDropZone,
    type: "interior",
    fields,
    setFeedback,
    onDirty: markEditorDirty,
  });

  const advancedGallerySection = createEditorSection("Listas");
  advancedGallerySection.section.classList.add("marker-editor-advanced-section");
  advancedGallerySection.body.append(mainImageInput.field, exteriorImagesInput.field, interiorImagesInput.field);

  const saveActions = document.createElement("div");
  saveActions.className = "marker-editor-actions marker-editor-actions-inline";
  saveButton = createButton("Guardar");
  saveButton.setAttribute("aria-live", "polite");
  const placeDraftButton = createButton("Ubicar acá");
  const cancelLocationButton = createButton("Cancelar");
  const finishPositionButton = createButton("Confirmar lugar");
  const editContentButton = createButton("Editar contenido");
  const editPositionButton = createButton("Mover");
  const cancelDraftButton = createButton("Eliminar");
  const cancelPositionDraftButton = createButton("Eliminar");
  const deselectButton = createButton("Deseleccionar");
  const deleteButton = createButton("Eliminar");
  const positionConfirmActions = document.createElement("div");
  positionConfirmActions.className = "marker-editor-actions marker-editor-actions-inline";
  deleteButton.className = "marker-editor-delete-button";
  cancelLocationButton.className = "marker-editor-delete-button";
  cancelDraftButton.className = "marker-editor-delete-button";
  cancelPositionDraftButton.className = "marker-editor-delete-button";
  const deleteDraftMarker = () => {
    cleanupEditorUploadedImages(fields);
    removeMarkerFromScene(activeMarker, scene, buttons);
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    clearFields(fields, "Sin marcador seleccionado");
    setFeedback(fields, "Marcador descartado.");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_IDLE);
  };
  placeDraftButton.addEventListener("click", () => {
    const position = isPreviewFollowingTarget
      ? getPositionFromCurrentTarget()
      : clampMarkerPosition(parseNumberList(positionInput.input.value));

    if (!position) {
      setFieldInvalid(positionInput.input, true);
      setFeedback(fields, "No se pudo tomar ese lugar. Proba mover un poco la vista.", FEEDBACK_ERROR);
      showTemporaryButtonText(placeDraftButton, "Revisar");
      return;
    }

    setFieldInvalid(positionInput.input, false);
    positionInput.input.value = numberListToText(position);
    activeMarker = createDraftMarker(scene, buttons, position);
    stopFollowingTarget();
    hideMarkerEditorProjection(markerProjection);
    updatePlacedPositionPreview(placedPositionPreview, position);
    populateEditor(activeMarker, fields);
    setFeedback(fields, "Marcador ubicado. Toca Confirmar lugar para seguir.");
    setWorkflowStage(EDITOR_STAGE_POSITION);
  });
  cancelLocationButton.addEventListener("click", () => {
    activeMarker = null;
    isCreatingNewMarker = false;
    stopFollowingTarget();
    hideMarkerEditorProjection(markerProjection);
    clearFields(fields, "Sin marcador seleccionado");
    setFeedback(fields, "Marcador cancelado.");
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    setWorkflowStage(EDITOR_STAGE_IDLE);
  });
  finishPositionButton.addEventListener("click", () => {
    const position = isPreviewFollowingTarget
      ? getPositionFromCurrentTarget()
      : clampMarkerPosition(parseNumberList(positionInput.input.value));
    if (!position) {
      setFieldInvalid(positionInput.input, true);
      setFeedback(fields, "No se pudo usar ese lugar. Proba mover un poco la vista.", FEEDBACK_ERROR);
      showTemporaryButtonText(finishPositionButton, "Revisar");
      return;
    }

    setFieldInvalid(positionInput.input, false);
    positionInput.input.value = numberListToText(position);
    activeMarker?.position.set(...position);
    updatePlacedPositionPreview(placedPositionPreview, position);
    stopFollowingTarget();
    markEditorDirty();
    setFeedback(fields, isCreatingNewMarker
      ? "Lugar confirmado. Completa los datos y toca Guardar."
      : "Lugar actualizado. Guarda para aplicar el cambio.",
    FEEDBACK_SUCCESS);
    setWorkflowStage(EDITOR_STAGE_EDIT);
  });
  editContentButton.addEventListener("click", () => {
    resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
    setFeedback(fields, "Completa o cambia los datos y toca Guardar.");
    setWorkflowStage(EDITOR_STAGE_EDIT);
  });
  editPositionButton.addEventListener("click", () => {
    resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
    startFollowingTarget();
    setFeedback(fields, "Mueve la vista hasta el nuevo lugar y confirma.");
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
    clearFields(fields, "Sin marcador seleccionado");
    resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
    clearFeedback(fields);
    updateEditorPreview(fields);
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

  markerSection.body.append(status, workflowHelp, feedback, cameraPreview, positionActions, saveActions);
  locationSection.body.append(
    placedPositionPreview,
    positionInput.field,
    positionConfirmActions
  );
  contentSection.body.append(
    titleInput.field,
    contentDraftInput.field,
    insertActions,
    contentBlockList,
    advancedContentSection.section
  );
  gallerySection.body.append(
    imageCounters.container,
    mainImageDropZone,
    exteriorImagesDropZone,
    interiorImagesDropZone,
    imageDraftInput.field,
    imageActions,
    mainImageList,
    exteriorImageList,
    interiorImageList,
    advancedGallerySection.section
  );

  panel.append(
    header,
    markerSection.section,
    locationSection.section,
    contentSection.section,
    gallerySection.section
  );
  document.body.appendChild(panel);
  controlPan = setupControlPanWhileEditing(panel, camera);

  document.addEventListener("marker:selected", (event) => {
    const selectedMarker = event.detail?.marker || null;
    if (activeMarker?.userData.isDraftMarker && activeMarker !== selectedMarker) {
      cleanupEditorUploadedImages(fields);
      removeMarkerFromScene(activeMarker, scene, buttons);
    }

    activeMarker = selectedMarker;
    isCreatingNewMarker = Boolean(activeMarker?.userData.isDraftMarker);
    resetMarkerEditorSaveButton(saveButton, isCreatingNewMarker);
    stopFollowingTarget();
    populateEditor(activeMarker, fields);
    setFeedback(fields, activeMarker
      ? "Marcador seleccionado. Elegi que queres hacer."
      : "");
    const nextStage = getSelectedMarkerStage(activeMarker, isCreatingNewMarker, editorStage);
    setWorkflowStage(nextStage);
  });

  let lastPreviewUpdate = 0;

  function updatePreview(now) {
    requestAnimationFrame(updatePreview);

    if (now - lastPreviewUpdate < 140) return;
    lastPreviewUpdate = now;

    const targetPosition = clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target));
    cameraPreview.textContent = `Lugar actual: ${numberListToText(targetPosition)}`;
    if (activeMarker) {
      updatePlacedPositionPreview(placedPositionPreview, vectorToNumberArray(activeMarker.position));
    }

    if (panel.hidden) {
      hideMarkerEditorProjection(markerProjection);
      projectedMarkerPosition = null;
      return;
    }

    if (editorStage !== EDITOR_STAGE_GHOST && editorStage !== EDITOR_STAGE_POSITION) {
      hideMarkerEditorProjection(markerProjection);
      projectedMarkerPosition = null;
      return;
    }

    if (isPreviewFollowingTarget) {
      positionInput.input.value = numberListToText(targetPosition);
    }

    const rawMarkerPosition = parseNumberList(positionInput.input.value);
    projectedMarkerPosition = updateProjectionMarker({
      projection: markerProjection,
      position: rawMarkerPosition,
      scene,
      clampPosition: clampMarkerPosition,
    });
    updatePreviewMarker(markerProjection, projectedMarkerPosition || rawMarkerPosition, clampMarkerPosition);
  }

  requestAnimationFrame(updatePreview);

  setupEditorShortcut(panel, () => {
    populateEditor(activeMarker, fields);
    const nextStage = getSelectedMarkerStage(activeMarker, isCreatingNewMarker, editorStage);
    setWorkflowStage(nextStage);
  }, () => {
    controlPan?.disable();
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
        previewPanel: previewPanel.panel,
      },
    });
    controlPan?.sync();
  }
}

function getSelectedMarkerStage(marker, isCreatingNewMarker, currentStage) {
  if (!marker) return EDITOR_STAGE_IDLE;
  if (!isCreatingNewMarker) return EDITOR_STAGE_SELECTED;
  return currentStage === EDITOR_STAGE_EDIT ? EDITOR_STAGE_EDIT : EDITOR_STAGE_POSITION;
}

function getMarkerEditorSaveIdleText(isCreatingNewMarker) {
  return isCreatingNewMarker ? "Guardar" : "Guardar cambios";
}

function resetMarkerEditorSaveButton(button, isCreatingNewMarker) {
  if (!button || button.dataset.saveState === "busy") return;
  setMarkerEditorSaveButtonState(button, "idle", { isCreatingNewMarker });
}

function setMarkerEditorSaveButtonState(button, state, { isCreatingNewMarker = false, isNewPlace = false } = {}) {
  if (!button) return;

  const labels = {
    idle: getMarkerEditorSaveIdleText(isCreatingNewMarker),
    busy: isNewPlace ? MARKER_SAVE_BUTTON_CREATE_TEXT : MARKER_SAVE_BUTTON_BUSY_TEXT,
    saved: MARKER_SAVE_BUTTON_SAVED_TEXT,
    error: MARKER_SAVE_BUTTON_ERROR_TEXT,
  };

  button.textContent = labels[state] || labels.idle;
  button.disabled = state === "busy";

  if (state === "idle") {
    delete button.dataset.saveState;
    return;
  }

  button.dataset.saveState = state;
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

  buttons.finishPositionButton.textContent = "Confirmar lugar";
  if (!buttons.saveButton.dataset.saveState) {
    buttons.saveButton.textContent = getMarkerEditorSaveIdleText(isCreatingNewMarker);
  }
  buttons.editContentButton.textContent = isCreatingNewMarker ? "Cargar datos" : "Editar contenido";
  buttons.deselectButton.textContent = "Deseleccionar";

  sections.location.hidden = !isPositionStage;
  sections.content.hidden = !isEditStage;
  sections.gallery.hidden = !isEditStage;
  sections.location.open = isPositionStage;
  sections.content.open = isEditStage;
  sections.gallery.open = false;
  fields.status.hidden = isIdle || isGhostStage;
  fields.positionField.hidden = !isPositionStage;
  fields.cameraPreview.hidden = true;
  fields.placedPositionPreview.hidden = !isPositionStage;
  fields.positionActions.hidden = !isGhostStage && !isPositionStage;
  fields.positionConfirmActions.hidden = !isPositionStage;
  fields.previewPanel.hidden = !isEditStage;
  fields.previewPanel.classList.toggle("active", isEditStage);

  if (isIdle) {
    workflowHelp.textContent = "Toca Nuevo marcador o selecciona uno del mapa.";
    return;
  }

  if (isGhostStage) {
    workflowHelp.textContent = "La marca sigue la vista. Cuando esté en el lugar correcto, tocá Ubicar acá.";
    return;
  }

  if (isPositionStage && isCreatingNewMarker) {
    workflowHelp.textContent = "Revisa el lugar y toca Confirmar lugar.";
    return;
  }

  if (isPositionStage) {
    workflowHelp.textContent = "Ajusta el lugar y toca Confirmar lugar.";
    return;
  }

  if (isSelectedStage) {
    workflowHelp.textContent = "Toca Editar contenido, Mover, Eliminar o Deseleccionar.";
    return;
  }

  workflowHelp.textContent = isCreatingNewMarker
    ? "Completa los datos y toca Guardar."
    : "Edita los datos y toca Guardar cambios.";
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
  fields.imageDraftInput.value = "";
  fields.contentDraftInput.value = "";
  syncContentBlockList(fields);
  syncImageListEditors(fields);
  rememberEditorImagePaths(fields);
  updateContentPreview(fields.contentPreview, fields.textInput.value);
  updateEditorPreview(fields);
  clearFieldInvalid(fields.titleInput);
  clearFieldInvalid(fields.positionInput);
}

async function saveCurrentMarker(marker, fields, context) {
  if (fields.contentDraftInput.value.trim()) {
    setFeedback(fields, "Tocá Agregar párrafo, Agregar subtítulo o Agregar fuente antes de guardar.", FEEDBACK_ERROR);
    setMarkerEditorSaveButtonState(fields.saveButton, "error", { isCreatingNewMarker: context.isCreatingNewMarker });
    fields.contentDraftInput.focus();
    return;
  }

  if (fields.imageDraftInput.value.trim()) {
    setFeedback(fields, "Toca Usar principal, Agregar exterior o Agregar interior antes de guardar.", FEEDBACK_ERROR);
    setMarkerEditorSaveButtonState(fields.saveButton, "error", { isCreatingNewMarker: context.isCreatingNewMarker });
    fields.imageDraftInput.focus();
    return;
  }

  const title = fields.titleInput.value.trim();
  if (!title) {
    setFieldInvalid(fields.titleInput, true);
    setFeedback(fields, "Falta el título.", FEEDBACK_ERROR);
    setMarkerEditorSaveButtonState(fields.saveButton, "error", { isCreatingNewMarker: context.isCreatingNewMarker });
    return;
  }
  setFieldInvalid(fields.titleInput, false);

  const rawPosition = parseNumberList(fields.positionInput.value);
  const position = clampMarkerPosition(rawPosition);
  if (!position) {
    setFieldInvalid(fields.positionInput, true);
    setFeedback(fields, "Revisá la ubicación antes de guardar.", FEEDBACK_ERROR);
    setMarkerEditorSaveButtonState(fields.saveButton, "error", { isCreatingNewMarker: context.isCreatingNewMarker });
    return;
  }
  setFieldInvalid(fields.positionInput, false);
  fields.positionInput.value = numberListToText(position);

  const payload = {
    title,
    position,
    imageUrl: fields.mainImageInput.value,
    text: sanitizeHtml(fields.textInput.value),
    exteriorImages: splitLines(fields.exteriorImagesInput.value),
    interiorImages: splitLines(fields.interiorImagesInput.value),
  };

  const isNewPlace = context.isCreatingNewMarker || !marker?.userData.placeId;
  setMarkerEditorSaveButtonState(fields.saveButton, "busy", { isCreatingNewMarker: context.isCreatingNewMarker, isNewPlace });
  setFeedback(fields, isNewPlace
    ? "Guardando marcador..."
    : "Guardando cambios...");

  try {
    if (isNewPlace) {
      payload.cameraView = getCurrentCameraView(context.camera);
      const savedPlace = await createPlace(payload);
      const createdMarker = marker || createMarkerFromPlace(context.scene, context.buttons, savedPlace);
      syncMarker(createdMarker, savedPlace);
      populateEditor(createdMarker, fields);
      setMarkerEditorSaveButtonState(fields.saveButton, "saved", { isCreatingNewMarker: context.isCreatingNewMarker });
      setFeedback(fields, "Marcador guardado.", FEEDBACK_SUCCESS);
      animateEditorPreviewSaved(fields.previewPanel, () => context.onCreated(createdMarker));
      return;
    }

    const savedPlace = await savePlace(marker.userData.placeId, payload);
    syncMarker(marker, savedPlace);
    populateEditor(marker, fields);
    setMarkerEditorSaveButtonState(fields.saveButton, "saved", { isCreatingNewMarker: context.isCreatingNewMarker });
    setFeedback(fields, "Cambios guardados.", FEEDBACK_SUCCESS);
    animateEditorPreviewSaved(fields.previewPanel, () => context.onSaved?.(marker));
  } catch (error) {
    console.warn("No se pudo guardar el marcador", error);
    setMarkerEditorSaveButtonState(fields.saveButton, "error", { isCreatingNewMarker: context.isCreatingNewMarker });
    setFeedback(fields, getErrorMessage(error, "No se pudo guardar. Intenta otra vez."), FEEDBACK_ERROR);
  }
}

function clearEditor(fields, camera) {
  fields.status.textContent = "Marcador nuevo | sin guardar";
  fields.titleInput.value = "Nuevo marcador";
  fields.positionInput.value = numberListToText(clampMarkerPosition(vectorToNumberArray(camera.userData.controls?.target)));
  fields.mainImageInput.value = "";
  fields.imageDraftInput.value = "";
  fields.textInput.value = "";
  fields.contentDraftInput.value = "";
  fields.exteriorImagesInput.value = "";
  fields.interiorImagesInput.value = "";
  syncContentBlockList(fields);
  syncImageListEditors(fields);
  rememberEditorImagePaths(fields);
  updateContentPreview(fields.contentPreview, fields.textInput.value);
  updateEditorPreview(fields);
  clearFieldInvalid(fields.titleInput);
  clearFieldInvalid(fields.positionInput);
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
    title: "Nuevo marcador",
    imageUrl: null,
    text: "",
    exteriorImages: [],
    interiorImages: [],
    cameraView: null,
    position,
  });

  marker.userData.isDraftMarker = true;
  return marker;
}

function getMarkerStatusText(marker, placeId) {
  if (!marker) return "Sin marcador seleccionado";
  if (!placeId || marker.userData.isDraftMarker) return "Marcador nuevo | sin guardar";
  return `Marcador: ${marker.userData.title || "sin título"}`;
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
    setFeedback(fields, "Este marcador todavia no fue guardado.", FEEDBACK_ERROR);
    showTemporaryButtonText(fields.deleteButton, "Sin guardar");
    return;
  }

  const markerTitle = marker.userData.title || "sin título";
  const confirmed = window.confirm(`¿Eliminar "${markerTitle}" del mapa? Esta acción no se puede deshacer desde el editor.`);
  if (!confirmed) return;

  try {
    setButtonBusy(fields.deleteButton, true, "Eliminando...");
    setFeedback(fields, "Eliminando marcador...");
    await deletePlace(marker.userData.placeId);
    removeMarkerFromScene(marker, context.scene, context.buttons);
    document.dispatchEvent(new CustomEvent("marker:deselected"));
    context.onDeleted();
    clearFields(fields);
    setFeedback(fields, "Marcador eliminado.", FEEDBACK_SUCCESS);
  } catch (error) {
    console.warn("No se pudo eliminar el marcador", error);
    setFeedback(fields, getErrorMessage(error, "No se pudo eliminar. Intenta otra vez."), FEEDBACK_ERROR);
  } finally {
    setButtonBusy(fields.deleteButton, false);
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

function clearFields(fields, statusText = "Marcador eliminado") {
  fields.status.textContent = statusText;
  fields.titleInput.value = "";
  fields.positionInput.value = "";
  fields.mainImageInput.value = "";
  fields.imageDraftInput.value = "";
  fields.textInput.value = "";
  fields.contentDraftInput.value = "";
  fields.exteriorImagesInput.value = "";
  fields.interiorImagesInput.value = "";
  syncContentBlockList(fields);
  syncImageListEditors(fields);
  rememberEditorImagePaths(fields);
  updateContentPreview(fields.contentPreview, fields.textInput.value);
  updateEditorPreview(fields);
  clearFieldInvalid(fields.titleInput);
  clearFieldInvalid(fields.positionInput);
}

function setFeedback(fields, message, tone = FEEDBACK_INFO) {
  if (!fields.feedback) return;

  fields.feedback.textContent = message;
  fields.feedback.dataset.tone = tone;
  fields.feedback.hidden = !message;
}

function clearFeedback(fields) {
  setFeedback(fields, "");
}

function setFieldInvalid(input, isInvalid) {
  input?.closest(".marker-editor-field")?.classList.toggle("is-invalid", Boolean(isInvalid));
}

function clearFieldInvalid(input) {
  setFieldInvalid(input, false);
}

function setButtonBusy(button, isBusy, busyText = "Guardando...") {
  if (!button) return;

  if (isBusy) {
    button.dataset.idleText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
    return;
  }

  button.disabled = false;
  if (button.dataset.idleText) {
    button.textContent = button.dataset.idleText;
    delete button.dataset.idleText;
  }
}

function getErrorMessage(error, fallback) {
  return fallback;
}

function updatePlacedPositionPreview(preview, position) {
  preview.textContent = `Lugar elegido: ${numberListToText(position)}`;
}

function setupEditorShortcut(panel, onOpen, onClose) {
  document.addEventListener("keydown", async (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      onClose?.();
      hideEditor(panel);
      return;
    }

    if (!isMarkerEditorShortcut(event)) return;

    event.preventDefault();
    if (!panel.hidden) {
      onClose?.();
      hideEditor(panel);
      return;
    }

    if (!await requireEditorAccess("Clave de administrador")) return;
    onOpen();
    showEditor(panel);
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
  document.querySelectorAll(".marker-editor-preview-panel").forEach((previewPanel) => {
    previewPanel.hidden = true;
    previewPanel.classList.remove("active", "is-saved");
  });
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
