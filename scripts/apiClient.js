const ADMIN_TOKEN_STORAGE_KEY = "muviAdminToken";

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
  const response = await adminFetch("/api/collision-overrides", {
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
  const response = await adminFetch(`/api/places/${placeId}/camera-view`, {
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
  const response = await adminFetch(`/api/places/${placeId}`, {
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
  const response = await adminFetch("/api/places", {
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
  const response = await adminFetch(`/api/places/${placeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`No se pudo eliminar el marcador (${response.status})`);
  }

  return response.json();
}

export async function deleteUploadedImage(imagePath) {
  const response = await adminFetch("/api/uploads/image", {
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
  const response = await adminFetch("/api/uploads/image", {
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

export async function requireEditorAccess(label = "Clave de administrador") {
  const currentToken = getStoredAdminToken();
  if (currentToken && await verifyAdminToken(currentToken)) {
    return true;
  }

  const token = window.prompt(label);
  if (!token) return false;

  if (!await verifyAdminToken(token)) {
    window.alert("Clave incorrecta o servidor sin ADMIN_TOKEN configurado.");
    return false;
  }

  sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  return true;
}

async function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("X-Admin-Token", getStoredAdminToken() || "");

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  }

  return response;
}

async function verifyAdminToken(token) {
  const response = await fetch("/api/admin/verify", {
    method: "POST",
    headers: {
      "X-Admin-Token": token,
    },
  });

  return response.ok;
}

function getStoredAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}
