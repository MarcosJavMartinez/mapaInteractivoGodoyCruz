const { getDatabase } = require("../database");

const db = getDatabase();

const place = {
  slug: "parroquia-san-vicente-ferrer",
  title: "Parroquia San Vicente Ferrer",
  descriptionHtml: `
    <p>De todos los templos religiosos que tiene Godoy Cruz, sin duda, uno de los mas representativos es la parroquia San Vicente Ferrer, ubicada, en la actualidad, en calle Lavalle al 60.</p>

    <p>En el ano 1753, Don Tomas de Coria establecio en sus terrenos un oratorio erigido en honor a San Vicente Ferrer, religioso espanol miembro de la orden dominicana. Este sitio venia a satisfacer las necesidades religiosas de los habitantes de la region, quienes concurrian alli a celebrar bautismos, casamientos, novenas, etc. En 1804 se elevo al rango de parroquia alrededor de la cual se establecio un poblado llamado Villa de San Vicente.</p>

    <p>Esta parroquia estuvo situada en el terreno frente al angulo noreste de la plaza actual de Godoy Cruz, entre las calles Antonio Tomba, Rivadavia y Balcarce, hasta el actual Espacio Verde Luis Menotti Pescarmona. Sin embargo, el terremoto acaecido el 20 de marzo de 1861 en toda la zona de Cuyo destruyo parcialmente el templo, lo que condiciono su traslado.</p>

    <p>A raiz de esta perdida, los vecinos e integrantes de la comision pro-templo, como Balbino Arizu (1858-1936), decidieron edificar una nueva iglesia en la cuadra sur, frente a la plaza departamental. Los esfuerzos dieron sus frutos y en 1906 se comenzo a erigir. La inauguracion se produjo en 1912 y fue consagrada por el obispo Jose Americo Orzali.</p>

    <p>Desde el ano 2023, gracias a las gestiones del parroco Horacio Day, el Vaticano la declaro como Basilica, ya que cuenta con los requisitos historicos, arquitectonicos y pastorales.</p>

    <p><strong>Texto:</strong> Andrea Segura / Gutierrez Camila, equipo MUVI GC.</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imagenes</strong></p>
    <ul>
      <li>Img 1: Archivo Fotografico Equipo MUVI GC.</li>
      <li>Img 2: Archivo Fotografico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>
      <li>Img 3, 4 y 5: Archivo Fotografico Instituto San Vicente Ferrer.</li>
    </ul>
    <p><strong>Bibliografia:</strong></p>
    <ul>
      <li>Braverman A. Girini, L. (2007). San Vicente Ferrer. Patrimonio Arquitectonico y Urbano de Godoy Cruz.</li>
      <li>Mastrangelo, F. (2016). Godoy Cruz, una historia. Municipalidad de Godoy Cruz.</li>
      <li>Arguello, E. (4 de diciembre de 2023). La parroquia San Vicente Ferrer fue nombrada basilica por el Vaticano. MendozaPost.</li>
    </ul>
  `,
  mainImageUrl: "images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.1.MUVI GC_DCeIC_MGC.jpg",
  marker: [-60.7, 12, 84.93],
  cameraPosition: [-60.7, 14, 126.93],
  cameraTarget: [-60.7, 18, 84.93],
};

const images = [
  ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.1.MUVI GC_DCeIC_MGC.jpg", "exterior", 1],
  ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.2.Archivo B+M Manuel Belgrano.jpg", "exterior", 2],
  ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.3.Archivo Instituto San Vicente Ferrer.jpg", "interior", 1],
  ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.4.Archivo Instituto San Vicente Ferrer.jpg", "interior", 2],
  ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.5.Archivo Instituto San Vicente Ferrer.jpg", "interior", 3],
];

const seed = db.transaction(() => {
  db.prepare(`
    INSERT INTO places (
      slug, title, description_html, main_image_url, category, block_label,
      street_address, historical_period, marker_x, marker_y, marker_z,
      camera_position_x, camera_position_y, camera_position_z,
      camera_target_x, camera_target_y, camera_target_z, sort_order, is_active, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      description_html = excluded.description_html,
      main_image_url = excluded.main_image_url,
      category = excluded.category,
      block_label = excluded.block_label,
      street_address = excluded.street_address,
      historical_period = excluded.historical_period,
      marker_x = excluded.marker_x,
      marker_y = excluded.marker_y,
      marker_z = excluded.marker_z,
      camera_position_x = excluded.camera_position_x,
      camera_position_y = excluded.camera_position_y,
      camera_position_z = excluded.camera_position_z,
      camera_target_x = excluded.camera_target_x,
      camera_target_y = excluded.camera_target_y,
      camera_target_z = excluded.camera_target_z,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    place.slug,
    place.title,
    place.descriptionHtml,
    place.mainImageUrl,
    "religious",
    "M-25",
    "Lavalle 60",
    "Hasta 1950",
    place.marker[0],
    place.marker[1],
    place.marker[2],
    place.cameraPosition[0],
    place.cameraPosition[1],
    place.cameraPosition[2],
    place.cameraTarget[0],
    place.cameraTarget[1],
    place.cameraTarget[2],
    2502
  );

  const savedPlace = db.prepare("SELECT id FROM places WHERE slug = ?").get(place.slug);
  db.prepare("DELETE FROM place_images WHERE place_id = ?").run(savedPlace.id);

  const insertImage = db.prepare(`
    INSERT INTO place_images (place_id, image_url, image_type, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  images.forEach(([imageUrl, imageType, sortOrder]) => {
    insertImage.run(savedPlace.id, imageUrl, imageType, sortOrder);
  });

  return savedPlace.id;
});

const placeId = seed();
console.log(`Seed listo: ${place.title} (#${placeId})`);
