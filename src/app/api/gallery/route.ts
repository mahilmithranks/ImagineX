/**
 * GET /api/gallery
 *
 * Returns a paginated list of past generations from SQLite.
 * Query params:
 *   - limit  (default 12, max 50)
 *   - offset (default 0)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllGenerations, countGenerations } from "@/lib/generationRepository";
import type { GalleryResponse } from "@/types/generation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "12", 10), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0",  10), 0);

  try {
    const generations = getAllGenerations(limit, offset);
    const total       = countGenerations();

    return NextResponse.json<GalleryResponse>({ generations, total });
  } catch (err) {
    console.error("[gallery] DB read error:", err);
    return NextResponse.json(
      { error: "Failed to load gallery", code: "INTERNAL_ERROR", retryable: false },
      { status: 500 }
    );
  }
}
