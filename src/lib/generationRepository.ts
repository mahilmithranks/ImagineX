/**
 * generationRepository.ts — Data access layer for Generation records.
 *
 * All DB interactions are isolated here. The API routes never touch the DB
 * directly — they go through this module. This makes it trivial to swap
 * SQLite for any other storage without touching route logic.
 */

import { getDb } from "@/lib/db";
import type { Generation, GenerationSettings } from "@/types/generation";

interface DbRow {
  id: string;
  prompt: string;
  settings: string;
  image_url: string;
  created_at: string;
  status: string;
  overlay_text: string | null;
}

function rowToGeneration(row: DbRow): Generation {
  return {
    id: row.id,
    prompt: row.prompt,
    settings: JSON.parse(row.settings) as GenerationSettings,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    status: row.status as Generation["status"],
    overlayText: row.overlay_text ?? undefined,
  };
}

export function insertGeneration(generation: Generation): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO generations (id, prompt, settings, image_url, created_at, status, overlay_text)
    VALUES (@id, @prompt, @settings, @imageUrl, @createdAt, @status, @overlayText)
  `);

  stmt.run({
    id: generation.id,
    prompt: generation.prompt,
    settings: JSON.stringify(generation.settings),
    imageUrl: generation.imageUrl,
    createdAt: generation.createdAt,
    status: generation.status,
    overlayText: generation.overlayText ?? null,
  });
}

export function getAllGenerations(limit = 50, offset = 0): Generation[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM generations ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as DbRow[];

  return rows.map(rowToGeneration);
}

export function getGenerationById(id: string): Generation | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM generations WHERE id = ?`)
    .get(id) as DbRow | undefined;

  return row ? rowToGeneration(row) : null;
}

export function countGenerations(): number {
  const db = getDb();
  const result = db
    .prepare(`SELECT COUNT(*) as count FROM generations`)
    .get() as { count: number };
  return result.count;
}

export function deleteGeneration(id: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM generations WHERE id = ?`).run(id);
}
