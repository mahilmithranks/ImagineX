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
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height, settings.negativePrompt), isMocked: true };
    }

    // 402 = Payment Required (free-tier credits exhausted)
    // 429 = Too Many Requests (rate limit / monthly quota hit)
    if (response.status === 402 || response.status === 429) {
      const body = await response.text().catch(() => "");
      console.warn(`[HF] Quota/credits exhausted (${response.status}): ${body}`);
      throw new QuotaError(
        response.status === 402
          ? "HuggingFace free-tier credits exhausted. Add billing at huggingface.co/settings/billing."
          : "HuggingFace API rate limit reached. Please wait a few minutes and try again."
      );
    }

    if (!response.ok) {
      console.warn(`[HF] API failed with status ${response.status} — falling back to Pollinations.ai`);
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height, settings.negativePrompt), isMocked: true };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    return { imageUrl, isMocked: false };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof QuotaError) throw err;

    if ((err as Error).name === "AbortError") {
      // Our own AbortController fired (60s timeout) — use fallback
      console.warn("[HF] Request aborted (60s timeout) — falling back to Pollinations.ai");
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height, settings.negativePrompt), isMocked: true };
    }

    // Catch undici ConnectTimeoutError, network errors, DNS failures, etc.
    // These all have codes like UND_ERR_CONNECT_TIMEOUT or simply fail to connect.
    // Fall back gracefully instead of surfacing a 500 to the client.
    const code = (err as NodeJS.ErrnoException).code ?? "";
    const name = (err as Error).name ?? "";
    if (
      code.startsWith("UND_ERR") ||
      code === "ECONNREFUSED" ||
      code === "ENOTFOUND" ||
      code === "ETIMEDOUT" ||
      name === "ConnectTimeoutError" ||
      name === "FetchError"
    ) {
      console.warn(`[HF] Network error (${code || name}) — falling back to Pollinations.ai`);
      return { imageUrl: buildMockDataUri(prompt, settings.width, settings.height, settings.negativePrompt), isMocked: true };
    }

    // Unknown error — re-throw so the route handler can log it
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

function buildMockDataUri(
  prompt: string,
  width: number = 1024,
  height: number = 1024,
  negativePrompt?: string
): string {
  // Add a random seed so identical prompts give different results
  const seed = Math.floor(Math.random() * 1000000);
  const safePrompt = encodeURIComponent(prompt);
  let url = `https://image.pollinations.ai/prompt/${safePrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  if (negativePrompt?.trim()) {
    url += `&negative=${encodeURIComponent(negativePrompt.trim())}`;
  }
  return url;
}
