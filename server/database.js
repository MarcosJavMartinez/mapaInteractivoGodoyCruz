const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const bundledDatabasePath = path.join(dataDir, "muvi.sqlite");
const databasePath = process.env.VERCEL
  ? path.join("/tmp", "muvi.sqlite")
  : bundledDatabasePath;

let database;

function getDatabase() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    prepareRuntimeDatabase();
    database = new Database(databasePath);
    database.pragma("journal_mode = WAL");
    database.pragma("foreign_keys = ON");
    migrate(database);
  }

  return database;
}

function prepareRuntimeDatabase() {
  if (!process.env.VERCEL || fs.existsSync(databasePath)) return;
  if (fs.existsSync(bundledDatabasePath)) {
    fs.copyFileSync(bundledDatabasePath, databasePath);
  }
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  applyMigration(db, 1, "create_core_content_tables", `
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description_html TEXT,
      main_image_url TEXT,
      category TEXT,
      block_label TEXT,
      street_address TEXT,
      historical_period TEXT,
      marker_x REAL NOT NULL,
      marker_y REAL NOT NULL,
      marker_z REAL NOT NULL,
      camera_position_x REAL,
      camera_position_y REAL,
      camera_position_z REAL,
      camera_target_x REAL,
      camera_target_y REAL,
      camera_target_z REAL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS place_images (
      id INTEGER PRIMARY KEY,
      place_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      image_type TEXT NOT NULL CHECK (image_type IN ('exterior', 'interior', 'archive', 'current')),
      caption TEXT,
      source TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS place_sources (
      id INTEGER PRIMARY KEY,
      place_id INTEGER NOT NULL,
      source_type TEXT,
      citation TEXT NOT NULL,
      url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS place_models (
      id INTEGER PRIMARY KEY,
      place_id INTEGER NOT NULL,
      model_url TEXT NOT NULL,
      lod_level INTEGER NOT NULL DEFAULT 0,
      position_x REAL NOT NULL DEFAULT 0,
      position_y REAL NOT NULL DEFAULT 0,
      position_z REAL NOT NULL DEFAULT 0,
      rotation_x REAL NOT NULL DEFAULT 0,
      rotation_y REAL NOT NULL DEFAULT 0,
      rotation_z REAL NOT NULL DEFAULT 0,
      scale_x REAL NOT NULL DEFAULT 1,
      scale_y REAL NOT NULL DEFAULT 1,
      scale_z REAL NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_places_active_sort ON places(is_active, sort_order, title);
    CREATE INDEX IF NOT EXISTS idx_places_block ON places(block_label);
    CREATE INDEX IF NOT EXISTS idx_place_images_place ON place_images(place_id, image_type, sort_order);
    CREATE INDEX IF NOT EXISTS idx_place_sources_place ON place_sources(place_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_place_models_place ON place_models(place_id, lod_level);
  `);
}

function applyMigration(db, id, name, sql) {
  const exists = db
    .prepare("SELECT 1 FROM schema_migrations WHERE id = ?")
    .get(id);

  if (exists) return;

  const transaction = db.transaction(() => {
    db.exec(sql);
    db
      .prepare("INSERT INTO schema_migrations (id, name) VALUES (?, ?)")
      .run(id, name);
  });

  transaction();
}

module.exports = {
  getDatabase,
  databasePath,
};
