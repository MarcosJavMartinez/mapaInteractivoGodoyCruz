const PLACE_COLUMNS = `
  id,
  slug,
  title,
  description_html,
  main_image_url,
  category,
  block_label,
  street_address,
  historical_period,
  marker_x,
  marker_y,
  marker_z,
  camera_position_x,
  camera_position_y,
  camera_position_z,
  camera_target_x,
  camera_target_y,
  camera_target_z,
  sort_order,
  is_active
`;

function createPlaceRepository(db) {
  return {
    listPlaces,
    getPlace,
    updateCameraView,
  };

  function listPlaces() {
    const places = db.prepare(`
      SELECT ${PLACE_COLUMNS}
      FROM places
      WHERE is_active = 1
      ORDER BY sort_order, title
    `).all();

    return places.map((place) => hydratePlace(place, getImages(place.id)));
  }

  function getPlace(id) {
    const place = db.prepare(`
      SELECT ${PLACE_COLUMNS}
      FROM places
      WHERE id = ? AND is_active = 1
    `).get(id);

    return place ? hydratePlace(place, getImages(place.id)) : null;
  }

  function updateCameraView(id, cameraView) {
    const result = db.prepare(`
      UPDATE places
      SET
        camera_position_x = ?,
        camera_position_y = ?,
        camera_position_z = ?,
        camera_target_x = ?,
        camera_target_y = ?,
        camera_target_z = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      cameraView.position[0],
      cameraView.position[1],
      cameraView.position[2],
      cameraView.target[0],
      cameraView.target[1],
      cameraView.target[2],
      id
    );

    return result.changes > 0 ? getPlace(id) : null;
  }

  function getImages(placeId) {
    return db.prepare(`
      SELECT image_url, image_type, caption, source, sort_order
      FROM place_images
      WHERE place_id = ?
      ORDER BY image_type, sort_order, id
    `).all(placeId);
  }
}

function hydratePlace(place, images) {
  const groupedImages = images.reduce((groups, image) => {
    const imageData = {
      url: image.image_url,
      caption: image.caption,
      source: image.source,
      sortOrder: image.sort_order,
    };

    groups[image.image_type] ||= [];
    groups[image.image_type].push(imageData);
    return groups;
  }, {});

  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    text: place.description_html || "",
    imageUrl: place.main_image_url,
    category: place.category,
    blockLabel: place.block_label,
    streetAddress: place.street_address,
    historicalPeriod: place.historical_period,
    position: [place.marker_x, place.marker_y, place.marker_z],
    cameraView: buildCameraView(place),
    exteriorImages: (groupedImages.exterior || []).map((image) => image.url),
    interiorImages: (groupedImages.interior || []).map((image) => image.url),
    images: groupedImages,
    sortOrder: place.sort_order,
  };
}

function buildCameraView(place) {
  const position = [
    place.camera_position_x,
    place.camera_position_y,
    place.camera_position_z,
  ];
  const target = [
    place.camera_target_x,
    place.camera_target_y,
    place.camera_target_z,
  ];

  if (position.every(Number.isFinite) && target.every(Number.isFinite)) {
    return { position, target };
  }

  return null;
}

module.exports = {
  createPlaceRepository,
};
