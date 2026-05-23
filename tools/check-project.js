const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const runAll = args.size === 0;
const shouldRunSyntax = runAll || args.has("--syntax");
const shouldRunAssets = runAll || args.has("--assets");

const assetExtensions = [
  "bin",
  "css",
  "gif",
  "glb",
  "gltf",
  "hdr",
  "html",
  "jpeg",
  "jpg",
  "js",
  "png",
  "svg",
  "webp",
].join("|");

main();

function main() {
  const failures = [];

  if (shouldRunSyntax) {
    runSection("syntax", checkSyntax, failures);
  }

  if (shouldRunAssets) {
    runSection("assets", checkAssets, failures);
  }

  if (!shouldRunSyntax && !shouldRunAssets) {
    failures.push(`Unknown option. Use --syntax, --assets, or no option.`);
  }

  if (failures.length) {
    console.error("\nCheck failed:");
    failures.forEach((failure) => console.error(failure));
    process.exit(1);
  }

  console.log("\nProject checks passed.");
}

function runSection(name, task, failures) {
  try {
    task();
    console.log(`[ok] ${name}`);
  } catch (error) {
    failures.push(`[${name}]\n${error.message}`);
  }
}

function checkSyntax() {
  const failures = [];
  const commonJsFiles = [
    path.join(root, "local-server.js"),
    ...listFiles(path.join(root, "server"), (filePath) => filePath.endsWith(".js")),
  ];
  const browserModuleFiles = listFiles(path.join(root, "scripts"), (filePath) => filePath.endsWith(".js"));

  commonJsFiles.forEach((filePath) => {
    checkNodeSyntax(filePath, [], failures);
  });

  browserModuleFiles.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    checkNodeSyntax(filePath, ["--input-type=module"], failures, source);
  });

  if (failures.length) {
    throw new Error(failures.join("\n\n"));
  }
}

function checkNodeSyntax(filePath, extraArgs, failures, source) {
  const args = ["--check", ...extraArgs];
  const options = {
    cwd: root,
    encoding: "utf8",
  };

  if (source === undefined) {
    args.push(filePath);
  } else {
    options.input = source;
  }

  const result = spawnSync(process.execPath, args, options);
  if (result.status === 0) return;

  failures.push(`${relative(filePath)}\n${(result.stderr || result.stdout).trim()}`);
}

function checkAssets() {
  const refs = [];

  collectHtmlAssetRefs(path.join(root, "index.html"), refs);
  collectCssAssetRefs(path.join(root, "styles", "style.css"), refs);
  collectQuotedRootRefs(path.join(root, "scripts", "modelModule.js"), refs);
  collectQuotedRootRefs(path.join(root, "scripts", "markerModule.js"), refs);
  collectQuotedRootRefs(path.join(root, "scripts", "markerEditorProjectionModule.js"), refs);

  listFiles(path.join(root, "server", "seeds"), (filePath) => filePath.endsWith(".js"))
    .forEach((filePath) => collectQuotedRootRefs(filePath, refs));

  collectCollisionOverrideRefs(path.join(root, "data", "collision-overrides.json"), refs);
  collectDatabaseImageRefs(path.join(root, "data", "muvi.sqlite"), refs);

  const missing = refs.filter((ref) => !fs.existsSync(ref.absolutePath));

  if (missing.length) {
    const lines = missing.map((ref) => `- ${ref.value} (${relative(ref.source)})`);
    throw new Error(`Missing assets:\n${lines.join("\n")}`);
  }
}

function collectHtmlAssetRefs(filePath, refs) {
  const source = fs.readFileSync(filePath, "utf8");
  const attrPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;

  while ((match = attrPattern.exec(source))) {
    addAssetRef(match[1], filePath, path.dirname(filePath), refs);
  }
}

function collectCssAssetRefs(filePath, refs) {
  const source = fs.readFileSync(filePath, "utf8");
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match;

  while ((match = urlPattern.exec(source))) {
    addAssetRef(match[1], filePath, path.dirname(filePath), refs);
  }
}

function collectQuotedRootRefs(filePath, refs) {
  const source = fs.readFileSync(filePath, "utf8");
  const quotedPattern = new RegExp(
    `["'\`]((?:images|models)/[^"'\`]+?\\.(?:${assetExtensions}))["'\`]`,
    "gi"
  );
  let match;

  while ((match = quotedPattern.exec(source))) {
    addAssetRef(match[1], filePath, root, refs);
  }
}

function collectCollisionOverrideRefs(filePath, refs) {
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(data.colliders)) return;

  data.colliders.forEach((collider) => {
    if (typeof collider.path === "string") {
      addAssetRef(collider.path, filePath, root, refs);
    }
  });
}

function collectDatabaseImageRefs(databasePath, refs) {
  if (!fs.existsSync(databasePath)) return;

  let Database;
  try {
    Database = require("better-sqlite3");
  } catch (_error) {
    return;
  }

  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const rows = [
      ...db.prepare("SELECT main_image_url AS image_url FROM places WHERE main_image_url IS NOT NULL").all(),
      ...db.prepare("SELECT image_url FROM place_images WHERE image_url IS NOT NULL").all(),
    ];

    rows.forEach((row) => addAssetRef(row.image_url, databasePath, root, refs));
  } finally {
    db.close();
  }
}

function addAssetRef(value, source, baseDir, refs) {
  if (typeof value !== "string") return;

  const cleanValue = value.trim().replace(/\\/g, "/").split(/[?#]/)[0];
  if (!cleanValue || /^(?:data:|https?:|mailto:|#)/i.test(cleanValue)) return;

  refs.push({
    value: cleanValue,
    source,
    absolutePath: path.resolve(baseDir, cleanValue),
  });
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath, predicate));
      return;
    }

    if (!predicate || predicate(entryPath)) {
      files.push(entryPath);
    }
  });

  return files;
}

function relative(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}
