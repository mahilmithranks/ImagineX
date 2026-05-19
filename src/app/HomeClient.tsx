/**
 * HomeClient.tsx — Client component that owns the generate flow on the home page.
 *
 * Responsibilities:
 *   - Read optional `tweak` param from URL and pre-fill form from sessionStorage
 *   - Wire PromptForm → useGenerate → GeneratedImagePanel
 *   - On success, optimistically add to gallery via prop callback
 *
 * Kept deliberately lean: no layout, no styling decisions — those live in page.tsx.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PromptForm } from "@/components/PromptForm";
import { GeneratedImagePanel } from "@/components/GeneratedImagePanel";
import { GalleryGrid } from "@/components/GalleryGrid";
import { useGenerate } from "@/hooks/useGenerate";
import { useGallery } from "@/hooks/useGallery";
import { downloadImage } from "@/lib/download";
import type { Generation, GenerationSettings } from "@/types/generation";

interface Props {}

export function HomeClient({}: Props) {
  const searchParams = useSearchParams();
  const tweakId = searchParams.get("tweak");

  const [initialPrompt, setInitialPrompt]     = useState("");
  const [initialSettings, setInitialSettings] = useState<Partial<GenerationSettings>>({});
  const [initialOverlay, setInitialOverlay]   = useState("");
  const [tweakReady, setTweakReady]           = useState(false);
  const [lastPrompt, setLastPrompt]           = useState("");

  const gallery = useGallery();

  // Load tweak data from sessionStorage when navigating from gallery.
  // We gate rendering PromptForm until data is loaded so its useState
  // initializers receive the correct values on first mount.
  useEffect(() => {
    if (!tweakId) {
      setTweakReady(true);
      return;
    }
    const raw = sessionStorage.getItem(`tweak:${tweakId}`);
    if (raw) {
      try {
        const g: Generation = JSON.parse(raw);
        setInitialPrompt(g.prompt);
        setInitialSettings(g.settings);
        if (g.overlayText) setInitialOverlay(g.overlayText);
      } catch {
        // malformed — ignore
      }
    }
    setTweakReady(true);
  }, [tweakId]);

  const { state, generate, reset } = useGenerate({
    onSuccess: (g) => {
      gallery.addGeneration(g);
    },
  });

  const handleSubmit = useCallback(
    (prompt: string, settings: Partial<GenerationSettings>, overlayText: string) => {
      setLastPrompt(prompt);
      generate(prompt, settings, overlayText);
    },
    [generate]
  );

  // Map hook state → panel props (discriminated union)
  const panelProps = (() => {
    if (state.status === "loading")
      return { status: "loading" as const };
    if (state.status === "success")
      return { status: "success" as const, generation: state.generation, isMocked: state.isMocked };
    if (state.status === "error")
      return {
        status: "error" as const,
        error: state.error,
        onRetry: () => {
          if (lastPrompt) generate(lastPrompt);
          else reset();
        },
      };
    return { status: "idle" as const };
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left — input */}
      <section aria-label="Generation form">
        {/* key forces a clean remount once tweak data is ready,
            so PromptForm's useState initializers see the correct values */}
        {tweakReady && (
          <PromptForm
            key={tweakId ?? "default"}
            isLoading={state.status === "loading"}
            initialPrompt={initialPrompt}
            initialSettings={initialSettings}
            initialOverlayText={initialOverlay}
            onSubmit={handleSubmit}
          />
        )}
      </section>

      {/* Right — result */}
      <section aria-label="Generated image">
        <GeneratedImagePanel {...panelProps} />

        {/* Download — always saves as .png (blob conversion handles SVG mocks too) */}
        {state.status === "success" && (
          <div className="mt-3 flex justify-end">
            <button
              id="download-btn"
              onClick={() =>
                downloadImage(
                  state.generation.imageUrl,
                  `imaginex-${state.generation.id}`
                )
              }
              className="text-xs text-muted hover:text-white transition-colors duration-150
                         flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PNG
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
