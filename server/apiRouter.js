const fs = require("fs");
const path = require("path");
const { getDatabase } = require("./database");
const { createPlaceRepository } = require("./repositories/placeRepository");

const UPLOAD_DIR = path.join(process.cwd(), "images", "uploads");
const UPLOAD_ROUTE = "images/uploads";
const COLLISION_OVERRIDES_PATH = path.join(process.cwd(), "data", "collision-overrides.json");
const MAX_UPLOAD_BODY_BYTES = 30 * 1024 * 1024;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function handleApiRequest(req, res) {
  const url = new URL(req.url, "http://127.0.0.1");
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) return false;

  const places = createPlaceRepository(getDatabase());

  routeApiRequest(req, res, pathname, places).catch((error) => {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  });

  return true;
}

async function routeApiRequest(req, res, pathname, places) {
  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && pathname === "/api/places") {
    sendJson(res, 200, places.listPlaces());
    return;
  }

  if (req.method === "GET" && pathname === "/api/collision-overrides") {
    sendJson(res, 200, readCollisionOverrides());
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/verify") {
    if (!isAuthorizedAdminRequest(req)) {
      sendJson(res, ADMIN_TOKEN ? 401 : 503, { error: ADMIN_TOKEN ? "Unauthorized" : "Admin token is not configured" });
      return;
    }

    sendJson(res, 200, { ok: true });
    return;
  }

  if (isMutationRequest(req) && !isAuthorizedAdminRequest(req)) {
    sendJson(res, ADMIN_TOKEN ? 401 : 503, { error: ADMIN_TOKEN ? "Unauthorized" : "Admin token is not configured" });
    return;
  }

  if (req.method === "PUT" && pathname === "/api/collision-overrides") {
    const body = await readJsonBody(req);

    if (!isCollisionOverridesUpdate(body)) {
      sendJson(res, 400, { error: "Invalid collision data" });
      return;
    }

    const overrides = saveCollisionOverrides(body.colliders);
    sendJson(res, 200, overrides);
    return;
  }

  if (req.method === "POST" && pathname === "/api/uploads/image") {
    const body = await readJsonBody(req, MAX_UPLOAD_BODY_BYTES);
    const uploadedImage = saveUploadedImage(body);

    if (!uploadedImage) {
      sendJson(res, 400, { error: "Invalid image" });
      return;
    }

    sendJson(res, 201, uploadedImage);
    return;
  }

  if (req.method === "DELETE" && pathname === "/api/uploads/image") {
    const body = await readJsonBody(req);
    const imagePath = typeof body?.path === "string" ? body.path : "";

    if (!isUploadImagePath(imagePath)) {
      sendJson(res, 400, { error: "Invalid image path" });
      return;
    }

    if (places.countImageReferences(imagePath) > 0) {
      sendJson(res, 200, { ok: true, deleted: false, reason: "Image is still in use" });
      return;
    }

    sendJson(res, 200, { ok: true, deleted: deleteUploadImageFile(imagePath) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/places") {
    const body = await readJsonBody(req);

    if (!isPlaceUpdate(body)) {
      sendJson(res, 400, { error: "Invalid place data" });
      return;
    }

    const place = places.createPlace(normalizePlaceUpdate(body));
    sendJson(res, 201, place);
    return;
  }

  const placeMatch = pathname.match(/^\/api\/places\/(\d+)$/);
  if (req.method === "GET" && placeMatch) {
    const place = places.getPlace(Number(placeMatch[1]));
    sendJson(res, place ? 200 : 404, place || { error: "Place not found" });
    return;
  }

  if (req.method === "PUT" && placeMatch) {
    const placeId = Number(placeMatch[1]);
    const previousPlace = places.getPlace(placeId);
    const body = await readJsonBody(req);

    if (!isPlaceUpdate(body)) {
      sendJson(res, 400, { error: "Invalid place data" });
      return;
    }

    const place = places.updatePlace(placeId, normalizePlaceUpdate(body));
    if (place && previousPlace) {
      deleteUnusedUploadedImages(getRemovedImagePaths(previousPlace, place), places, placeId);
    }

    sendJson(res, place ? 200 : 404, place || { error: "Place not found" });
    return;
  }

  if (req.method === "DELETE" && placeMatch) {
    const placeId = Number(placeMatch[1]);
    const place = places.getPlace(placeId);
    const deleted = places.deletePlace(placeId);
    let deletedImages = 0;
    if (deleted && place) {
      deletedImages = deleteUnusedUploadedImages(getPlaceImagePaths(place), places, placeId);
    }

    sendJson(res, deleted ? 200 : 404, deleted ? { ok: true, deletedImages } : { error: "Place not found" });
    return;
  }

  const cameraViewMatch = pathname.match(/^\/api\/places\/(\d+)\/camera-view$/);
  if (req.method === "PUT" && cameraViewMatch) {
    const body = await readJsonBody(req);

    if (!isCameraView(body)) {
      sendJson(res, 400, { error: "Invalid camera view" });
      return;
    }

    const place = places.updateCameraView(Number(cameraViewMatch[1]), body);
    sendJson(res, place ? 200 : 404, place || { error: "Place not found" });
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function isMutationRequest(req) {
  return req.method === "POST" || req.method === "PUT" || req.method === "DELETE";
}

function isAuthorizedAdminRequest(req) {
  if (!ADMIN_TOKEN) return false;
  return req.headers["x-admin-token"] === ADMIN_TOKEN;
}

function readCollisionOverrides() {
  try {
    if (!fs.existsSync(COLLISION_OVERRIDES_PATH)) {
      return { version: 1, colliders: [] };
    }

    const data = JSON.parse(fs.readFileSync(COLLISION_OVERRIDES_PATH, "utf8"));
    return isCollisionOverridesUpdate(data)
      ? { version: 1, colliders: normalizeCollisionOverrides(data.colliders) }
      : { version: 1, colliders: [] };
  } catch (error) {
    console.warn("No se pudieron leer los ajustes de colision", error);
    return { version: 1, colliders: [] };
  }
}

function saveCollisionOverrides(colliders) {
  const payload = {
    version: 1,
    colliders: normalizeCollisionOverrides(colliders),
  };

  fs.mkdirSync(path.dirname(COLLISION_OVERRIDES_PATH), { recursive: true });
  fs.writeFileSync(COLLISION_OVERRIDES_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function readJsonBody(req, maxBodyBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBodyBytes) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function saveUploadedImage(upload) {
  const imageType = typeof upload?.type === "string" ? upload.type.toLowerCase() : "";
  const extension = ALLOWED_IMAGE_TYPES.get(imageType);
  const dataUrl = typeof upload?.dataUrl === "string" ? upload.dataUrl : "";
  const dataMatch = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!extension || !dataMatch || dataMatch[1].toLowerCase() !== imageType) {
    return null;
  }

  const imageBuffer = Buffer.from(dataMatch[2], "base64");
  if (!imageBuffer.length) return null;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const baseName = sanitizeFileBaseName(path.basename(upload.filename || "imagen", path.extname(upload.filename || "")));
  const filename = getUniqueUploadFilename(baseName || "imagen", extension);
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, imageBuffer);

  return {
    path: `${UPLOAD_ROUTE}/${filename}`,
    filename,
  };
}

function sanitizeFileBaseName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .toLowerCase();
}

function getUniqueUploadFilename(baseName, extension) {
  let suffix = 0;

  while (true) {
    const filename = suffix
      ? `${baseName}-${suffix}${extension}`
      : `${baseName}${extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return filename;
    suffix += 1;
  }
}

function getPlaceImagePaths(place) {
  return [
    place.imageUrl,
    ...(place.exteriorImages || []),
    ...(place.interiorImages || []),
  ].filter(Boolean);
}

function getRemovedImagePaths(previousPlace, nextPlace) {
  const nextImages = new Set(getPlaceImagePaths(nextPlace));
  return getPlaceImagePaths(previousPlace).filter((imagePath) => !nextImages.has(imagePath));
}

function deleteUnusedUploadedImages(imagePaths, places, deletedPlaceId) {
  return Array.from(new Set(imagePaths))
    .filter(isUploadImagePath)
    .reduce((deletedCount, imagePath) => {
      if (places.countImageReferences(imagePath, deletedPlaceId) > 0) return deletedCount;
      return deleteUploadImageFile(imagePath) ? deletedCount + 1 : deletedCount;
    }, 0);
}

function isUploadImagePath(imagePath) {
  return typeof imagePath === "string"
    && imagePath.replace(/\\/g, "/").startsWith(`${UPLOAD_ROUTE}/`);
}

function deleteUploadImageFile(imagePath) {
  const relativeUploadPath = imagePath.replace(/\\/g, "/").slice(UPLOAD_ROUTE.length + 1);
  const filePath = path.resolve(UPLOAD_DIR, relativeUploadPath);
  const uploadRoot = path.resolve(UPLOAD_DIR);

  if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) return;

  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`No se pudo borrar la imagen subida: ${imagePath}`, error);
    }
  }

  return false;
}

function isCameraView(view) {
  return Array.isArray(view?.position)
    && Array.isArray(view?.target)
    && view.position.length === 3
    && view.target.length === 3
    && view.position.every(Number.isFinite)
    && view.target.every(Number.isFinite);
}

function isCollisionOverridesUpdate(value) {
  return Array.isArray(value?.colliders)
    && value.colliders.every(isCollisionOverride);
}

function isCollisionOverride(collider) {
  return typeof collider?.path === "string"
    && collider.path.trim().length > 0
    && isVectorArray(collider.min)
    && isVectorArray(collider.max)
    && (collider.enabled === undefined || typeof collider.enabled === "boolean")
    && (collider.rotationY === undefined || Number.isFinite(collider.rotationY));
}

function normalizeCollisionOverrides(colliders) {
  return colliders.map((collider) => ({
    path: collider.path.trim(),
    min: collider.min.map(cleanNumber),
    max: collider.max.map(cleanNumber),
    enabled: collider.enabled !== false,
    rotationY: cleanNumber(collider.rotationY || 0),
  }));
}

function isVectorArray(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every(Number.isFinite);
}

function cleanNumber(value) {
  return Number(value.toFixed(6));
}

function isPlaceUpdate(place) {
  return typeof place?.title === "string"
    && place.title.trim().length > 0
    && typeof place?.text === "string"
    && Array.isArray(place?.position)
    && place.position.length === 3
    && place.position.every(Number.isFinite)
    && isStringArray(place.exteriorImages)
    && isStringArray(place.interiorImages)
    && (place.cameraView === null || place.cameraView === undefined || isCameraView(place.cameraView))
    && (typeof place.imageUrl === "string" || place.imageUrl === null || place.imageUrl === undefined);
}

function normalizePlaceUpdate(place) {
  return {
    title: place.title.trim(),
    text: place.text,
    imageUrl: cleanOptionalString(place.imageUrl),
    position: place.position,
    cameraView: place.cameraView || null,
    exteriorImages: cleanStringArray(place.exteriorImages),
    interiorImages: cleanStringArray(place.interiorImages),
  };
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function cleanOptionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanStringArray(value) {
  return value
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  handleApiRequest,
};
