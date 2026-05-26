import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
} from "../vendor/three/build/three.module.js";

const MARKER_TEXTURE_PATH = "images/marcador-de-alfiler-01.png";

let markerTexture = null;
let markerGlowTexture = null;
let markerGlowCanvas = null;
let activeRippleGeometry = null;

export function createMarkersFromPlaces(scene, buttons, places) {
  places.forEach((place) => {
    createMarkerFromPlace(scene, buttons, place);
  });
}

export function createMarkerFromPlace(scene, buttons, place) {
  return createMarker(scene, buttons, {
    position: new Vector3(...place.position),
    title: place.title,
    imageUrl: place.imageUrl,
    text: place.text,
    exteriorImages: place.exteriorImages || [],
    interiorImages: place.interiorImages || [],
    cameraView: place.cameraView,
    placeId: place.id,
    slug: place.slug,
  });
}

function createMarker(scene, buttons, place) {
  const material = new SpriteMaterial({
    map: getMarkerTexture(),
    transparent: true,
    alphaTest: 0.18,
    depthTest: true,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });

  const sprite = new Sprite(material);
  const activeOutline = createActiveMarkerOutline();
  const activeRipple = createActiveMarkerRipple();

  sprite.center.set(0.5, 0);
  sprite.renderOrder = 999;
  sprite.frustumCulled = false;
  sprite.position.copy(place.position);
  sprite.scale.set(2, 2, 2);
  sprite.userData.markerScreenScale = 0.032;
  sprite.userData.markerMinScale = 1.1;
  sprite.userData.markerMaxScale = 11;
  sprite.userData.isHovered = false;
  sprite.userData.isActive = false;
  sprite.userData.activeOutline = activeOutline;
  sprite.userData.activeRipple = activeRipple;
  sprite.userData.title = place.title;
  sprite.userData.imageUrl = place.imageUrl;
  sprite.userData.text = place.text;
  sprite.userData.exteriorImages = place.exteriorImages;
  sprite.userData.interiorImages = place.interiorImages;
  sprite.userData.cameraView = place.cameraView;
  sprite.userData.placeId = place.placeId;
  sprite.userData.slug = place.slug;
  sprite.add(activeOutline);
  sprite.add(activeRipple);
  scene.add(sprite);
  buttons.push(sprite);
  return sprite;
}

function createActiveMarkerOutline() {
  const material = new SpriteMaterial({
    map: getMarkerGlowTexture(),
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    alphaTest: 0.01,
    depthTest: true,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });

  const outline = new Sprite(material);
  outline.center.set(0.5, 0);
  outline.renderOrder = 998;
  outline.frustumCulled = false;
  outline.visible = false;
  outline.scale.setScalar(1);
  outline.userData.ignoreMarkerInteractionOcclusion = true;
  return outline;
}

function createActiveMarkerRipple() {
  const material = new MeshBasicMaterial({
    color: 0xfffcf4,
    transparent: true,
    opacity: 0,
    side: DoubleSide,
    depthTest: true,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });

  const ripple = new Mesh(getActiveRippleGeometry(), material);
  ripple.position.y = 0.02;
  ripple.rotation.x = -Math.PI / 2;
  ripple.renderOrder = 997;
  ripple.frustumCulled = false;
  ripple.visible = false;
  ripple.userData.ignoreMarkerInteractionOcclusion = true;
  return ripple;
}

function getActiveRippleGeometry() {
  if (!activeRippleGeometry) {
    activeRippleGeometry = new RingGeometry(0.48, 0.56, 64);
  }

  return activeRippleGeometry;
}

function getMarkerTexture() {
  if (markerTexture) return markerTexture;

  markerTexture = new TextureLoader().load(MARKER_TEXTURE_PATH, (texture) => {
    configureMarkerTexture(texture);
    updateMarkerGlowTexture(texture.image);
  });
  configureMarkerTexture(markerTexture);
  return markerTexture;
}

function getMarkerGlowTexture() {
  if (markerGlowTexture) return markerGlowTexture;

  markerGlowCanvas = document.createElement("canvas");
  markerGlowCanvas.width = 128;
  markerGlowCanvas.height = 128;
  markerGlowTexture = new CanvasTexture(markerGlowCanvas);
  configureMarkerTexture(markerGlowTexture);
  const texture = getMarkerTexture();
  updateMarkerGlowTexture(texture.image);
  return markerGlowTexture;
}

function updateMarkerGlowTexture(image) {
  if (!markerGlowTexture || !markerGlowCanvas || !image?.width || !image?.height) return;

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");
  const context = markerGlowCanvas.getContext("2d");
  if (!maskContext || !context) return;

  markerGlowCanvas.width = width;
  markerGlowCanvas.height = height;
  maskCanvas.width = width;
  maskCanvas.height = height;

  maskContext.clearRect(0, 0, width, height);
  maskContext.drawImage(image, 0, 0, width, height);
  maskContext.globalCompositeOperation = "source-in";
  maskContext.fillStyle = "#ffffff";
  maskContext.fillRect(0, 0, width, height);

  context.clearRect(0, 0, width, height);
  drawGlowLayer(context, maskCanvas, width, height, 0.052, 0.34, 18, 0.032);
  drawGlowLayer(context, maskCanvas, width, height, 0.028, 0.62, 14, 0.018);
  context.filter = "blur(1.5px)";
  context.globalAlpha = 0.1;
  context.drawImage(maskCanvas, 0, 0);
  context.filter = "none";
  context.globalAlpha = 1;

  markerGlowTexture.needsUpdate = true;
}

function drawGlowLayer(context, maskCanvas, width, height, sizeRatio, alpha, steps, blurRatio) {
  const offset = Math.max(1, Math.round(Math.min(width, height) * sizeRatio));
  const blur = Math.max(1, Math.round(Math.min(width, height) * blurRatio));
  context.filter = `blur(${blur}px)`;
  context.globalAlpha = alpha;

  for (let step = 0; step < steps; step += 1) {
    const angle = (Math.PI * 2 * step) / steps;
    context.drawImage(
      maskCanvas,
      Math.cos(angle) * offset,
      Math.sin(angle) * offset
    );
  }

  context.filter = "none";
}

function configureMarkerTexture(texture) {
  texture.generateMipmaps = false;
  texture.premultiplyAlpha = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.offset.set(0.025, 0.025);
  texture.repeat.set(0.95, 0.95);
}
