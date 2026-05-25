import { Vector3 } from "../vendor/three/build/three.module.js";

const MODE_ORBIT = "orbit";
const MODE_WALK = "walk";
const NAVIGATION_COLLIDERS_READY_EVENT = "navigation:colliders-ready";
const WALK_GROUND_Y = -1.86;
const PERSON_HEIGHT = 0.53;
const PERSON_RADIUS = 0.38;
const PERSON_WALK_SPEED = 1.72;
const PERSON_SPRINT_SPEED = 3.05;
const PERSON_BACKPEDAL_FACTOR = 0.72;
const PERSON_STRAFE_FACTOR = 0.88;
const PERSON_ACCELERATION = 10.5;
const PERSON_DECELERATION = 14;
const PERSON_AIR_CONTROL = 3.25;
const PERSON_JUMP_SPEED = 3.35;
const PERSON_GRAVITY = 11.4;
const GROUND_SNAP_DISTANCE = 0.35;
const NEAR_OBSTACLE_RADIUS = 3.2;
const COLLISION_STEP_DISTANCE = 0.12;
const COLLISION_EPSILON = 0.035;
const MAX_PENETRATION_RESOLVE_PASSES = 4;
const WALK_BOB_FREQUENCY = 7.2;
const SPRINT_BOB_FREQUENCY = 11.2;
const WALK_BOB_HEIGHT = 0.017;
const SPRINT_BOB_HEIGHT = 0.032;
const BOB_RECOVER_SPEED = 9;
const LOOK_SENSITIVITY = 0.0022;
const TOUCH_LOOK_SENSITIVITY = 0.0042;
const TOUCH_JOYSTICK_RADIUS = 54;
const TOUCH_JOYSTICK_DEADZONE = 0.16;
const TOUCH_JOYSTICK_RUN_THRESHOLD = 0.82;
const TOUCH_NAVIGATION_MAX_WIDTH = 900;
const MIN_X = -235;
const MAX_X = 145;
const MIN_Z = -300;
const MAX_Z = 245;
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
    planarVelocity: new Vector3(),
    viewBobOffset: 0,
    walkCycle: 0,
    collidersReady: Boolean(scene.userData.navigationCollidersReady),
    touchControls: createTouchControls(),
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
    if (state.mode === MODE_WALK && !isTouchNavigationActive(state) && document.pointerLockElement !== renderer.domElement) {
      renderer.domElement.requestPointerLock?.();
    }
  });

  bindTouchNavigationControls(camera, state);
  window.addEventListener("resize", () => {
    updateTouchNavigationClass(state);
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
    removeViewBob(camera, state);
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
  updateTouchNavigationClass(state);
  document.dispatchEvent(new CustomEvent("navigation:mode-changed", {
    detail: { mode },
  }));
  state.keys.clear();
  state.velocityY = 0;
  state.planarVelocity.set(0, 0, 0);
  state.viewBobOffset = 0;
  state.walkCycle = 0;
  resetTouchNavigation(state);
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
  state.planarVelocity.set(0, 0, 0);
  state.viewBobOffset = 0;
  state.walkCycle = 0;
  clampCameraPosition(camera.position);
  camera.rotation.order = "YXZ";
  applyFirstPersonRotation(camera, state);
}

function updateWalkMode(camera, state, delta) {
  removeViewBob(camera, state);
  resolveCurrentPenetration(camera.position, state, PERSON_RADIUS);

  const input = getPlanarMovement(state);
  const isMoving = input.lengthSq() > 0;
  const isSprinting = isSprintRequested(state) && hasKey(state, "KeyW", "w", "ArrowUp") && !hasKey(state, "KeyS", "s", "ArrowDown");
  const targetSpeed = getTargetPlanarSpeed(state, isSprinting);
  const inputStrength = clamp(input.length(), 0, 1);
  const targetVelocity = input.lengthSq() > 0
    ? input.normalize().multiplyScalar(targetSpeed * inputStrength)
    : new Vector3();

  const acceleration = isMoving
    ? (state.isGrounded ? PERSON_ACCELERATION : PERSON_AIR_CONTROL)
    : PERSON_DECELERATION;
  state.planarVelocity.lerp(targetVelocity, 1 - Math.exp(-acceleration * delta));
  if (!isMoving && state.planarVelocity.lengthSq() < 0.0001) {
    state.planarVelocity.set(0, 0, 0);
  }

  if (state.planarVelocity.lengthSq() > 0) {
    const previousX = camera.position.x;
    const previousZ = camera.position.z;
    const movement = state.planarVelocity.clone().multiplyScalar(delta);
    moveWithCollision(camera.position, movement, state, PERSON_RADIUS);
    state.planarVelocity.x = (camera.position.x - previousX) / Math.max(delta, 0.0001);
    state.planarVelocity.z = (camera.position.z - previousZ) / Math.max(delta, 0.0001);
  }

  if (hasKey(state, "Space", " ") && state.isGrounded) {
    state.velocityY = PERSON_JUMP_SPEED;
    state.isGrounded = false;
  }

  state.velocityY -= PERSON_GRAVITY * delta;
  camera.position.y += state.velocityY * delta;
  resolveGround(camera.position, state);

  clampCameraPosition(camera.position);
  applyViewBob(camera, state, delta, isMoving, isSprinting);
  applyFirstPersonRotation(camera, state);
}

function getTargetPlanarSpeed(state, isSprinting) {
  let speed = isSprinting ? PERSON_SPRINT_SPEED : PERSON_WALK_SPEED;
  const touchInput = state.touchControls?.movement || { x: 0, y: 0 };
  const movingBackward = (hasKey(state, "KeyS", "s", "ArrowDown") || touchInput.y < 0)
    && !hasKey(state, "KeyW", "w", "ArrowUp")
    && touchInput.y <= 0;
  const strafingOnly = (hasKey(state, "KeyA", "a", "ArrowLeft") || hasKey(state, "KeyD", "d", "ArrowRight") || Math.abs(touchInput.x) > TOUCH_JOYSTICK_DEADZONE)
    && !hasKey(state, "KeyW", "w", "ArrowUp")
    && !hasKey(state, "KeyS", "s", "ArrowDown")
    && Math.abs(touchInput.y) <= TOUCH_JOYSTICK_DEADZONE;

  if (movingBackward) speed *= PERSON_BACKPEDAL_FACTOR;
  if (strafingOnly) speed *= PERSON_STRAFE_FACTOR;
  return speed;
}

function getPlanarMovement(state) {
  const forward = getForwardVector(state.yaw);
  const right = new Vector3(-forward.z, 0, forward.x);
  const movement = new Vector3();
  const touchInput = state.touchControls?.movement || { x: 0, y: 0 };

  if (hasKey(state, "KeyW", "w", "ArrowUp")) movement.add(forward);
  if (hasKey(state, "KeyS", "s", "ArrowDown")) movement.sub(forward);
  if (hasKey(state, "KeyD", "d", "ArrowRight")) movement.add(right);
  if (hasKey(state, "KeyA", "a", "ArrowLeft")) movement.sub(right);
  if (touchInput.y) movement.addScaledVector(forward, touchInput.y);
  if (touchInput.x) movement.addScaledVector(right, touchInput.x);

  return movement;
}

function getForwardVector(yaw) {
  return new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

function applyViewBob(camera, state, delta, isMoving, isSprinting) {
  const horizontalSpeed = Math.hypot(state.planarVelocity.x, state.planarVelocity.z);
  const shouldBob = state.isGrounded && isMoving && horizontalSpeed > 0.08;

  if (shouldBob) {
    const speedRatio = clamp(horizontalSpeed / PERSON_SPRINT_SPEED, 0, 1);
    const frequency = isSprinting ? SPRINT_BOB_FREQUENCY : WALK_BOB_FREQUENCY;
    const height = isSprinting ? SPRINT_BOB_HEIGHT : WALK_BOB_HEIGHT;
    state.walkCycle += delta * frequency * (0.45 + speedRatio * 0.55);
    state.viewBobOffset = Math.abs(Math.sin(state.walkCycle)) * height * (0.35 + speedRatio * 0.65);
  } else {
    state.walkCycle = 0;
    state.viewBobOffset += (0 - state.viewBobOffset) * (1 - Math.exp(-BOB_RECOVER_SPEED * delta));
    if (Math.abs(state.viewBobOffset) < 0.0005) {
      state.viewBobOffset = 0;
    }
  }

  camera.position.y += state.viewBobOffset;
}

function removeViewBob(camera, state) {
  if (!state.viewBobOffset) return;
  camera.position.y -= state.viewBobOffset;
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
  const fallingOrClose = state.velocityY <= 0;

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

  if (currentObstacle && isInsideObstacle(position, currentObstacle)) {
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

  return moved;
}

function collidesAt(position, state, radius) {
  return Boolean(getBlockingObstacle(position, state, radius));
}

function getBlockingObstacle(position, state, radius) {
  const obstacles = getNearbyNavigationObstacles(position, state);
  if (!obstacles.length) return null;

  return obstacles.find((obstacle) => isCircleTouchingObstacle(position, radius, obstacle)) || null;
}

function getNearbyNavigationObstacles(position, state) {
  const obstacles = state.scene?.userData.navigationObstacles || [];
  return obstacles.filter((obstacle) => isObstacleNearPointXZ(obstacle, position, NEAR_OBSTACLE_RADIUS));
}

function isObstacleNearPointXZ(obstacle, position, radius) {
  if (hasObstacleRotation(obstacle)) {
    const center = getObstacleCenter(obstacle);
    const half = getObstacleHalfSize(obstacle);
    const reach = Math.hypot(half.x, half.z) + radius;
    return planarDistanceSq(position, center) <= reach ** 2;
  }

  return isBoxNearPointXZ(obstacle.box, position, radius);
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

function isCircleTouchingObstacle(position, radius, obstacle) {
  if (hasObstacleRotation(obstacle)) {
    const localPosition = worldToObstacleLocal(position, obstacle);
    const half = getObstacleHalfSize(obstacle);
    const closestX = clamp(localPosition.x, -half.x, half.x);
    const closestZ = clamp(localPosition.z, -half.z, half.z);
    const distanceSq = ((localPosition.x - closestX) ** 2) + ((localPosition.z - closestZ) ** 2);
    return distanceSq <= radius ** 2;
  }

  return isCircleTouchingBox(position, radius, obstacle.box);
}

function isCircleTouchingBox(position, radius, box) {
  const closestX = clamp(position.x, box.min.x, box.max.x);
  const closestZ = clamp(position.z, box.min.z, box.max.z);
  const distanceSq = ((position.x - closestX) ** 2) + ((position.z - closestZ) ** 2);
  return distanceSq <= radius ** 2;
}

function resolveCurrentPenetration(position, state, radius) {
  for (let pass = 0; pass < MAX_PENETRATION_RESOLVE_PASSES; pass += 1) {
    const obstacle = getBlockingObstacle(position, state, radius);
    if (!obstacle || !isInsideObstacle(position, obstacle)) return;

    const pushedPosition = getNearestPositionOutsideObstacle(position, obstacle, radius);
    position.x = pushedPosition.x;
    position.z = pushedPosition.z;
    clampCameraPosition(position);
  }
}

function getNearestPositionOutsideObstacle(position, obstacle, radius) {
  if (hasObstacleRotation(obstacle)) {
    const localPosition = worldToObstacleLocal(position, obstacle);
    const half = getObstacleHalfSize(obstacle);
    const exits = [
      { axis: "x", value: -half.x - radius - COLLISION_EPSILON, distance: Math.abs(localPosition.x + half.x) },
      { axis: "x", value: half.x + radius + COLLISION_EPSILON, distance: Math.abs(half.x - localPosition.x) },
      { axis: "z", value: -half.z - radius - COLLISION_EPSILON, distance: Math.abs(localPosition.z + half.z) },
      { axis: "z", value: half.z + radius + COLLISION_EPSILON, distance: Math.abs(half.z - localPosition.z) },
    ].sort((a, b) => a.distance - b.distance);
    localPosition[exits[0].axis] = exits[0].value;
    return obstacleLocalToWorld(localPosition, obstacle);
  }

  return getNearestPositionOutsideBox(position, obstacle.box, radius);
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

function isInsideObstacle(position, obstacle) {
  if (hasObstacleRotation(obstacle)) {
    const localPosition = worldToObstacleLocal(position, obstacle);
    const half = getObstacleHalfSize(obstacle);
    return localPosition.x > -half.x
      && localPosition.x < half.x
      && localPosition.z > -half.z
      && localPosition.z < half.z;
  }

  return isInsideObstacleBox(position, obstacle.box);
}

function isInsideObstacleBox(position, box) {
  return position.x > box.min.x
    && position.x < box.max.x
    && position.z > box.min.z
    && position.z < box.max.z;
}

function hasObstacleRotation(obstacle) {
  return Math.abs(obstacle.rotationY || 0) > 0.0001;
}

function getObstacleHalfSize(obstacle) {
  return {
    x: (obstacle.box.max.x - obstacle.box.min.x) / 2,
    z: (obstacle.box.max.z - obstacle.box.min.z) / 2,
  };
}

function worldToObstacleLocal(position, obstacle) {
  const center = getObstacleCenter(obstacle);
  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const angle = -(obstacle.rotationY || 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: dx * cos - dz * sin,
    z: dx * sin + dz * cos,
  };
}

function obstacleLocalToWorld(localPosition, obstacle) {
  const center = getObstacleCenter(obstacle);
  const angle = obstacle.rotationY || 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: center.x + localPosition.x * cos - localPosition.z * sin,
    z: center.z + localPosition.x * sin + localPosition.z * cos,
  };
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

function isSprintRequested(state) {
  return state.keys.has("ShiftLeft")
    || state.keys.has("ShiftRight")
    || (state.touchControls?.movement?.strength || 0) >= TOUCH_JOYSTICK_RUN_THRESHOLD;
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

function createTouchControls() {
  const root = document.createElement("div");
  root.className = "touch-navigation-controls";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="touch-joystick" data-touch-joystick>
      <span class="touch-joystick-knob"></span>
    </div>
    <div class="touch-look-pad" data-touch-look-pad></div>
    <button class="touch-action-button touch-action-button-interact" type="button" data-touch-interact>Ver ficha</button>
  `;
  document.body.appendChild(root);

  return {
    root,
    joystick: root.querySelector("[data-touch-joystick]"),
    knob: root.querySelector(".touch-joystick-knob"),
    lookPad: root.querySelector("[data-touch-look-pad]"),
    interactButton: root.querySelector("[data-touch-interact]"),
    movement: { x: 0, y: 0, strength: 0 },
    joystickPointerId: null,
    lookPointerId: null,
    joystickCenter: { x: 0, y: 0 },
    lastLookPoint: { x: 0, y: 0 },
  };
}

function bindTouchNavigationControls(camera, state) {
  const controls = state.touchControls;
  if (!controls?.root) return;

  controls.joystick?.addEventListener("pointerdown", (event) => {
    if (state.mode !== MODE_WALK) return;
    event.preventDefault();
    controls.joystickPointerId = event.pointerId;
    controls.joystick.setPointerCapture?.(event.pointerId);
    const rect = controls.joystick.getBoundingClientRect();
    controls.joystickCenter.x = rect.left + rect.width / 2;
    controls.joystickCenter.y = rect.top + rect.height / 2;
    updateTouchMovement(event, controls);
  });

  controls.joystick?.addEventListener("pointermove", (event) => {
    if (event.pointerId !== controls.joystickPointerId) return;
    event.preventDefault();
    updateTouchMovement(event, controls);
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerId !== controls.joystickPointerId) return;
    event.preventDefault();
    updateTouchMovement(event, controls);
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    controls.joystick?.addEventListener(eventName, (event) => {
      if (event.pointerId !== controls.joystickPointerId) return;
      resetTouchMovement(controls);
    });
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (event.pointerId !== controls.joystickPointerId) return;
      resetTouchMovement(controls);
    });
  });

  controls.lookPad?.addEventListener("pointerdown", (event) => {
    if (state.mode !== MODE_WALK) return;
    event.preventDefault();
    controls.lookPointerId = event.pointerId;
    controls.lookPad.setPointerCapture?.(event.pointerId);
    controls.lastLookPoint.x = event.clientX;
    controls.lastLookPoint.y = event.clientY;
  });

  controls.lookPad?.addEventListener("pointermove", (event) => {
    if (event.pointerId !== controls.lookPointerId) return;
    event.preventDefault();
    const deltaX = event.clientX - controls.lastLookPoint.x;
    const deltaY = event.clientY - controls.lastLookPoint.y;
    controls.lastLookPoint.x = event.clientX;
    controls.lastLookPoint.y = event.clientY;
    state.yaw -= deltaX * TOUCH_LOOK_SENSITIVITY;
    state.pitch = clampPitch(state.pitch - deltaY * TOUCH_LOOK_SENSITIVITY);
    applyFirstPersonRotation(camera, state);
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerId !== controls.lookPointerId) return;
    event.preventDefault();
    updateTouchLook(event, camera, state, controls);
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    controls.lookPad?.addEventListener(eventName, (event) => {
      if (event.pointerId !== controls.lookPointerId) return;
      controls.lookPointerId = null;
    });
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (event.pointerId !== controls.lookPointerId) return;
      controls.lookPointerId = null;
    });
  });

  controls.interactButton?.addEventListener("click", () => {
    if (state.mode !== MODE_WALK) return;
    document.dispatchEvent(new CustomEvent("navigation:interact-centered"));
  });
}

function updateTouchMovement(event, controls) {
  const deltaX = event.clientX - controls.joystickCenter.x;
  const deltaY = event.clientY - controls.joystickCenter.y;
  const distance = Math.min(Math.hypot(deltaX, deltaY), TOUCH_JOYSTICK_RADIUS);
  const angle = Math.atan2(deltaY, deltaX);
  const knobX = Math.cos(angle) * distance;
  const knobY = Math.sin(angle) * distance;
  const movementX = knobX / TOUCH_JOYSTICK_RADIUS;
  const movementY = -(knobY / TOUCH_JOYSTICK_RADIUS);
  controls.movement.x = Math.abs(movementX) > TOUCH_JOYSTICK_DEADZONE
    ? movementX
    : 0;
  controls.movement.y = Math.abs(movementY) > TOUCH_JOYSTICK_DEADZONE
    ? movementY
    : 0;
  controls.movement.strength = Math.hypot(controls.movement.x, controls.movement.y);
  if (controls.knob) {
    controls.knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  }
}

function updateTouchLook(event, camera, state, controls) {
  const deltaX = event.clientX - controls.lastLookPoint.x;
  const deltaY = event.clientY - controls.lastLookPoint.y;
  controls.lastLookPoint.x = event.clientX;
  controls.lastLookPoint.y = event.clientY;
  state.yaw -= deltaX * TOUCH_LOOK_SENSITIVITY;
  state.pitch = clampPitch(state.pitch - deltaY * TOUCH_LOOK_SENSITIVITY);
  applyFirstPersonRotation(camera, state);
}

function resetTouchMovement(controls) {
  controls.joystickPointerId = null;
  controls.movement.x = 0;
  controls.movement.y = 0;
  controls.movement.strength = 0;
  if (controls.knob) {
    controls.knob.style.transform = "translate(0, 0)";
  }
}

function resetTouchNavigation(state) {
  const controls = state.touchControls;
  if (!controls) return;
  resetTouchMovement(controls);
  controls.lookPointerId = null;
}

function isTouchNavigationActive(state) {
  return Boolean(
    state.touchControls?.root
    && (matchMedia("(pointer: coarse)").matches || window.innerWidth <= TOUCH_NAVIGATION_MAX_WIDTH)
  );
}

function updateTouchNavigationClass(state) {
  document.body.classList.toggle("navigation-mode-touch", state.mode === MODE_WALK && isTouchNavigationActive(state));
}
