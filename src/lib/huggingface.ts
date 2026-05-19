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
    return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height), isMocked: true };
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
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height), isMocked: true };
    }

    if (response.status === 429 || response.status === 402) {
      console.warn("[HF] Quota or credits exceeded — returning mock");
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height), isMocked: true };
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
// Fallback generator — returns a real AI image from Pollinations.ai (Free/No-Auth)
// ────────────────────────────────────────────────────────────────────────────

function buildMockDataUri(prompt: string, width: number = 1024, height: number = 1024): string {
  // Add a random seed so identical prompts give different results
  const seed = Math.floor(Math.random() * 1000000);
  const safePrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${safePrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}
