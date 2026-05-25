const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiRequest } = require("./server/apiRouter");

const root = process.cwd();
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || "127.0.0.1";
const publicRoots = new Set(["images", "models", "scripts", "styles", "vendor"]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".hdr": "image/vnd.radiance",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
};

const noCacheExtensions = new Set([".html", ".js", ".css"]);

const server = http.createServer((req, res) => {
  if (handleApiRequest(req, res)) return;

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  const requestPath = parseRequestPath(req.url);
  if (!requestPath) {
    sendText(res, 400, "Bad request");
    return;
  }

  const filePath = resolveStaticPath(requestPath);
  if (!isPathInsideRoot(filePath) || !isPublicStaticPath(requestPath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
    };

    if (noCacheExtensions.has(ext)) {
      headers["Cache-Control"] = "no-store, max-age=0";
    }

    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath)
      .on("error", () => {
        if (!res.headersSent) {
          sendText(res, 500, "Read error");
        } else {
          res.destroy();
        }
      })
      .pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`Proyecto disponible en http://${host}:${port}`);
});

function parseRequestPath(url) {
  try {
    return decodeURIComponent(url.split("?")[0]);
  } catch (_error) {
    return null;
  }
}

function resolveStaticPath(requestPath) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  return path.resolve(root, relativePath);
}

function isPathInsideRoot(filePath) {
  const relativePath = path.relative(root, filePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function isPublicStaticPath(requestPath) {
  const normalizedPath = requestPath.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!normalizedPath || normalizedPath === "index.html") return true;

  const [firstSegment] = normalizedPath.split("/");
  return publicRoots.has(firstSegment);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(message);
}
