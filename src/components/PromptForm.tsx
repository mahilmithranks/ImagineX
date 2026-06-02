/**
 * PromptForm.tsx — Primary input surface.
 * Purely presentational — all business logic lives in useGenerate hook.
 */

"use client";

import { useState, FormEvent } from "react";
import {
  MAX_PROMPT_LENGTH,
  AVAILABLE_MODELS,
  ASPECT_RATIO_PRESETS,
  STYLE_PRESETS,
} from "@/lib/constants";
import type { GenerationSettings, StylePresetId } from "@/types/generation";
import clsx from "clsx";

interface Props {
  isLoading: boolean;
  initialPrompt?: string;
  initialSettings?: Partial<GenerationSettings>;
  initialOverlayText?: string;
  onSubmit: (
    prompt: string,
    settings: Partial<GenerationSettings>,
    overlayText: string
  ) => void;
}

export function PromptForm({
  isLoading,
  initialPrompt = "",
  initialSettings,
  initialOverlayText = "",
  onSubmit,
}: Props) {
  const [prompt, setPrompt]             = useState(initialPrompt);
  const [overlayText, setOverlayText]   = useState(initialOverlayText);
  // Auto-open Advanced Settings when tweaking so users can see/confirm
  // pre-filled style, steps, guidance, and negative prompt.
  const hasMeaningfulSettings = !!(
    initialSettings?.stylePreset && initialSettings.stylePreset !== "none"
    || initialSettings?.steps && initialSettings.steps !== 4
    || initialSettings?.guidanceScale && initialSettings.guidanceScale !== 0
    || initialSettings?.negativePrompt
  );
  const [showSettings, setShowSettings] = useState(hasMeaningfulSettings);

  // Safely default the model in case the tweaked generation used a deprecated model
  const validModel = AVAILABLE_MODELS.find(m => m.id === initialSettings?.model)
    ? initialSettings!.model
    : AVAILABLE_MODELS[0].id;
  const [model, setModel] = useState(validModel);

  // Safely find the aspect ratio index
  const initialRatioIndex = ASPECT_RATIO_PRESETS.findIndex(
    p => p.width === initialSettings?.width && p.height === initialSettings?.height
  );
  const [aspectRatio, setAspectRatio] = useState(initialRatioIndex >= 0 ? initialRatioIndex : 0);

  const [steps, setSteps]             = useState(initialSettings?.steps ?? 4);
  const [guidance, setGuidance]       = useState(initialSettings?.guidanceScale ?? 0);
  const [negPrompt, setNegPrompt]     = useState(initialSettings?.negativePrompt ?? "");
  const [stylePreset, setStylePreset] = useState<StylePresetId>(
    initialSettings?.stylePreset ?? "none"
  );

  const charCount  = prompt.length;
  const overLimit  = charCount > MAX_PROMPT_LENGTH;
  const isDisabled = !prompt.trim() || overLimit || isLoading;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isDisabled) return;
    const preset = ASPECT_RATIO_PRESETS[aspectRatio];
    onSubmit(
      prompt.trim(),
      {
        model,
        width:          preset.width,
        height:         preset.height,
        steps,
        guidanceScale:  guidance,
        negativePrompt: negPrompt || undefined,
        stylePreset,
      },
      overlayText.trim()
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* ── Prompt ────────────────────────────────────────────────────── */}
      <div className="relative">
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate…"
          rows={5}
          disabled={isLoading}
          aria-describedby="char-count"
          className={clsx(
            "w-full resize-none rounded-2xl px-4 py-3.5 text-[14px] leading-relaxed",
            "input-base text-white placeholder:text-surface-200",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-all duration-150",
            overLimit && "!border-red-500/60 !ring-red-500/20"
          )}
        />
        <span
          id="char-count"
          aria-live="polite"
          className={clsx(
            "absolute bottom-3.5 right-4 text-[11px] tabular-nums font-medium select-none",
            overLimit ? "text-red-400" : "text-surface-200"
          )}
        >
          {charCount}/{MAX_PROMPT_LENGTH}
        </span>
      </div>

      {/* ── Text overlay ──────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="overlay-input"
          className="block text-[11px] font-semibold tracking-widest text-surface-100 uppercase mb-2"
        >
          Text overlay{" "}
          <span className="normal-case font-normal tracking-normal text-surface-200">— optional</span>
        </label>
        <input
          id="overlay-input"
          type="text"
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          placeholder={`e.g. "Into the unknown"`}
          maxLength={80}
          disabled={isLoading}
          className="w-full rounded-xl input-base px-4 py-2.5 text-[13px]
                     text-white placeholder:text-surface-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── Advanced settings toggle ───────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-expanded={showSettings}
          aria-controls="advanced-settings"
          className="flex items-center gap-2 text-[12px] font-medium text-surface-100
                     hover:text-white transition-colors duration-150
                     focus:outline-none focus:ring-2 focus:ring-brand-500/30 rounded px-1 py-0.5"
        >
          <svg
            className={clsx(
              "w-3 h-3 transition-transform duration-200",
              showSettings && "rotate-90"
            )}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Advanced settings
        </button>

        {showSettings && (
          <div
            id="advanced-settings"
            className="mt-3 rounded-2xl p-4 flex flex-col gap-5 animate-fade-in card-border"
            style={{ background: "rgba(15, 15, 30, 0.6)" }}
          >

            {/* Style presets */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-surface-100 uppercase mb-3">
                Style preset
              </p>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setStylePreset(preset.id)}
                    aria-pressed={stylePreset === preset.id}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium",
                      "border transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500/30",
                      stylePreset === preset.id
                        ? "border-brand-500/50 bg-brand-500/12 text-brand-300"
                        : "border-white/[0.08] text-surface-100 hover:border-white/[0.14] hover:text-white"
                    )}
                  >
                    <span aria-hidden="true">{preset.emoji}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model picker */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-surface-100 uppercase mb-3">Model</p>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    aria-pressed={model === m.id}
                    className={clsx(
                      "rounded-xl border px-3 py-2.5 text-left",
                      "transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500/30",
                      model === m.id
                        ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                        : "border-white/[0.08] text-surface-100 hover:border-white/[0.14] hover:text-white"
                    )}
                  >
                    <div className="font-semibold text-[12px] text-inherit mb-0.5">{m.label}</div>
                    <div className="text-[10px] text-surface-200">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-surface-100 uppercase mb-3">Aspect ratio</p>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIO_PRESETS.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAspectRatio(i)}
                    aria-pressed={aspectRatio === i}
                    className={clsx(
                      "rounded-xl border px-2 py-2 text-[11px] text-center font-medium",
                      "transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500/30",
                      aspectRatio === i
                        ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                        : "border-white/[0.08] text-surface-100 hover:border-white/[0.14] hover:text-white"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-5">
              <SliderField
                id="steps-slider"
                label={`Steps: ${steps}`}
                min={1} max={50} value={steps}
                onChange={setSteps}
              />
              <SliderField
                id="guidance-slider"
                label={`Guidance: ${guidance.toFixed(1)}`}
                min={0} max={20} step={0.5} value={guidance}
                onChange={setGuidance}
              />
            </div>

            {/* Negative prompt */}
            <div>
              <label
                htmlFor="neg-prompt"
                className="block text-[11px] font-semibold tracking-widest text-surface-100 uppercase mb-2"
              >
                Negative prompt
              </label>
              <textarea
                id="neg-prompt"
                value={negPrompt}
                onChange={(e) => setNegPrompt(e.target.value)}
                rows={2}
                placeholder="Things to exclude from the output…"
                className="w-full resize-none rounded-xl input-base px-3 py-2.5 text-[12px]
                           text-white placeholder:text-surface-200 transition-all duration-150"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Generate button ────────────────────────────────────────────── */}
      <button
        type="submit"
        id="generate-btn"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={isLoading ? "Generating image…" : "Generate image"}
        className={clsx(
          "relative flex items-center justify-center gap-2.5",
          "rounded-2xl px-6 py-3.5 text-[14px] font-semibold",
          "transition-all duration-150 select-none",
          isLoading
            ? "cursor-not-allowed opacity-80"
            : isDisabled
            ? "cursor-not-allowed border border-white/[0.07] bg-surface-700 text-surface-200"
            : "active:scale-[0.98] text-white"
        )}
        style={
          isLoading
            ? {
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                boxShadow: "0 0 0 1px rgba(16,185,129,0.4), 0 4px 20px rgba(16,185,129,0.2)",
              }
            : !isDisabled
            ? {
                background:
                  "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
                boxShadow:
                  "0 0 0 1px rgba(16,185,129,0.5), 0 4px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }
            : undefined
        }
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin flex-shrink-0"
              fill="none" viewBox="0 0 24 24" aria-hidden="true"
            >
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Generating…</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span>Generate</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Slider helper ─────────────────────────────────────────────────────────────

function SliderField({
  id, label, min, max, step = 1, value, onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] text-surface-100 mb-2 font-medium">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}
