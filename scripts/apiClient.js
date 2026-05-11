export async function fetchPlaces() {
  const response = await fetch("/api/places");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los lugares (${response.status})`);
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
