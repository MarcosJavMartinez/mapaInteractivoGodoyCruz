const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { getDatabase } = require("../database");

const root = path.resolve(__dirname, "../..");
const markerModulePath = path.join(root, "scripts", "markerModule.js");
const source = fs.readFileSync(markerModulePath, "utf8");
const db = getDatabase();

const markers = extractMarkerCalls(source).map(parseMarkerCall);
const seenSlugs = new Map();

const seed = db.transaction(() => {
  const upsertPlace = db.prepare(`
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
  `);

  const deleteImages = db.prepare("DELETE FROM place_images WHERE place_id = ?");
  const insertImage = db.prepare(`
    INSERT INTO place_images (place_id, image_url, image_type, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  markers.forEach((marker, index) => {
    const slug = uniqueSlug(slugify(marker.title), seenSlugs);
    upsertPlace.run(
      slug,
      marker.title,
      marker.text,
      marker.imageUrl,
      marker.category,
      marker.blockLabel,
      null,
      "Hasta 1950",
      marker.position[0],
      marker.position[1],
      marker.position[2],
      marker.cameraView?.position?.[0] ?? null,
      marker.cameraView?.position?.[1] ?? null,
      marker.cameraView?.position?.[2] ?? null,
      marker.cameraView?.target?.[0] ?? null,
      marker.cameraView?.target?.[1] ?? null,
      marker.cameraView?.target?.[2] ?? null,
      index + 1
    );

    const place = db.prepare("SELECT id FROM places WHERE slug = ?").get(slug);
    deleteImages.run(place.id);
    insertImages(insertImage, place.id, marker.exteriorImages, "exterior");
    insertImages(insertImage, place.id, marker.interiorImages, "interior");
  });
});

seed();
console.log(`Seed listo: ${markers.length} marcadores migrados desde markerModule.js`);

function insertImages(statement, placeId, images, imageType) {
  images.forEach((imageUrl, index) => {
    statement.run(placeId, imageUrl, imageType, index + 1);
  });
}

function extractMarkerCalls(fileSource) {
  const functionStart = fileSource.indexOf("export function createMarkers");
  const signatureStart = fileSource.indexOf("(", functionStart);
  const signatureEnd = findMatching(fileSource, signatureStart, "(", ")");
  const bodyStart = fileSource.indexOf("{", signatureEnd);
  const bodyEnd = findMatching(fileSource, bodyStart, "{", "}");
  const body = fileSource.slice(bodyStart + 1, bodyEnd);
  const calls = [];
  let index = 0;

  while (index < body.length) {
    const callIndex = body.indexOf("createMarker", index);
    if (callIndex === -1) break;

    const parenStart = body.indexOf("(", callIndex);
    const parenEnd = findMatching(body, parenStart, "(", ")");
    calls.push(body.slice(parenStart + 1, parenEnd));
    index = parenEnd + 1;
  }

  return calls;
}

function parseMarkerCall(callSource) {
  const args = splitTopLevelArguments(callSource);
  const position = parseVector3(args[2]);
  const title = evaluateExpression(args[3]);
  const imageUrl = evaluateExpression(args[4]);
  const text = evaluateExpression(args[5]);
  const exteriorImages = evaluateExpression(args[6]) || [];
  const interiorImages = evaluateExpression(args[7]) || [];
  const cameraView = args[8] ? evaluateExpression(args[8]) : null;

  return {
    position,
    title,
    imageUrl,
    text,
    exteriorImages,
    interiorImages,
    cameraView,
    blockLabel: inferBlockLabel(exteriorImages, interiorImages, imageUrl),
    category: inferCategory(title),
  };
}

function parseVector3(expression) {
  const match = expression.match(/new\s+Vector3\s*\(([^)]+)\)/);
  if (!match) throw new Error(`No se pudo leer Vector3: ${expression}`);

  const values = match[1].split(",").map((value) => Number(value.trim()));
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) {
    throw new Error(`Vector3 invalido: ${expression}`);
  }

  return values;
}

function evaluateExpression(expression) {
  const normalized = expression.trim().replace(/;$/, "");
  return vm.runInNewContext(`(${normalized})`, {}, { timeout: 1000 });
}

function splitTopLevelArguments(sourceText) {
  const args = [];
  let start = 0;
  const state = createScannerState();

  for (let index = 0; index < sourceText.length; index += 1) {
    updateScannerState(sourceText, index, state);
    if (state.skipNext) {
      state.skipNext = false;
      continue;
    }

    if (!state.isCode()) continue;

    const char = sourceText[index];
    if (char === "(" || char === "[" || char === "{") state.depth += 1;
    if (char === ")" || char === "]" || char === "}") state.depth -= 1;

    if (char === "," && state.depth === 0) {
      args.push(sourceText.slice(start, index).trim());
      start = index + 1;
    }
  }

  args.push(sourceText.slice(start).trim());
  return args;
}

function findMatching(text, startIndex, openChar, closeChar) {
  const state = createScannerState();
  let depth = 0;

  for (let index = startIndex; index < text.length; index += 1) {
    updateScannerState(text, index, state);
    if (state.skipNext) {
      state.skipNext = false;
      continue;
    }

    if (!state.isCode()) continue;

    if (text[index] === openChar) depth += 1;
    if (text[index] === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error(`No se encontro cierre para ${openChar}`);
}

function createScannerState() {
  return {
    quote: null,
    blockComment: false,
    lineComment: false,
    depth: 0,
    skipNext: false,
    isCode() {
      return !this.quote && !this.blockComment && !this.lineComment;
    },
  };
}

function updateScannerState(text, index, state) {
  const char = text[index];
  const next = text[index + 1];

  if (state.lineComment) {
    if (char === "\n") state.lineComment = false;
    return;
  }

  if (state.blockComment) {
    if (char === "*" && next === "/") {
      state.blockComment = false;
      state.skipNext = true;
    }
    return;
  }

  if (state.quote) {
    if (char === "\\") {
      state.skipNext = true;
      return;
    }
    if (char === state.quote) state.quote = null;
    return;
  }

  if (char === "/" && next === "/") {
    state.lineComment = true;
    state.skipNext = true;
    return;
  }

  if (char === "/" && next === "*") {
    state.blockComment = true;
    state.skipNext = true;
    return;
  }

  if (char === "\"" || char === "'" || char === "`") {
    state.quote = char;
  }
}

function inferBlockLabel(...values) {
  const text = values.flat().filter(Boolean).join(" ");
  const match = text.match(/images\/(M-[^/]+)/);
  return match?.[1] || null;
}

function inferCategory(title) {
  const normalized = title.toLowerCase();
  if (normalized.includes("parroquia") || normalized.includes("iglesia")) return "religious";
  if (normalized.includes("bodega")) return "winery";
  if (normalized.includes("club")) return "club";
  if (normalized.includes("escuela") || normalized.includes("colegio")) return "education";
  if (normalized.includes("farmacia") || normalized.includes("ferreter")) return "commerce";
  return "heritage";
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "lugar";
}

function uniqueSlug(slug, seen) {
  const count = seen.get(slug) || 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count + 1}`;
}
