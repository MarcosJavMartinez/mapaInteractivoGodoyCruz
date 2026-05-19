import { Vector3 } from "../vendor/three/build/three.module.js";

const MODE_ORBIT = "orbit";
const MODE_WALK = "walk";
const NAVIGATION_COLLIDERS_READY_EVENT = "navigation:colliders-ready";
const WALK_GROUND_Y = -1.86;
const PERSON_HEIGHT = 0.53;
const PERSON_RADIUS = 0.38;
const PERSON_SPEED = 2.1;
const PERSON_JUMP_SPEED = 4.5;
const PERSON_GRAVITY = 9.8;
const GROUND_SNAP_DISTANCE = 0.35;
const NEAR_OBSTACLE_RADIUS = 3.2;
const COLLISION_STEP_DISTANCE = 0.12;
const COLLISION_EPSILON = 0.035;
const LOOK_SENSITIVITY = 0.0022;
const MIN_X = -235;
const MAX_X = 125;
const MIN_Z = -150;
const MAX_Z = 210;
const MIN_PITCH = degreesToRadians(-72);
const MAX_PITCH = degreesToRadians(62);
const WALK_READY_TITLE = "WASD para moverse, espacio para saltar, mouse para mirar";
const WALK_LOADING_TITLE = "Cargando edificios y colisiones";

export function setupNavigationModes(camera, renderer, scene) {
  const modeButtons = document.querySelectorAll("[data-navigation-mode]");
  if (!camera || !renderer || !modeButtons.length) return;

  const state = {
    mode: MODE_ORBIT,
    keys: new Set(),
    yaw: 0,
    pitch: 0,
    velocityY: 0,
    frameId: null,
    lastTime: performance.now(),
    savedOrbit: null,
    scene,
    isGrounded: false,
    groundY: WALK_GROUND_Y,
    collidersReady: Boolean(scene.userData.navigationCollidersReady),
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setNavigationMode(button.dataset.navigationMode, { camera, renderer, modeButtons, state });
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!isKeyboardMode(state.mode) || document.pointerLockElement !== renderer.domElement || isTypingTarget(event.target)) return;
    state.keys.add(event.code);
    state.keys.add(event.key.toLowerCase());
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.code);
    state.keys.delete(event.key.toLowerCase());
  });

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement !== renderer.domElement && state.mode === MODE_WALK) {
      state.keys.clear();
      state.pitch = clampPitch(state.pitch);
    }
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (state.mode !== MODE_WALK || document.pointerLockElement !== renderer.domElement) return;
    state.yaw -= event.movementX * LOOK_SENSITIVITY;
    state.pitch = clampPitch(state.pitch - event.movementY * LOOK_SENSITIVITY);
    applyFirstPersonRotation(camera, state);
  });

  renderer.domElement.addEventListener("click", () => {
    if (state.mode === MODE_WALK && document.pointerLockElement !== renderer.domElement) {
      renderer.domElement.requestPointerLock?.();
    }
  });

  document.addEventListener(NAVIGATION_COLLIDERS_READY_EVENT, (event) => {
    state.collidersReady = Boolean(event.detail?.ready || scene.userData.navigationCollidersReady);
    setButtonsActive(modeButtons, state.mode, state);
  });

  setNavigationMode(MODE_ORBIT, { camera, renderer, modeButtons, state });
}

function setNavigationMode(mode, { camera, renderer, modeButtons, state }) {
  if (![MODE_ORBIT, MODE_WALK].includes(mode)) return;
  if (mode === MODE_WALK && !state.collidersReady) {
    setButtonsActive(modeButtons, state.mode, state);
    return;
  }

  const controls = camera.userData.controls;
  if (state.mode !== MODE_ORBIT && mode === MODE_ORBIT) {
    restoreOrbitControls(camera, state);
  }

  if (state.frameId) {
    cancelAnimationFrame(state.frameId);
    state.frameId = null;
  }

  if (mode !== MODE_WALK && document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock?.();
  }

  state.mode = mode;
  document.body.classList.toggle("navigation-mode-walk", mode === MODE_WALK);
  document.dispatchEvent(new CustomEvent("navigation:mode-changed", {
    detail: { mode },
  }));
  state.keys.clear();
  state.velocityY = 0;
  state.lastTime = performance.now();

  if (mode === MODE_ORBIT) {
    state.isGrounded = false;
    state.velocityY = 0;
    state.keys.clear();
    if (controls) {
      controls.enabled = true;
      controls.enablePan = false;
      controls.update();
    }
  } else {
    saveOrbitControls(camera, state);
    if (controls) {
      controls.enabled = false;
      controls.autoRotate = false;
    }
    setupFreeCamera(camera, state, mode);
    state.frameId = requestAnimationFrame((now) => updateNavigationMode(now, { camera, modeButtons, state }));
  }

  setButtonsActive(modeButtons, mode, state);
}

function updateNavigationMode(now, context) {
  const { camera, modeButtons, state } = context;
  const delta = Math.min((now - state.lastTime) / 1000, 0.05);
  state.lastTime = now;

  if (state.mode === MODE_WALK) {
    updateWalkMode(camera, state, delta);
  }

  setButtonsActive(modeButtons, state.mode, state);
  state.frameId = requestAnimationFrame((nextNow) => updateNavigationMode(nextNow, context));
}

function setupFreeCamera(camera, state, mode) {
  const direction = new Vector3();
  camera.getWorldDirection(direction);
  state.yaw = Math.atan2(-direction.x, -direction.z);
  state.pitch = Math.asin(direction.y);

  const floorHeight = getWalkCameraHeight();
  camera.position.y = Math.max(camera.position.y, floorHeight + 0.02);
  state.isGrounded = false;
  state.velocityY = 0;
  clampCameraPosition(camera.position);
  camera.rotation.order = "YXZ";
  applyFirstPersonRotation(camera, state);
}

function updateWalkMode(camera, state, delta) {
  resolveCurrentPenetration(camera.position, state, PERSON_RADIUS);

  const movement = getPlanarMovement(state);
  const speed = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight")
    ? PERSON_SPEED * 1.55
    : PERSON_SPEED;

  if (movement.lengthSq() > 0) {
    movement.normalize().multiplyScalar(speed * delta);
    moveWithCollision(camera.position, movement, state, PERSON_RADIUS);
  }

  if (hasKey(state, "Space", " ") && state.isGrounded) {
    state.velocityY = PERSON_JUMP_SPEED;
    state.isGrounded = false;
  }

  state.velocityY -= PERSON_GRAVITY * delta;
  camera.position.y += state.velocityY * delta;
  resolveGround(camera.position, state);

  clampCameraPosition(camera.position);
  applyFirstPersonRotation(camera, state);
}

function getPlanarMovement(state) {
  const forward = getForwardVector(state.yaw);
  const right = new Vector3(-forward.z, 0, forward.x);
  const movement = new Vector3();

  if (hasKey(state, "KeyW", "w", "ArrowUp")) movement.add(forward);
  if (hasKey(state, "KeyS", "s", "ArrowDown")) movement.sub(forward);
  if (hasKey(state, "KeyD", "d", "ArrowRight")) movement.add(right);
  if (hasKey(state, "KeyA", "a", "ArrowLeft")) movement.sub(right);

  return movement;
}

function getForwardVector(yaw) {
  return new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

function applyFirstPersonRotation(camera, state) {
  camera.rotation.set(state.pitch, state.yaw, 0, "YXZ");
}

function getWalkCameraHeight() {
  return WALK_GROUND_Y + PERSON_HEIGHT;
}

function resolveGround(position, state) {
  state.groundY = WALK_GROUND_Y;
  const groundY = WALK_GROUND_Y;
  const desiredY = groundY + PERSON_HEIGHT;
  const fallingOrClose = state.velocityY <= 0 || position.y < desiredY + GROUND_SNAP_DISTANCE;

  if (fallingOrClose && position.y <= desiredY + GROUND_SNAP_DISTANCE) {
    position.y = desiredY;
    state.velocityY = 0;
    state.isGrounded = true;
  } else {
    state.isGrounded = false;
  }

  if (position.y < getWalkCameraHeight()) {
    position.y = getWalkCameraHeight();
    state.velocityY = 0;
    state.isGrounded = true;
    state.groundY = WALK_GROUND_Y;
  }
}

function moveWithCollision(position, movement, state, radius) {
  if (movement.lengthSq() === 0) return;

  const steps = Math.max(1, Math.ceil(movement.length() / COLLISION_STEP_DISTANCE));
  const stepMovement = movement.clone().multiplyScalar(1 / steps);

  for (let index = 0; index < steps; index += 1) {
    if (!moveWithCollisionStep(position, stepMovement, state, radius)) break;
  }
}

function moveWithCollisionStep(position, movement, state, radius) {
  const currentObstacle = getBlockingObstacle(position, state, radius);
  const nextPosition = position.clone().add(movement);
  clampCameraPosition(nextPosition);

  if (currentObstacle && isInsideObstacleBox(position, currentObstacle.box)) {
    const currentCenter = getObstacleCenter(currentObstacle);
    const currentDistanceSq = planarDistanceSq(position, currentCenter);
    const nextDistanceSq = planarDistanceSq(nextPosition, currentCenter);

    if (nextDistanceSq > currentDistanceSq) {
      position.copy(nextPosition);
      return true;
    }
  }

  if (!collidesAt(nextPosition, state, radius)) {
    position.copy(nextPosition);
    return true;
  }

  const xOnly = position.clone().add(new Vector3(movement.x, 0, 0));
  const zOnly = position.clone().add(new Vector3(0, 0, movement.z));
  clampCameraPosition(xOnly);
  clampCameraPosition(zOnly);
  let moved = false;

  if (!collidesAt(xOnly, state, radius)) {
    position.x = xOnly.x;
    moved = true;
  }

  if (!collidesAt(zOnly, state, radius)) {
    position.z = zOnly.z;
    moved = true;
  }

  if (!moved) {
    state.keys.clear();
  }

  return moved;
}

function collidesAt(position, state, radius) {
  return Boolean(getBlockingObstacle(position, state, radius));
}

function getBlockingObstacle(position, state, radius) {
  const obstacles = getNearbyNavigationObstacles(position, state);
  if (!obstacles.length) return null;

  return obstacles.find(({ box }) => isCircleTouchingBox(position, radius, box)) || null;
}

function getNearbyNavigationObstacles(position, state) {
  const obstacles = state.scene?.userData.navigationObstacles || [];
  return obstacles.filter(({ box }) => isBoxNearPointXZ(box, position, NEAR_OBSTACLE_RADIUS));
}

function isBoxNearPointXZ(box, position, radius) {
  const closestX = clamp(position.x, box.min.x, box.max.x);
  const closestZ = clamp(position.z, box.min.z, box.max.z);
  const distanceSq = ((position.x - closestX) ** 2) + ((position.z - closestZ) ** 2);
  return distanceSq <= radius ** 2;
}

function getObstacleCenter(obstacle) {
  return {
    x: (obstacle.box.min.x + obstacle.box.max.x) / 2,
    z: (obstacle.box.min.z + obstacle.box.max.z) / 2,
  };
}

function planarDistanceSq(position, point) {
  return ((position.x - point.x) ** 2) + ((position.z - point.z) ** 2);
}

function isCircleTouchingBox(position, radius, box) {
  const closestX = clamp(position.x, box.min.x, box.max.x);
  const closestZ = clamp(position.z, box.min.z, box.max.z);
  const distanceSq = ((position.x - closestX) ** 2) + ((position.z - closestZ) ** 2);
  return distanceSq <= radius ** 2;
}

function resolveCurrentPenetration(position, state, radius) {
  const obstacle = getBlockingObstacle(position, state, radius);
  if (!obstacle || !isInsideObstacleBox(position, obstacle.box)) return;

  const pushedPosition = getNearestPositionOutsideBox(position, obstacle.box, radius);
  position.x = pushedPosition.x;
  position.z = pushedPosition.z;
  clampCameraPosition(position);
}

function getNearestPositionOutsideBox(position, box, radius) {
  const exits = [
    { axis: "x", value: box.min.x - radius - COLLISION_EPSILON, distance: Math.abs(position.x - box.min.x) },
    { axis: "x", value: box.max.x + radius + COLLISION_EPSILON, distance: Math.abs(box.max.x - position.x) },
    { axis: "z", value: box.min.z - radius - COLLISION_EPSILON, distance: Math.abs(position.z - box.min.z) },
    { axis: "z", value: box.max.z + radius + COLLISION_EPSILON, distance: Math.abs(box.max.z - position.z) },
  ].sort((a, b) => a.distance - b.distance);
  const pushedPosition = { x: position.x, z: position.z };
  pushedPosition[exits[0].axis] = exits[0].value;
  return pushedPosition;
}

function isInsideObstacleBox(position, box) {
  return position.x > box.min.x
    && position.x < box.max.x
    && position.z > box.min.z
    && position.z < box.max.z;
}

function saveOrbitControls(camera, state) {
  if (state.savedOrbit) return;

  const controls = camera.userData.controls;
  state.savedOrbit = {
    position: camera.position.clone(),
    target: controls?.target?.clone() || null,
  };
}

function restoreOrbitControls(camera, state) {
  const controls = camera.userData.controls;
  if (!state.savedOrbit) return;

  if (controls && state.savedOrbit.target) {
    camera.position.copy(state.savedOrbit.position);
    controls.target.copy(state.savedOrbit.target);
    controls.update();
  }
  state.savedOrbit = null;
}

function setButtonsActive(buttons, mode, state) {
  buttons.forEach((button) => {
    const isActive = button.dataset.navigationMode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    if (button.dataset.navigationMode === MODE_WALK) {
      button.disabled = !state.collidersReady;
      button.classList.toggle("is-loading", !state.collidersReady);
      button.setAttribute("title", state.collidersReady ? WALK_READY_TITLE : WALK_LOADING_TITLE);
    }
  });
}

function clampCameraPosition(position) {
  position.x = clamp(position.x, MIN_X, MAX_X);
  position.z = clamp(position.z, MIN_Z, MAX_Z);
}

function clampPitch(value) {
  return clamp(value, MIN_PITCH, MAX_PITCH);
}

function isKeyboardMode(mode) {
  return mode === MODE_WALK;
}

function hasKey(state, ...keys) {
  return keys.some((key) => state.keys.has(key));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function isTypingTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}
