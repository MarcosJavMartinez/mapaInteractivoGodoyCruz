let currentInfoPanel = null;
let activeImageViewerKeyHandler = null;
let activeImageViewerCleanup = null;

export {
  currentInfoPanel,
  showContent,
  hideCurrentInfoPanel
};
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
  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button info-panel-close";
  closeButton.textContent = "X";
  closeButton.addEventListener("click", hideCurrentInfoPanel);
  panel.appendChild(closeButton);
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
  if (text) {
    const textElement = document.createElement("div");
    textElement.innerHTML = text;
    panel.appendChild(textElement);

    const Link = textElement.querySelector('a');
    if (Link) {
      Link.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(Link.href, "_blank");
      });
    }
  }
  if (exteriorGalleryImages.length > 0) {
    const exteriorGallery = document.createElement("div");
    exteriorGallery.className = "image-gallery";
    exteriorGalleryImages.forEach((imageUrl, index) => {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => openImageViewer(galleryImages, exteriorStartIndex + index));
      exteriorGallery.appendChild(image);
    });
    panel.appendChild(exteriorGallery);
  }
  if (interiorGalleryImages.length > 0) {
    const interiorGallery = document.createElement("div");
    interiorGallery.className = "image-gallery";
    interiorGalleryImages.forEach((imageUrl, index) => {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => openImageViewer(galleryImages, interiorStartIndex + index));
      interiorGallery.appendChild(image);
    });
    panel.appendChild(interiorGallery);
  }
  document.body.appendChild(panel);
  currentInfoPanel = panel;
}
function hideCurrentInfoPanel() {
  closeImageViewer();
  if (currentInfoPanel) {
    document.body.removeChild(currentInfoPanel);
    currentInfoPanel = null;
  }
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

  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button image-viewer-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar visor de imagenes");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", closeImageViewer);

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
