/**
 * huggingface.ts — HuggingFace Inference API client.
 *
 * Design decisions:
 *   - Single responsibility: this file ONLY knows how to call HF and return
 *     a buffer. All business logic lives in the route handler.
 *   - Timeout guard: HF cold-starts can take 30s+. We set an explicit timeout
 *     so the server never hangs indefinitely.
 *   - No external SDK: raw fetch keeps the bundle lean and avoids version churn.
 *   - Mocking: when HF_API_KEY is absent OR returns 503, we return a
 *     deterministic SVG placeholder so the app remains demonstrable without
 *     a live API key.
 */

import type { GenerationSettings } from "@/types/generation";

const HF_API_BASE = "https://router.huggingface.co/hf-inference/models";
const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";
const TIMEOUT_MS = 60_000; // 60 s — HF models can be slow to cold-start

export interface HFImageResult {
  imageUrl: string;
  isMocked: boolean;
}

/**
 * Calls the HuggingFace text-to-image API and returns a data-URI.
 * Falls back to a mocked SVG if the key is missing or the API is unavailable.
 */
export async function generateImage(
  prompt: string,
  settings: GenerationSettings
): Promise<HFImageResult> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey || apiKey === "hf_your_token_here") {
    return { imageUrl: buildMockDataUri(prompt), isMocked: true };
  }

  const model = process.env.HF_MODEL ?? settings.model ?? DEFAULT_MODEL;
  const url = `${HF_API_BASE}/${model}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: settings.negativePrompt ?? "",
          width: settings.width,
          height: settings.height,
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidanceScale,
        },
        options: {
          wait_for_model: true,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // HF returns 503 when the model is loading (usually transient)
    if (response.status === 503) {
      console.warn("[HF] Model loading (503) — returning mock");
      return { imageUrl: buildMockDataUri(prompt), isMocked: true };
    }

    if (response.status === 429) {
      throw new QuotaError("HuggingFace API quota exceeded");
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HF API error ${response.status}: ${body}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    return { imageUrl, isMocked: false };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof QuotaError) throw err;

    if ((err as Error).name === "AbortError") {
      throw new TimeoutError("HuggingFace API timed out after 60s");
    }

    throw err;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Custom error types — let route handlers distinguish failure modes
// ────────────────────────────────────────────────────────────────────────────

export class QuotaError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "QuotaError";
  }
}

export class TimeoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "TimeoutError";
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Mock generator — returns a deterministic gradient SVG as a data URI
// ────────────────────────────────────────────────────────────────────────────

function buildMockDataUri(prompt: string): string {
  // Derive a stable hue from the prompt so each mock looks distinct
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash * 31 + prompt.charCodeAt(i)) >>> 0;
  }
  const hue1 = hash % 360;
  const hue2 = (hue1 + 120) % 360;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="hsl(${hue1},70%,30%)"/>
      <stop offset="100%" stop-color="hsl(${hue2},70%,20%)"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#g)"/>
  <text
    x="512" y="480"
    font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.85)"
    text-anchor="middle" dominant-baseline="middle"
  >[Mock] ${escapeXml(prompt.slice(0, 80))}</text>
  <text
    x="512" y="530"
    font-family="sans-serif" font-size="14" fill="rgba(255,255,255,0.5)"
    text-anchor="middle"
  >Add HUGGINGFACE_API_KEY to .env.local for real images</text>
</svg>`.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
