const CAMERA_VIEW_STORAGE_KEY = "muviCameraViews";

export function getSavedCameraView(title) {
  const savedView = getSavedCameraViews()[title];
  return isCameraView(savedView) ? savedView : null;
}

export function getSavedCameraViews() {
  try {
    return JSON.parse(localStorage.getItem(CAMERA_VIEW_STORAGE_KEY) || "{}");
  } catch (_error) {
    return {};
  }
}

export function saveCameraView(title, view) {
  if (!title || !isCameraView(view)) return false;

  const savedViews = getSavedCameraViews();
  savedViews[title] = view;
  localStorage.setItem(CAMERA_VIEW_STORAGE_KEY, JSON.stringify(savedViews, null, 2));
  return true;
}

export function isCameraView(view) {
  return Array.isArray(view?.position)
    && Array.isArray(view?.target)
    && view.position.length === 3
    && view.target.length === 3
    && view.position.every(Number.isFinite)
    && view.target.every(Number.isFinite);
}
