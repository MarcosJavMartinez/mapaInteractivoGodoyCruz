import { uploadImage } from "./apiClient.js";

const FEEDBACK_SUCCESS = "success";
const FEEDBACK_ERROR = "error";

export function createEditorPreviewPanel() {
  const panel = document.createElement("aside");
  panel.className = "marker-editor-preview-panel info-panel";
  panel.setAttribute("aria-label", "Vista previa del marcador");
  panel.hidden = true;

  const kicker = document.createElement("p");
  kicker.className = "marker-editor-preview-kicker";
  kicker.textContent = "Vista previa";

  const title = document.createElement("h2");
  const image = document.createElement("img");
  image.className = "panel-image marker-editor-preview-image";
  image.alt = "";

  const body = document.createElement("div");
  body.className = "marker-editor-preview-body";

  const exteriorGallery = document.createElement("div");
  exteriorGallery.className = "image-gallery marker-editor-preview-gallery";

  const interiorGallery = document.createElement("div");
  interiorGallery.className = "image-gallery marker-editor-preview-gallery";

  panel.append(kicker, title, image, body, exteriorGallery, interiorGallery);
  return { panel, title, image, body, exteriorGallery, interiorGallery };
}

export function stopPreviewMapGestures(panel) {
  ["wheel", "pointerdown", "pointermove", "pointerup", "touchstart", "touchmove"].forEach((eventName) => {
    panel.addEventListener(eventName, (event) => {
      event.stopPropagation();
    }, { passive: eventName !== "wheel" });
  });
}

export function createImageCounters() {
  const container = document.createElement("div");
  container.className = "marker-editor-image-counters";

  const main = createImageCounter("Principal");
  const exterior = createImageCounter("Exteriores");
  const interior = createImageCounter("Interiores");
  container.append(main.item, exterior.item, interior.item);

  return {
    container,
    main: main.value,
    exterior: exterior.value,
    interior: interior.value,
  };
}

export function updateEditorPreview(fields) {
  const preview = fields.previewPanel;
  if (!preview) return;

  const title = fields.titleInput.value.trim();
  const mainImage = fields.mainImageInput.value.trim();
  const text = fields.textInput.value.trim();
  const exteriorImages = splitLines(fields.exteriorImagesInput.value);
  const interiorImages = splitLines(fields.interiorImagesInput.value);

  preview.title.textContent = title || "Titulo del marcador";
  preview.title.classList.toggle("is-empty", !title);

  preview.image.hidden = !mainImage;
  if (mainImage) {
    preview.image.src = mainImage;
  } else {
    preview.image.removeAttribute("src");
  }

  if (text) {
    preview.body.innerHTML = removeUnsafeHtml(text);
    preview.body.classList.remove("is-empty");
  } else {
    preview.body.textContent = "Aca se va a ver el texto del marcador.";
    preview.body.classList.add("is-empty");
  }

  renderPreviewGallery(preview.exteriorGallery, exteriorImages);
  renderPreviewGallery(preview.interiorGallery, interiorImages);
  updateImageCounters(fields, { mainImage, exteriorImages, interiorImages });
}

export function animateEditorPreviewSaved(preview, onDone) {
  if (!preview?.panel || preview.panel.hidden) {
    onDone?.();
    return;
  }

  preview.panel.classList.remove("is-saved");
  void preview.panel.offsetWidth;
  preview.panel.classList.add("is-saved");
  setTimeout(() => {
    preview.panel.classList.remove("is-saved");
    onDone?.();
  }, 520);
}

export function addContentBlock({ type, draftInput, textInput, preview, fields, setFeedback }) {
  const draftText = draftInput.value.trim();
  if (!draftText) {
    setFeedback(fields, "Escribi el texto y despues elegi un boton para agregarlo.", FEEDBACK_ERROR);
    draftInput.focus();
    return;
  }

  const blockHtml = createContentBlockHtml(type, draftText);
  if (!blockHtml) return;

  textInput.value = appendHtmlBlock(textInput.value, blockHtml);
  draftInput.value = "";
  updateContentPreview(preview, textInput.value);
  updateEditorPreview(fields);
  setFeedback(fields, "Contenido agregado. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
}

export function addImagePath({ type, draftInput, fields, setFeedback }) {
  const imagePath = draftInput.value.trim();
  if (!imagePath) {
    setFeedback(fields, "Arrastra una foto o pega la ruta y elegi donde agregarla.", FEEDBACK_ERROR);
    draftInput.focus();
    return;
  }

  if (type === "main") {
    fields.mainImageInput.value = imagePath;
    draftInput.value = "";
    updateEditorPreview(fields);
    setFeedback(fields, "Foto principal lista. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
    return;
  }

  const galleryInput = type === "interior"
    ? fields.interiorImagesInput
    : fields.exteriorImagesInput;
  galleryInput.value = appendLine(galleryInput.value, imagePath);
  draftInput.value = "";
  updateEditorPreview(fields);
  setFeedback(fields, "Foto agregada. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
}

export function createImageDropZone(text) {
  const dropZone = document.createElement("div");
  dropZone.className = "marker-editor-image-dropzone";
  dropZone.dataset.idleText = text;
  dropZone.textContent = text;
  return dropZone;
}

export function setupImageDropZone({ dropZone, type, fields, setFeedback }) {
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add("is-dragging");
  });

  dropZone.addEventListener("dragleave", (event) => {
    event.stopPropagation();
    dropZone.classList.remove("is-dragging");
  });

  dropZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove("is-dragging");

    const files = getDroppedImageFiles(event);
    if (!files.length) {
      setFeedback(fields, "Solta imagenes JPG, PNG, WEBP o GIF.", FEEDBACK_ERROR);
      return;
    }

    if (type === "main" && files.length > 1) {
      setFeedback(fields, "Para la foto principal, solta una sola imagen.", FEEDBACK_ERROR);
      return;
    }

    try {
      dropZone.classList.add("is-uploading");
      dropZone.textContent = files.length === 1
        ? "Subiendo imagen..."
        : `Subiendo ${files.length} imagenes...`;
      setFeedback(fields, dropZone.textContent);
      const uploadedImages = await uploadDroppedImages(files);
      addUploadedImagesToFields(type, uploadedImages, fields, setFeedback);
    } catch (error) {
      console.warn("No se pudo subir la imagen", error);
      setFeedback(fields, "No se pudieron subir las imagenes. Intenta otra vez.", FEEDBACK_ERROR);
    } finally {
      dropZone.classList.remove("is-uploading");
      dropZone.textContent = dropZone.dataset.idleText;
    }
  });
}

export function updateContentPreview(preview, html) {
  if (!preview) return;

  const content = html.trim();
  if (!content) {
    preview.textContent = "Todavia no hay contenido.";
    return;
  }

  preview.innerHTML = removeUnsafeHtml(content);
}

function createImageCounter(labelText) {
  const item = document.createElement("div");
  item.className = "marker-editor-image-counter";
  const label = document.createElement("span");
  label.textContent = labelText;
  const value = document.createElement("strong");
  value.textContent = "0";
  item.append(label, value);
  return { item, value };
}

function updateImageCounters(fields, { mainImage, exteriorImages, interiorImages }) {
  if (!fields.imageCounters) return;

  fields.imageCounters.main.textContent = mainImage ? "1" : "0";
  fields.imageCounters.exterior.textContent = String(exteriorImages.length);
  fields.imageCounters.interior.textContent = String(interiorImages.length);
}

function renderPreviewGallery(gallery, images) {
  gallery.replaceChildren();
  gallery.hidden = images.length === 0;

  images.forEach((imageUrl) => {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    gallery.appendChild(image);
  });
}

function getDroppedImageFiles(event) {
  return Array.from(event.dataTransfer?.files || [])
    .filter((file) => file.type.startsWith("image/"));
}

async function uploadDroppedImages(files) {
  const uploadedImages = [];

  for (const file of files) {
    uploadedImages.push(await uploadImage(file));
  }

  return uploadedImages;
}

function addUploadedImagesToFields(type, uploadedImages, fields, setFeedback) {
  const imagePaths = uploadedImages.map((image) => image.path);
  if (type === "main") {
    fields.mainImageInput.value = imagePaths[0];
    updateEditorPreview(fields);
    setFeedback(fields, "Foto principal lista. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
    return;
  }

  const galleryInput = type === "interior"
    ? fields.interiorImagesInput
    : fields.exteriorImagesInput;
  galleryInput.value = appendLines(galleryInput.value, imagePaths);
  updateEditorPreview(fields);
  setFeedback(fields, `${imagePaths.length} ${getImageTypeText(type, imagePaths.length)} ${getAddedText(imagePaths.length)}. Cuando termines, toca Guardar.`, FEEDBACK_SUCCESS);
}

function getImageTypeText(type, count) {
  if (type === "interior") {
    return count === 1 ? "foto interior" : "fotos interiores";
  }

  return count === 1 ? "foto exterior" : "fotos exteriores";
}

function getAddedText(count) {
  return count === 1 ? "agregada" : "agregadas";
}

function createContentBlockHtml(type, text) {
  if (type === "subtitle") {
    return `<h3>${escapeHtml(text)}</h3>`;
  }

  if (type === "source") {
    const items = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `  <li>${escapeHtml(line)}</li>`)
      .join("\n");
    return `<h3>Fuentes</h3>\n<ul>\n${items}\n</ul>`;
  }

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`)
    .join("\n");
}

function appendHtmlBlock(currentHtml, blockHtml) {
  const trimmedHtml = currentHtml.trim();
  return trimmedHtml ? `${trimmedHtml}\n${blockHtml}` : blockHtml;
}

function appendLine(currentValue, line) {
  const trimmedValue = currentValue.trim();
  return trimmedValue ? `${trimmedValue}\n${line}` : line;
}

function appendLines(currentValue, lines) {
  return lines.reduce((value, line) => appendLine(value, line), currentValue);
}

function removeUnsafeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
