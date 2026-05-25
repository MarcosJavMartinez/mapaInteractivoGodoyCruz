import {
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

let markerTexture = null;
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
    map: getMarkerTexture(),
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    alphaTest: 0.08,
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
  outline.scale.setScalar(1.16);
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

  markerTexture = new TextureLoader().load("images/marcador-de-alfiler-01.png");
  markerTexture.generateMipmaps = false;
  markerTexture.premultiplyAlpha = true;
  markerTexture.minFilter = LinearFilter;
  markerTexture.magFilter = LinearFilter;
  markerTexture.wrapS = ClampToEdgeWrapping;
  markerTexture.wrapT = ClampToEdgeWrapping;
  markerTexture.offset.set(0.025, 0.025);
  markerTexture.repeat.set(0.95, 0.95);
  return markerTexture;
}
