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
    createPlace,
    updatePlace,
    deletePlace,
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

  function createPlace(place) {
    const transaction = db.transaction(() => {
      const slug = uniqueSlug(slugify(place.title));
      const sortOrder = db
        .prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextSortOrder FROM places")
        .get().nextSortOrder;

      const result = db.prepare(`
        INSERT INTO places (
          slug, title, description_html, main_image_url, category, historical_period,
          marker_x, marker_y, marker_z,
          camera_position_x, camera_position_y, camera_position_z,
          camera_target_x, camera_target_y, camera_target_z,
          sort_order, is_active, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `).run(
        slug,
        place.title,
        place.text || "",
        place.imageUrl || null,
        "heritage",
        "Hasta 1950",
        place.position[0],
        place.position[1],
        place.position[2],
        place.cameraView?.position?.[0] ?? null,
        place.cameraView?.position?.[1] ?? null,
        place.cameraView?.position?.[2] ?? null,
        place.cameraView?.target?.[0] ?? null,
        place.cameraView?.target?.[1] ?? null,
        place.cameraView?.target?.[2] ?? null,
        sortOrder
      );

      insertImages(result.lastInsertRowid, place.exteriorImages || [], "exterior");
      insertImages(result.lastInsertRowid, place.interiorImages || [], "interior");
      return getPlace(result.lastInsertRowid);
    });

    return transaction();
  }

  function updatePlace(id, place) {
    const transaction = db.transaction(() => {
      const result = db.prepare(`
        UPDATE places
        SET
          title = ?,
          description_html = ?,
          main_image_url = ?,
          marker_x = ?,
          marker_y = ?,
          marker_z = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_active = 1
      `).run(
        place.title,
        place.text || "",
        place.imageUrl || null,
        place.position[0],
        place.position[1],
        place.position[2],
        id
      );

      if (result.changes === 0) return null;

      db.prepare("DELETE FROM place_images WHERE place_id = ?").run(id);
      insertImages(id, place.exteriorImages || [], "exterior");
      insertImages(id, place.interiorImages || [], "interior");
      return getPlace(id);
    });

    return transaction();
  }

  function deletePlace(id) {
    const result = db
      .prepare("DELETE FROM places WHERE id = ? AND is_active = 1")
      .run(id);

    return result.changes > 0;
  }

  function getImages(placeId) {
    return db.prepare(`
      SELECT image_url, image_type, caption, source, sort_order
      FROM place_images
      WHERE place_id = ?
      ORDER BY image_type, sort_order, id
    `).all(placeId);
  }

  function insertImages(placeId, images, imageType) {
    const insertImage = db.prepare(`
      INSERT INTO place_images (place_id, image_url, image_type, sort_order, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    images
      .filter(Boolean)
      .forEach((imageUrl, index) => {
        insertImage.run(placeId, imageUrl, imageType, index + 1);
      });
  }

  function uniqueSlug(baseSlug) {
    let slug = baseSlug;
    let suffix = 2;

    while (db.prepare("SELECT 1 FROM places WHERE slug = ?").get(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "marker";
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
