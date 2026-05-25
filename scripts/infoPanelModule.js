import { toAssetUrl } from "./assetUrlModule.js";
import { sanitizeHtml } from "./htmlSanitizer.js";

let currentInfoPanel = null;
let activeImageViewerKeyHandler = null;
let activeImageViewerCleanup = null;
let activeInfoPanelOutsideClickHandler = null;
let activeInfoPanelOutsideClickTimer = null;

const PANEL_CLOSE_ANIMATION_MS = 220;
const MOBILE_PANEL_QUERY = "(max-width: 720px)";

export { showContent, hideCurrentInfoPanel };

function showContent(title, imageUrl, text, exteriorImages, interiorImages) {
  hideCurrentInfoPanel();

  const usedImages = new Set();
  const primaryImages = collectUniqueImages(imageUrl ? [imageUrl] : [], usedImages);
  const exteriorGalleryImages = collectUniqueImages(exteriorImages || [], usedImages);
  const interiorGalleryImages = collectUniqueImages(interiorImages || [], usedImages);
  const galleryImages = [...primaryImages, ...exteriorGalleryImages, ...interiorGalleryImages];
  const exteriorStartIndex = primaryImages.length;
  const interiorStartIndex = primaryImages.length + exteriorGalleryImages.length;

  const panel = document.createElement("div");
  panel.className = "info-panel";
  const shouldStartCollapsed = isMobileInfoPanel();
  if (shouldStartCollapsed) {
    panel.classList.add("is-collapsed");
  }

  panel.appendChild(createInfoPanelToggle(panel));
  panel.appendChild(createCloseButton("info-panel-close", hideCurrentInfoPanel));

  if (title) {
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    panel.appendChild(titleElement);
  }

  const mainImage = primaryImages[0];
  if (mainImage) {
    const image = document.createElement("img");
    image.src = mainImage;
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
  document.body.classList.add("info-panel-open");
  document.body.classList.toggle("info-panel-collapsed", shouldStartCollapsed);
  requestAnimationFrame(() => panel.classList.add("active"));
  currentInfoPanel = panel;
  watchInfoPanelOutsideClicks(panel);
}

function collectUniqueImages(images, usedImages) {
  return images
    .map((imageUrl) => typeof imageUrl === "string" ? imageUrl.trim().replace(/\\/g, "/") : "")
    .filter((imageUrl) => {
      if (!imageUrl || usedImages.has(imageUrl)) return false;
      usedImages.add(imageUrl);
      return true;
    })
    .map(toAssetUrl);
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

  document.body.classList.remove("info-panel-open");
  document.body.classList.remove("info-panel-collapsed");
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
      if (isMobileInfoPanel() && currentInfoPanel.classList.contains("is-collapsed")) return;
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
  let swipeStartX = 0;
  let swipeStartY = 0;

  const overlay = document.createElement("div");
  overlay.className = "image-viewer-overlay";
  overlay.addEventListener("click", closeImageViewer);
  document.body.classList.add("image-viewer-open");

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
    setImageZoomed(!image.classList.contains("is-zoomed"));
  });
  image.addEventListener("load", () => {
    const isLandscape = image.naturalWidth >= image.naturalHeight;
    image.classList.toggle("is-landscape", isLandscape);
    image.classList.toggle("is-portrait", !isLandscape);
    setImageZoomed(false);
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
      stage.classList.remove("is-zoomed");
      image.removeAttribute("style");
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

  const setImageZoomed = (isZoomed) => {
    image.classList.toggle("is-zoomed", isZoomed);
    stage.classList.toggle("is-zoomed", isZoomed);

    if (!isZoomed) {
      image.removeAttribute("style");
      return;
    }

    const viewportWidth = Math.max(window.innerWidth, stage.clientWidth);
    const viewportHeight = Math.max(window.innerHeight, stage.clientHeight);
    const naturalWidth = image.naturalWidth || viewportWidth;
    const naturalHeight = image.naturalHeight || viewportHeight;
    const zoomWidth = Math.max(naturalWidth, Math.round(viewportWidth * 1.35));
    const zoomHeight = Math.round(zoomWidth * (naturalHeight / naturalWidth));

    image.style.width = `${zoomWidth}px`;
    image.style.height = `${zoomHeight}px`;

    requestAnimationFrame(() => {
      stage.scrollLeft = Math.max(0, (image.offsetWidth - stage.clientWidth) / 2);
      stage.scrollTop = Math.max(0, (image.offsetHeight - stage.clientHeight) / 2);
    });
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
  stage.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    if (!touch || image.classList.contains("is-zoomed")) return;
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    if (!touch || image.classList.contains("is-zoomed")) return;
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
    if (deltaX < 0) {
      showNext();
    } else {
      showPrevious();
    }
  }, { passive: true });
  document.addEventListener("keydown", activeImageViewerKeyHandler);
  activeImageViewerCleanup = () => clearTimeout(imageTransitionTimer);
  updateImage(false);

  frame.appendChild(closeButton);
  stage.appendChild(image);
  frame.appendChild(stage);
  controls.appendChild(counter);
  frame.appendChild(previousButton);
  frame.appendChild(nextButton);
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
  document.body.classList.remove("image-viewer-open");
}

function createInfoPanelToggle(panel) {
  const button = document.createElement("button");
  button.className = "info-panel-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Desplegar información");
  button.setAttribute("aria-expanded", "false");
  button.textContent = ">";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isCollapsed = panel.classList.toggle("is-collapsed");
    setInfoPanelCollapsed(panel, isCollapsed);
  });
  return button;
}

function setInfoPanelCollapsed(panel, isCollapsed) {
  panel.classList.toggle("is-collapsed", isCollapsed);
  document.body.classList.toggle("info-panel-collapsed", isCollapsed);

  const toggle = panel.querySelector(".info-panel-toggle");
  if (!toggle) return;

  toggle.textContent = isCollapsed ? ">" : "<";
  toggle.setAttribute("aria-expanded", String(!isCollapsed));
  toggle.setAttribute("aria-label", isCollapsed ? "Desplegar información" : "Plegar información");
}

function isMobileInfoPanel() {
  return matchMedia(MOBILE_PANEL_QUERY).matches;
}
