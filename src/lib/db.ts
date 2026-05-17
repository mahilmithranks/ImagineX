/**
 * db.ts — Singleton SQLite connection using better-sqlite3.
 *
 * Why SQLite?
 *   - Zero-config, file-based persistence that survives Next.js restarts
 *   - Fast synchronous reads (better-sqlite3) keep route handlers clean
 *   - Trivially swappable for Postgres / PlanetScale in production by
 *     replacing this module while keeping the repository interface intact
 *
 * Note: better-sqlite3 is synchronous by design and safe for single-process
 * Node servers. For multi-worker deployments, swap to a proper DB.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "imaginex.db");

// Ensure the data directory exists before opening the database
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Module-level singleton — Next.js hot-reload can reinitialise modules, so
// we cache the instance on the global object in development.
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id           TEXT PRIMARY KEY,
      prompt       TEXT NOT NULL,
      settings     TEXT NOT NULL,   -- JSON blob
      image_url    TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'success',
      overlay_text TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_generations_created_at
      ON generations (created_at DESC);
  `);

  return db;
}

export function getDb(): Database.Database {
  if (process.env.NODE_ENV === "development") {
    if (!global.__db) {
      global.__db = createDb();
    }
    return global.__db;
  }
  return createDb();
}
