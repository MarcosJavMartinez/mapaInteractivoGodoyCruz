//infoPanelModule.js
let currentInfoPanel = null;
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

  const overlay = document.createElement("div");
  overlay.className = "image-viewer-overlay";
  overlay.addEventListener("click", closeImageViewer);

  const frame = document.createElement("div");
  frame.className = "image-viewer-frame";
  frame.addEventListener("click", (event) => event.stopPropagation());

  const closeButton = document.createElement("button");
  closeButton.className = "dialog-close-button image-viewer-close";
  closeButton.type = "button";
  closeButton.textContent = "X";
  closeButton.addEventListener("click", closeImageViewer);

  const image = document.createElement("img");
  image.alt = "";
  const counter = document.createElement("p");
  counter.className = "image-viewer-counter";

  const previousButton = document.createElement("button");
  previousButton.className = "image-viewer-nav image-viewer-prev";
  previousButton.type = "button";
  previousButton.textContent = "<";

  const nextButton = document.createElement("button");
  nextButton.className = "image-viewer-nav image-viewer-next";
  nextButton.type = "button";
  nextButton.textContent = ">";

  const updateImage = () => {
    image.src = images[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
    previousButton.hidden = images.length <= 1;
    nextButton.hidden = images.length <= 1;
  };

  const showPrevious = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  };

  previousButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);
  updateImage();

  frame.appendChild(closeButton);
  frame.appendChild(previousButton);
  frame.appendChild(image);
  frame.appendChild(nextButton);
  frame.appendChild(counter);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);
}

function closeImageViewer() {
  document.querySelectorAll(".image-viewer-overlay").forEach((viewer) => viewer.remove());
}
