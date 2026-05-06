const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.env.PORT || 8000);

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
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.join(root, requestPath === "/" ? "index.html" : requestPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Proyecto disponible en http://127.0.0.1:${port}`);
});
