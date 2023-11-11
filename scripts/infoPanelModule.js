// infoPanelModule.js

let currentInfoPanel = null;

export {
  currentInfoPanel,
  showContent,
  hideCurrentInfoPanel
};

function showContent(title, imageUrl, text, exteriorImages, interiorImages) {
  hideCurrentInfoPanel();

  const panel = document.createElement("div");
  panel.className = "info-panel";

  const closeButton = document.createElement("button");
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

  if (exteriorImages && exteriorImages.length > 0) {
    const exteriorGallery = document.createElement("div");
    exteriorGallery.className = "image-gallery";
    for (const imageUrl of exteriorImages) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => {
        const zoomedWindow = window.open(imageUrl, "Zoomed Image", "width=800, height=600");
        if (zoomedWindow) {
          zoomedWindow.focus();
        } else {
          alert("Tu navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para ver la imagen ampliada.");
        }
      });
      exteriorGallery.appendChild(image);
    }
    panel.appendChild(exteriorGallery);
  }

  if (interiorImages && interiorImages.length > 0) {
    const interiorGallery = document.createElement("div");
    interiorGallery.className = "image-gallery";
    for (const imageUrl of interiorImages) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => {
        const zoomedWindow = window.open(imageUrl, "Zoomed Image", "width=800, height=600");
        if (zoomedWindow) {
          zoomedWindow.focus();
        } else {
          alert("Tu navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para ver la imagen ampliada.");
        }
      });
      interiorGallery.appendChild(image);
    }
    panel.appendChild(interiorGallery);
  }

  document.body.appendChild(panel);
  currentInfoPanel = panel;
}

function hideCurrentInfoPanel() {
  if (currentInfoPanel) {
    document.body.removeChild(currentInfoPanel);
    currentInfoPanel = null;
  }
}
