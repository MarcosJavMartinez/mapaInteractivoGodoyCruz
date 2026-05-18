import { deleteUploadedImage, uploadImage } from "./apiClient.js";
import { sanitizeHtml } from "./htmlSanitizer.js";

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

export function createContentBlockList() {
  const list = document.createElement("div");
  list.className = "marker-editor-edit-list";
  list.dataset.emptyText = "Todavia no hay textos agregados.";
  list.textContent = list.dataset.emptyText;
  return list;
}

export function setupContentBlockList({ list, fields, setFeedback }) {
  list.addEventListener("input", (event) => {
    if (!event.target.matches("textarea")) return;

    fields.textInput.value = contentBlocksToHtml(readContentBlocksFromList(list));
    updateContentPreview(fields.contentPreview, fields.textInput.value);
    updateEditorPreview(fields);
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const item = button.closest(".marker-editor-edit-item");
    const index = Number(item?.dataset.index);
    const blocks = readContentBlocksFromList(list);

    if (button.dataset.action === "up" && index > 0) {
      moveItem(blocks, index, index - 1);
    } else if (button.dataset.action === "down" && index < blocks.length - 1) {
      moveItem(blocks, index, index + 1);
    } else if (button.dataset.action === "remove") {
      blocks.splice(index, 1);
    } else {
      return;
    }

    fields.textInput.value = contentBlocksToHtml(blocks);
    syncContentBlockList(fields);
    updateContentPreview(fields.contentPreview, fields.textInput.value);
    updateEditorPreview(fields);
    setFeedback(fields, "Contenido actualizado. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
  });
}

export function syncContentBlockList(fields) {
  if (!fields.contentBlockList) return;

  renderContentBlockList(fields.contentBlockList, parseContentBlocks(fields.textInput.value));
}

export function createImageListEditor(labelText) {
  const list = document.createElement("div");
  list.className = "marker-editor-edit-list marker-editor-image-list";
  list.dataset.emptyText = `Todavia no hay ${labelText.toLowerCase()}.`;
  list.textContent = list.dataset.emptyText;
  return list;
}

export function setupImageListEditor({ list, type, fields, setFeedback }) {
  list.addEventListener("input", (event) => {
    if (!event.target.matches("input")) return;

    const image = event.target.closest(".marker-editor-image-row")?.querySelector("img");
    if (image) {
      image.src = event.target.value.trim();
    }

    writeImagesToFields(type, readImagesFromList(list), fields);
    updateEditorPreview(fields);
    cleanupRemovedEditorUploadedImages(fields);
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const item = button.closest(".marker-editor-edit-item");
    const index = Number(item?.dataset.index);
    const images = readImagesFromList(list);

    if (button.dataset.action === "up" && index > 0) {
      moveItem(images, index, index - 1);
    } else if (button.dataset.action === "down" && index < images.length - 1) {
      moveItem(images, index, index + 1);
    } else if (button.dataset.action === "remove") {
      const [removedImage] = images.splice(index, 1);
      cleanupUploadedImages([removedImage]);
    } else {
      return;
    }

    writeImagesToFields(type, images, fields);
    syncImageListEditors(fields);
    updateEditorPreview(fields);
    rememberEditorImagePaths(fields);
    setFeedback(fields, "Fotos actualizadas. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
  });
}

export function syncImageListEditors(fields) {
  if (!fields.imageListEditors) return;

  renderImageList(fields.imageListEditors.main, fields.mainImageInput.value.trim() ? [fields.mainImageInput.value.trim()] : []);
  renderImageList(fields.imageListEditors.exterior, splitLines(fields.exteriorImagesInput.value));
  renderImageList(fields.imageListEditors.interior, splitLines(fields.interiorImagesInput.value));
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

  const safeText = sanitizeHtml(text);
  if (safeText) {
    preview.body.innerHTML = safeText;
    preview.body.classList.remove("is-empty");
  } else {
    preview.body.textContent = "Aca se va a ver el texto del marcador.";
    preview.body.classList.add("is-empty");
  }

  renderPreviewGallery(preview.exteriorGallery, exteriorImages);
  renderPreviewGallery(preview.interiorGallery, interiorImages);
  updateImageCounters(fields, { mainImage, exteriorImages, interiorImages });
}

export function cleanupEditorUploadedImages(fields) {
  cleanupUploadedImages(getEditorImagePaths(fields));
  rememberEditorImagePaths(fields);
}

export function cleanupRemovedEditorUploadedImages(fields) {
  const previousImagePaths = fields.lastTrackedImagePaths || [];
  const currentImagePaths = getEditorImagePaths(fields);
  const currentImagePathSet = new Set(currentImagePaths);
  cleanupUploadedImages(previousImagePaths.filter((imagePath) => !currentImagePathSet.has(imagePath)));
  rememberEditorImagePaths(fields, currentImagePaths);
  return currentImagePaths;
}

export function rememberEditorImagePaths(fields, imagePaths = getEditorImagePaths(fields)) {
  fields.lastTrackedImagePaths = imagePaths;
}

export function getEditorImagePaths(fields) {
  return [
    fields.mainImageInput.value,
    ...splitLines(fields.exteriorImagesInput.value),
    ...splitLines(fields.interiorImagesInput.value),
  ].filter(Boolean);
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
  syncContentBlockList(fields);
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
    cleanupUploadedImages([fields.mainImageInput.value]);
    fields.mainImageInput.value = imagePath;
    draftInput.value = "";
    syncImageListEditors(fields);
    updateEditorPreview(fields);
    rememberEditorImagePaths(fields);
    setFeedback(fields, "Foto principal lista. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
    return;
  }

  const galleryInput = type === "interior"
    ? fields.interiorImagesInput
    : fields.exteriorImagesInput;
  galleryInput.value = appendLine(galleryInput.value, imagePath);
  draftInput.value = "";
  syncImageListEditors(fields);
  updateEditorPreview(fields);
  rememberEditorImagePaths(fields);
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

  const safeContent = sanitizeHtml(content);
  if (!safeContent) {
    preview.textContent = "Todavia no hay contenido.";
    return;
  }

  preview.innerHTML = safeContent;
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
    cleanupUploadedImages([fields.mainImageInput.value]);
    fields.mainImageInput.value = imagePaths[0];
    syncImageListEditors(fields);
    updateEditorPreview(fields);
    rememberEditorImagePaths(fields);
    setFeedback(fields, "Foto principal lista. Cuando termines, toca Guardar.", FEEDBACK_SUCCESS);
    return;
  }

  const galleryInput = type === "interior"
    ? fields.interiorImagesInput
    : fields.exteriorImagesInput;
  galleryInput.value = appendLines(galleryInput.value, imagePaths);
  syncImageListEditors(fields);
  updateEditorPreview(fields);
  rememberEditorImagePaths(fields);
  setFeedback(fields, `${imagePaths.length} ${getImageTypeText(type, imagePaths.length)} ${getAddedText(imagePaths.length)}. Cuando termines, toca Guardar.`, FEEDBACK_SUCCESS);
}

function cleanupUploadedImages(imagePaths) {
  Array.from(new Set(imagePaths))
    .filter(isUploadImagePath)
    .forEach((imagePath) => {
      deleteUploadedImage(imagePath).catch((error) => {
        console.warn("No se pudo limpiar la imagen subida", imagePath, error);
      });
    });
}

function isUploadImagePath(imagePath) {
  return typeof imagePath === "string"
    && imagePath.replace(/\\/g, "/").startsWith("images/uploads/");
}

function renderContentBlockList(list, blocks) {
  list.replaceChildren();

  if (!blocks.length) {
    list.textContent = list.dataset.emptyText;
    return;
  }

  blocks.forEach((block, index) => {
    const item = createEditableItem({
      label: getContentBlockLabel(block.type),
      index,
      isFirst: index === 0,
      isLast: index === blocks.length - 1,
    });
    const textarea = document.createElement("textarea");
    textarea.rows = block.type === "paragraph" ? 4 : 2;
    textarea.dataset.type = block.type;
    textarea.value = block.text;
    item.appendChild(textarea);
    list.appendChild(item);
  });
}

function readContentBlocksFromList(list) {
  return Array.from(list.querySelectorAll(".marker-editor-edit-item textarea"))
    .map((textarea) => ({
      type: textarea.dataset.type || "paragraph",
      text: textarea.value.trim(),
    }))
    .filter((block) => block.text);
}

function parseContentBlocks(html) {
  const content = sanitizeHtml(html).trim();
  if (!content) return [];

  const template = document.createElement("template");
  template.innerHTML = content;
  const nodes = Array.from(template.content.childNodes);
  const blocks = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) blocks.push({ type: "paragraph", text });
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const tagName = node.tagName.toLowerCase();
    if (tagName === "h3") {
      const nextNode = nodes[index + 1];
      if (node.textContent.trim().toLowerCase() === "fuentes" && nextNode?.tagName?.toLowerCase() === "ul") {
        blocks.push({ type: "source", text: getListText(nextNode) });
        index += 1;
      } else {
        blocks.push({ type: "subtitle", text: node.textContent.trim() });
      }
      continue;
    }

    if (tagName === "ul") {
      blocks.push({ type: "source", text: getListText(node) });
      continue;
    }

    if (tagName === "p") {
      blocks.push({ type: "paragraph", text: getElementTextWithBreaks(node).trim() });
      continue;
    }

    const text = node.textContent.trim();
    if (text) blocks.push({ type: "paragraph", text });
  }

  return blocks.filter((block) => block.text);
}

function contentBlocksToHtml(blocks) {
  return blocks
    .map((block) => createContentBlockHtml(block.type, block.text))
    .filter(Boolean)
    .join("\n");
}

function getContentBlockLabel(type) {
  if (type === "subtitle") return "Subtitulo";
  if (type === "source") return "Fuente";
  return "Parrafo";
}

function getListText(list) {
  return Array.from(list.querySelectorAll("li"))
    .map((item) => item.textContent.trim())
    .filter(Boolean)
    .join("\n");
}

function getElementTextWithBreaks(element) {
  return Array.from(element.childNodes)
    .map((node) => {
      if (node.nodeName === "BR") return "\n";
      return node.textContent || "";
    })
    .join("");
}

function renderImageList(list, images) {
  if (!list) return;
  list.replaceChildren();

  if (!images.length) {
    list.textContent = list.dataset.emptyText;
    return;
  }

  images.forEach((imageUrl, index) => {
    const item = createEditableItem({
      label: `Foto ${index + 1}`,
      index,
      isFirst: index === 0,
      isLast: index === images.length - 1,
    });
    const row = document.createElement("div");
    row.className = "marker-editor-image-row";
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    const input = document.createElement("input");
    input.type = "text";
    input.value = imageUrl;
    input.placeholder = "Ruta de la foto";
    row.append(image, input);
    item.appendChild(row);
    list.appendChild(item);
  });
}

function readImagesFromList(list) {
  return Array.from(list.querySelectorAll(".marker-editor-edit-item input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function writeImagesToFields(type, images, fields) {
  if (type === "main") {
    fields.mainImageInput.value = images[0] || "";
    return;
  }

  const input = type === "interior"
    ? fields.interiorImagesInput
    : fields.exteriorImagesInput;
  input.value = images.join("\n");
}

function createEditableItem({ label, index, isFirst, isLast }) {
  const item = document.createElement("div");
  item.className = "marker-editor-edit-item";
  item.dataset.index = String(index);

  const header = document.createElement("div");
  header.className = "marker-editor-edit-item-header";
  const title = document.createElement("span");
  title.textContent = label;
  const controls = document.createElement("div");
  controls.className = "marker-editor-edit-controls";
  controls.append(
    createEditControlButton("Subir", "up", isFirst),
    createEditControlButton("Bajar", "down", isLast),
    createEditControlButton("Quitar", "remove", false),
  );
  header.append(title, controls);
  item.appendChild(header);
  return item;
}

function createEditControlButton(label, action, isDisabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.textContent = label;
  button.disabled = isDisabled;
  return button;
}

function moveItem(items, fromIndex, toIndex) {
  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
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
