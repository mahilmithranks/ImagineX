/**
 * DELETE /api/gallery/[id]
 *
 * Removes a single generation from the store by ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { deleteGeneration, getGenerationById } from "@/lib/generationRepository";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = getGenerationById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    deleteGeneration(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[gallery/delete] Error:", err);
    return NextResponse.json(
      { error: "Failed to delete generation" },
      { status: 500 }
    );
  }
}
