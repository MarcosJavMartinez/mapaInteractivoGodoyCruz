const { getDatabase } = require("./database");
const { createPlaceRepository } = require("./repositories/placeRepository");

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
    const body = await readJsonBody(req);

    if (!isPlaceUpdate(body)) {
      sendJson(res, 400, { error: "Invalid place data" });
      return;
    }

    const place = places.updatePlace(Number(placeMatch[1]), normalizePlaceUpdate(body));
    sendJson(res, place ? 200 : 404, place || { error: "Place not found" });
    return;
  }

  if (req.method === "DELETE" && placeMatch) {
    const deleted = places.deletePlace(Number(placeMatch[1]));
    sendJson(res, deleted ? 200 : 404, deleted ? { ok: true } : { error: "Place not found" });
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
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

function isCameraView(view) {
  return Array.isArray(view?.position)
    && Array.isArray(view?.target)
    && view.position.length === 3
    && view.target.length === 3
    && view.position.every(Number.isFinite)
    && view.target.every(Number.isFinite);
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
