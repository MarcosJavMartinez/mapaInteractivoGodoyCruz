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
  let viewerState = "fit";
  let zoomScale = 1;
  let panX = 0;
  let panY = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let isPinching = false;
  let isDraggingZoom = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartPanX = 0;
  let dragStartPanY = 0;
  let suppressClickUntil = 0;

  const INITIAL_ZOOM_SCALE = 2.25;
  const MAX_ZOOM_SCALE = 5;

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
  stage.dataset.viewerState = viewerState;

  const image = document.createElement("img");
  image.alt = "";
  image.addEventListener("click", (event) => {
    if (isPinching || Date.now() < suppressClickUntil) return;
    if (viewerState === "zoom") {
      resetImageZoom();
      return;
    }
    enterImageZoom(event, INITIAL_ZOOM_SCALE);
  });
  image.addEventListener("load", () => {
    const isLandscape = image.naturalWidth >= image.naturalHeight;
    image.classList.toggle("is-landscape", isLandscape);
    image.classList.toggle("is-portrait", !isLandscape);
    resetImageZoom();
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
      resetImageZoom();
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

  const applyImageTransform = () => {
    const isZoomed = viewerState === "zoom";
    stage.dataset.viewerState = viewerState;
    image.classList.toggle("is-zoomed", isZoomed);
    stage.classList.toggle("is-zoomed", isZoomed);
    image.style.transform = isZoomed ? `translate(${panX}px, ${panY}px) scale(${zoomScale})` : "";
  };

  const getPanLimit = (scale = zoomScale) => {
    const baseWidth = image.offsetWidth || stage.clientWidth;
    const baseHeight = image.offsetHeight || stage.clientHeight;
    return {
      x: Math.max(0, ((baseWidth * scale) - stage.clientWidth) / 2),
      y: Math.max(0, ((baseHeight * scale) - stage.clientHeight) / 2),
    };
  };

  const clampPan = () => {
    const limit = getPanLimit();
    panX = clamp(panX, -limit.x, limit.x);
    panY = clamp(panY, -limit.y, limit.y);
  };

  const setPanFromPoint = (point, scale = zoomScale) => {
    const limit = getPanLimit(scale);
    panX = (0.5 - point.x) * 2 * limit.x;
    panY = (0.5 - point.y) * 2 * limit.y;
  };

  const applyImageZoom = (scale, point = null) => {
    zoomScale = clamp(scale, 1, MAX_ZOOM_SCALE);
    viewerState = zoomScale > 1.01 ? "zoom" : "fit";

    if (viewerState === "fit") {
      panX = 0;
      panY = 0;
    } else if (point) {
      setPanFromPoint(point, zoomScale);
    } else {
      clampPan();
    }

    applyImageTransform();
  };

  const enterImageZoom = (point, scale = INITIAL_ZOOM_SCALE) => {
    applyImageZoom(scale, getStagePoint(point));
  };

  const resetImageZoom = () => {
    viewerState = "fit";
    zoomScale = 1;
    panX = 0;
    panY = 0;
    applyImageTransform();
  };

  const getStagePoint = (point) => {
    const rect = stage.getBoundingClientRect();
    return {
      x: clamp((point.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((point.clientY - rect.top) / rect.height, 0, 1),
    };
  };

  const getTouchDistance = (touches) => {
    const deltaX = touches[0].clientX - touches[1].clientX;
    const deltaY = touches[0].clientY - touches[1].clientY;
    return Math.hypot(deltaX, deltaY);
  };

  const getTouchMidpoint = (touches) => ({
    clientX: (touches[0].clientX + touches[1].clientX) / 2,
    clientY: (touches[0].clientY + touches[1].clientY) / 2,
  });

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
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (viewerState === "fit" && event.deltaY > 0) return;

    const point = getStagePoint(event);
    const wheelFactor = Math.exp(-event.deltaY * 0.0014);
    const nextScale = viewerState === "fit"
      ? INITIAL_ZOOM_SCALE * wheelFactor
      : zoomScale * wheelFactor;
    applyImageZoom(nextScale, point);
  }, { passive: false });
  stage.addEventListener("mousemove", (event) => {
    if (viewerState !== "zoom") return;
    setPanFromPoint(getStagePoint(event));
    applyImageTransform();
  });
  stage.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      isPinching = true;
      viewerState = "zoom";
      pinchStartDistance = getTouchDistance(event.touches);
      pinchStartScale = zoomScale;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) return;
    if (viewerState === "zoom") {
      event.preventDefault();
      isDraggingZoom = true;
      dragStartX = touch.clientX;
      dragStartY = touch.clientY;
      dragStartPanX = panX;
      dragStartPanY = panY;
      return;
    }

    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
  }, { passive: false });
  stage.addEventListener("touchmove", (event) => {
    if (event.touches.length === 2 && pinchStartDistance > 0) {
      event.preventDefault();
      const midpoint = getTouchMidpoint(event.touches);
      const point = getStagePoint(midpoint);
      const nextScale = pinchStartScale * (getTouchDistance(event.touches) / pinchStartDistance);
      applyImageZoom(nextScale, point);
      return;
    }

    if (event.touches.length === 1 && isDraggingZoom) {
      event.preventDefault();
      panX = dragStartPanX + (event.touches[0].clientX - dragStartX);
      panY = dragStartPanY + (event.touches[0].clientY - dragStartY);
      clampPan();
      applyImageTransform();
    }
  }, { passive: false });
  stage.addEventListener("touchend", (event) => {
    if (event.touches.length < 2) {
      pinchStartDistance = 0;
      pinchStartScale = zoomScale;
      suppressClickUntil = Date.now() + 350;
      setTimeout(() => {
        isPinching = false;
      }, 120);
      if (zoomScale <= 1.01) {
        resetImageZoom();
      }
    }

    if (!event.touches.length && isDraggingZoom) {
      isDraggingZoom = false;
      suppressClickUntil = Date.now() + 250;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch || viewerState === "zoom") return;
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
