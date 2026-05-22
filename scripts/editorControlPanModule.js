const CONTROL_KEYS = new Set(["ControlLeft", "ControlRight"]);
const cameraPanRequests = new WeakMap();

export function setupControlPanWhileEditing(panel, camera, options = {}) {
  if (!panel || !camera) return;

  const isEditorOpen = options.isOpen || (() => !panel.hidden);
  let isControlDown = false;

  const syncPanState = () => {
    setPanelPanRequest(camera, panel, isControlDown && isEditorOpen());
  };

  document.addEventListener("keydown", (event) => {
    if (!CONTROL_KEYS.has(event.code)) return;

    isControlDown = true;
    syncPanState();
  }, true);

  document.addEventListener("keyup", (event) => {
    if (!CONTROL_KEYS.has(event.code)) return;

    isControlDown = false;
    syncPanState();
  }, true);

  window.addEventListener("blur", () => {
    isControlDown = false;
    syncPanState();
  });

  const panelObserver = new MutationObserver(syncPanState);
  panelObserver.observe(panel, {
    attributes: true,
    attributeFilter: ["hidden"],
  });

  return {
    sync: syncPanState,
    disable() {
      isControlDown = false;
      setPanelPanRequest(camera, panel, false);
    },
  };
}

function setPanelPanRequest(camera, panel, isEnabled) {
  const state = getCameraPanState(camera);
  if (!state) return;

  if (isEnabled) {
    state.panels.add(panel);
  } else {
    state.panels.delete(panel);
  }

  applyCameraPanEnabled(camera, state.panels.size > 0);
}

function getCameraPanState(camera) {
  if (!camera) return null;

  let state = cameraPanRequests.get(camera);
  if (!state) {
    state = { panels: new Set() };
    cameraPanRequests.set(camera, state);
  }
  return state;
}

function applyCameraPanEnabled(camera, isEnabled) {
  const controls = camera?.userData.controls;
  if (!controls) return;

  const shouldEnable = Boolean(isEnabled);
  controls.enablePan = shouldEnable;

  if (shouldEnable && controls.enabled === false) {
    controls.enabled = true;
  } else if (!shouldEnable && document.body.classList.contains("navigation-mode-walk")) {
    controls.enabled = false;
  }
}
