export async function fetchPlaces() {
  const response = await fetch("/api/places");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los lugares (${response.status})`);
  }

  return response.json();
}

export async function fetchCollisionOverrides() {
  const response = await fetch("/api/collision-overrides");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las colisiones (${response.status})`);
  }

  return response.json();
}

export async function saveCollisionOverrides(colliders) {
  const response = await fetch("/api/collision-overrides", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ colliders }),
  });

  if (!response.ok) {
    throw new Error(`No se pudieron guardar las colisiones (${response.status})`);
  }

  return response.json();
}

export async function savePlaceCameraView(placeId, cameraView) {
  const response = await fetch(`/api/places/${placeId}/camera-view`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cameraView),
  });

  if (!response.ok) {
    throw new Error(`No se pudo guardar la vista (${response.status})`);
  }

  return response.json();
}

export async function savePlace(placeId, place) {
  const response = await fetch(`/api/places/${placeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(place),
  });

  if (!response.ok) {
    throw new Error(`No se pudo guardar el marcador (${response.status})`);
  }

  return response.json();
}

export async function createPlace(place) {
  const response = await fetch("/api/places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(place),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear el marcador (${response.status})`);
  }

  return response.json();
}

export async function deletePlace(placeId) {
  const response = await fetch(`/api/places/${placeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`No se pudo eliminar el marcador (${response.status})`);
  }

  return response.json();
}

export async function deleteUploadedImage(imagePath) {
  const response = await fetch("/api/uploads/image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: imagePath }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo eliminar la imagen (${response.status})`);
  }

  return response.json();
}

export async function uploadImage(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const response = await fetch("/api/uploads/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      type: file.type,
      dataUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo subir la imagen (${response.status})`);
  }

  return response.json();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}
