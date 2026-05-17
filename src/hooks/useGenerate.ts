/**
 * useGenerate.ts — Hook that owns the generate flow.
 *
 * Responsibilities:
 *   - Manage loading / error / result state
 *   - Call POST /api/generate
 *   - Expose a typed `generate` function and `reset`
 *
 * Does NOT: render anything, know about routing, or touch the gallery.
 * Callers can react to `generation` and update the gallery themselves.
 */

"use client";

import { useState, useCallback } from "react";
import type { Generation, GenerationSettings, ApiError } from "@/types/generation";

export type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; generation: Generation; isMocked: boolean }
  | { status: "error"; error: ApiError };

interface UseGenerateOptions {
  onSuccess?: (generation: Generation) => void;
}

export function useGenerate({ onSuccess }: UseGenerateOptions = {}) {
  const [state, setState] = useState<GenerateState>({ status: "idle" });

  const generate = useCallback(
    async (
      prompt: string,
      settings?: Partial<GenerationSettings>,
      overlayText?: string
    ) => {
      setState({ status: "loading" });

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, settings, overlayText }),
        });

        const data = await res.json();

        if (!res.ok) {
          setState({ status: "error", error: data as ApiError });
          return;
        }

        const { generation, isMocked } = data;
        setState({ status: "success", generation, isMocked });
        onSuccess?.(generation);
      } catch {
        setState({
          status: "error",
          error: {
            error: "Network error. Check your connection and try again.",
            code: "INTERNAL_ERROR",
            retryable: true,
          },
        });
      }
    },
    [onSuccess]
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, generate, reset };
}
