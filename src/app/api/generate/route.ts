/**
 * POST /api/generate
 *
 * Accepts a prompt + optional settings, calls the HF API, persists the
 * generation to SQLite, and returns the full Generation object.
 *
 * Error handling strategy:
 *   - QuotaError  → 429, retryable: false
 *   - TimeoutError → 504, retryable: true
 *   - Validation   → 400, retryable: false
 *   - Unexpected   → 500, retryable: false
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { generateImage, QuotaError, TimeoutError } from "@/lib/huggingface";
import { insertGeneration } from "@/lib/generationRepository";
import { DEFAULT_SETTINGS, MAX_PROMPT_LENGTH } from "@/lib/constants";
import { enhancePrompt } from "@/lib/promptEnhancer";

import type { GenerateRequest, GenerateResponse, ApiError } from "@/types/generation";

export async function POST(req: NextRequest) {
  let body: GenerateRequest;

  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INTERNAL_ERROR", retryable: false } satisfies ApiError,
      { status: 400 }
    );
  }

  const { prompt, settings: partialSettings, overlayText } = body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Prompt is required", code: "INVALID_PROMPT", retryable: false } satisfies ApiError,
      { status: 400 }
    );
  }

  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      {
        error: `Prompt must be ≤ ${MAX_PROMPT_LENGTH} characters`,
        code: "INVALID_PROMPT",
        retryable: false,
      } satisfies ApiError,
      { status: 400 }
    );
  }

  // ── Merge settings ────────────────────────────────────────────────────────
  const settings = { ...DEFAULT_SETTINGS, ...partialSettings };

  // ── Enhance prompt with style preset and text overlay ───────────────────
  const finalPrompt = enhancePrompt(prompt.trim(), settings.stylePreset, overlayText?.trim());

  // ── Call AI service ───────────────────────────────────────────────────────
  try {
    const { imageUrl, isMocked } = await generateImage(finalPrompt, settings);

    const generation = {
      id: uuidv4(),
      prompt: prompt.trim(),
      settings,
      imageUrl,
      createdAt: new Date().toISOString(),
      status: "success" as const,
      overlayText: overlayText?.trim() || undefined,
    };

    // Persist asynchronously — don't block the response on a DB write failure
    try {
      insertGeneration(generation);
    } catch (dbErr) {
      console.error("[DB] Failed to persist generation:", dbErr);
      // Non-fatal: the user still gets their image
    }

    return NextResponse.json(
      { generation, isMocked } satisfies GenerateResponse,
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof QuotaError) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later.", code: "API_QUOTA", retryable: false } satisfies ApiError,
        { status: 429 }
      );
    }

    if (err instanceof TimeoutError) {
      return NextResponse.json(
        { error: "Generation timed out. The model may be loading — try again.", code: "API_TIMEOUT", retryable: true } satisfies ApiError,
        { status: 504 }
      );
    }

    console.error("[generate] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred.", code: "INTERNAL_ERROR", retryable: false } satisfies ApiError,
      { status: 500 }
    );
  }
}
