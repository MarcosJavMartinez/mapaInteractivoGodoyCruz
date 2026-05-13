import {
  ClampToEdgeWrapping,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
} from "../vendor/three/build/three.module.js";

let markerTexture = null;

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
    alphaTest: 0.08,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 999;
  sprite.frustumCulled = false;
  sprite.position.copy(place.position);
  sprite.scale.set(2, 2, 2);
  sprite.userData.markerScreenScale = 0.032;
  sprite.userData.markerMinScale = 1.1;
  sprite.userData.markerMaxScale = 11;
  sprite.userData.isHovered = false;
  sprite.userData.title = place.title;
  sprite.userData.imageUrl = place.imageUrl;
  sprite.userData.text = place.text;
  sprite.userData.exteriorImages = place.exteriorImages;
  sprite.userData.interiorImages = place.interiorImages;
  sprite.userData.cameraView = place.cameraView;
  sprite.userData.placeId = place.placeId;
  sprite.userData.slug = place.slug;
  scene.add(sprite);
  buttons.push(sprite);
  return sprite;
}

function getMarkerTexture() {
  if (markerTexture) return markerTexture;

  markerTexture = new TextureLoader().load("images/marcador-de-alfiler-01.png");
  markerTexture.generateMipmaps = false;
  markerTexture.minFilter = LinearFilter;
  markerTexture.magFilter = LinearFilter;
  markerTexture.wrapS = ClampToEdgeWrapping;
  markerTexture.wrapT = ClampToEdgeWrapping;
  markerTexture.offset.set(0.025, 0.025);
  markerTexture.repeat.set(0.95, 0.95);
  return markerTexture;
}
