import { sanitizeHtml } from "./htmlSanitizer.js";

let currentInfoPanel = null;
let activeImageViewerKeyHandler = null;
let activeImageViewerCleanup = null;
let activeInfoPanelOutsideClickHandler = null;
let activeInfoPanelOutsideClickTimer = null;

const PANEL_CLOSE_ANIMATION_MS = 220;

export { showContent, hideCurrentInfoPanel };

function showContent(title, imageUrl, text, exteriorImages, interiorImages) {
  hideCurrentInfoPanel();

  const primaryImages = imageUrl ? [imageUrl] : [];
  const exteriorGalleryImages = (exteriorImages || []).filter(Boolean);
  const interiorGalleryImages = (interiorImages || []).filter(Boolean);
  const galleryImages = [...primaryImages, ...exteriorGalleryImages, ...interiorGalleryImages];
  const exteriorStartIndex = primaryImages.length;
  const interiorStartIndex = primaryImages.length + exteriorGalleryImages.length;

  const panel = document.createElement("div");
  panel.className = "info-panel";

  panel.appendChild(createCloseButton("info-panel-close", hideCurrentInfoPanel));

  if (title) {
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    panel.appendChild(titleElement);
  }

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.className = "panel-image";
    image.addEventListener("click", () => openImageViewer(galleryImages, 0));
    panel.appendChild(image);
  }

  const safeText = sanitizeHtml(text);
  if (safeText) {
    const textElement = document.createElement("div");
    textElement.innerHTML = safeText;
    panel.appendChild(textElement);

    textElement.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(link.href, "_blank", "noopener");
      });
    });
  }

  if (exteriorGalleryImages.length > 0) {
    panel.appendChild(createImageGallery(exteriorGalleryImages, galleryImages, exteriorStartIndex));
  }

  if (interiorGalleryImages.length > 0) {
    panel.appendChild(createImageGallery(interiorGalleryImages, galleryImages, interiorStartIndex));
  }

  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add("active"));
  currentInfoPanel = panel;
  watchInfoPanelOutsideClicks(panel);
}

function hideCurrentInfoPanel() {
  closeImageViewer();
  stopWatchingInfoPanelOutsideClicks();

  if (currentInfoPanel) {
    const panel = currentInfoPanel;
    panel.classList.remove("active");
    setTimeout(() => {
      if (panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    }, PANEL_CLOSE_ANIMATION_MS);
    currentInfoPanel = null;
  }
}

function createCloseButton(className, onClick) {
  const button = document.createElement("button");
  button.className = `dialog-close-button ${className}`;
  button.type = "button";
  button.setAttribute("aria-label", "Cerrar");
  button.textContent = "X";
  button.addEventListener("click", onClick);
  return button;
}

function createImageGallery(images, galleryImages, startIndex) {
  const gallery = document.createElement("div");
  gallery.className = "image-gallery";

  images.forEach((imageUrl, index) => {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.addEventListener("click", () => openImageViewer(galleryImages, startIndex + index));
    gallery.appendChild(image);
  });

  return gallery;
}

function watchInfoPanelOutsideClicks(panel) {
  activeInfoPanelOutsideClickTimer = setTimeout(() => {
    if (currentInfoPanel !== panel) return;

    activeInfoPanelOutsideClickHandler = (event) => {
      if (!currentInfoPanel || currentInfoPanel.contains(event.target)) return;
      hideCurrentInfoPanel();
    };

    document.addEventListener("click", activeInfoPanelOutsideClickHandler);
  }, 0);
}

function stopWatchingInfoPanelOutsideClicks() {
  clearTimeout(activeInfoPanelOutsideClickTimer);
  activeInfoPanelOutsideClickTimer = null;

  if (!activeInfoPanelOutsideClickHandler) return;

  document.removeEventListener("click", activeInfoPanelOutsideClickHandler);
  activeInfoPanelOutsideClickHandler = null;
}

function openImageViewer(images, startIndex = 0) {
  if (!images.length) return;

  closeImageViewer();
  let currentIndex = Math.min(Math.max(0, startIndex), images.length - 1);
  let imageTransitionTimer = null;

  const overlay = document.createElement("div");
  overlay.className = "image-viewer-overlay";
  overlay.addEventListener("click", closeImageViewer);

  const frame = document.createElement("div");
  frame.className = "image-viewer-frame";
  frame.addEventListener("click", (event) => event.stopPropagation());

  const closeButton = createCloseButton("image-viewer-close", closeImageViewer);
  closeButton.setAttribute("aria-label", "Cerrar visor de imágenes");

  const stage = document.createElement("div");
  stage.className = "image-viewer-stage";

  const image = document.createElement("img");
  image.alt = "";
  image.addEventListener("click", () => {
    image.classList.toggle("is-zoomed");
  });
  image.addEventListener("load", () => {
    const isLandscape = image.naturalWidth >= image.naturalHeight;
    image.classList.toggle("is-landscape", isLandscape);
    image.classList.toggle("is-portrait", !isLandscape);
  });

  const counter = document.createElement("p");
  counter.className = "image-viewer-counter";

  const controls = document.createElement("div");
  controls.className = "image-viewer-controls";

  const previousButton = document.createElement("button");
  previousButton.className = "image-viewer-nav image-viewer-prev";
  previousButton.type = "button";
  previousButton.setAttribute("aria-label", "Ver imagen anterior");
  previousButton.textContent = "<";

  const nextButton = document.createElement("button");
  nextButton.className = "image-viewer-nav image-viewer-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Ver imagen siguiente");
  nextButton.textContent = ">";

  const thumbnails = document.createElement("div");
  thumbnails.className = "image-viewer-thumbnails";
  const thumbnailButtons = images.map((imageUrl, index) => {
    const thumbnailButton = document.createElement("button");
    thumbnailButton.className = "image-viewer-thumbnail";
    thumbnailButton.type = "button";
    thumbnailButton.setAttribute("aria-label", `Ver imagen ${index + 1}`);

    const thumbnailImage = document.createElement("img");
    thumbnailImage.src = imageUrl;
    thumbnailImage.alt = "";

    thumbnailButton.appendChild(thumbnailImage);
    thumbnailButton.addEventListener("click", () => {
      currentIndex = index;
      updateImage();
    });
    thumbnails.appendChild(thumbnailButton);
    return thumbnailButton;
  });

  const updateImage = (useTransition = true) => {
    clearTimeout(imageTransitionTimer);

    const setImage = () => {
      image.classList.remove("is-landscape", "is-portrait", "is-zoomed");
      image.src = images[currentIndex];
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
      previousButton.hidden = images.length <= 1;
      nextButton.hidden = images.length <= 1;
      thumbnails.hidden = images.length <= 1;
      thumbnailButtons.forEach((button, index) => {
        button.classList.toggle("active", index === currentIndex);
      });
    };

    if (!useTransition || !image.src) {
      setImage();
      image.classList.remove("is-changing");
      return;
    }

    image.classList.add("is-changing");
    imageTransitionTimer = setTimeout(() => {
      setImage();
      requestAnimationFrame(() => image.classList.remove("is-changing"));
    }, 120);
  };

  const showPrevious = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  };

  activeImageViewerKeyHandler = (event) => {
    if (event.key === "Escape") {
      closeImageViewer();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  previousButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);
  document.addEventListener("keydown", activeImageViewerKeyHandler);
  activeImageViewerCleanup = () => clearTimeout(imageTransitionTimer);
  updateImage(false);

  frame.appendChild(closeButton);
  stage.appendChild(image);
  frame.appendChild(stage);
  controls.appendChild(previousButton);
  controls.appendChild(counter);
  controls.appendChild(nextButton);
  frame.appendChild(controls);
  frame.appendChild(thumbnails);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);
}

function closeImageViewer() {
  activeImageViewerCleanup?.();
  activeImageViewerCleanup = null;

  if (activeImageViewerKeyHandler) {
    document.removeEventListener("keydown", activeImageViewerKeyHandler);
    activeImageViewerKeyHandler = null;
  }

  document.querySelectorAll(".image-viewer-overlay").forEach((viewer) => viewer.remove());
}
