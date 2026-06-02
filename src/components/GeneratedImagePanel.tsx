/**
 * GeneratedImagePanel.tsx — 4-state output panel.
 * idle / loading / success / error — each handled distinctly.
 *
 * Aspect ratio is derived from the generation's width/height so the panel
 * correctly reflects square, portrait, landscape and wide outputs.
 * Text overlay is rendered as a real visual layer over the image.
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Generation, ApiError } from "@/types/generation";

interface IdleProps    { status: "idle" }
interface LoadingProps { status: "loading" }
interface SuccessProps { status: "success"; generation: Generation; isMocked: boolean }
interface ErrorProps   { status: "error"; error: ApiError; onRetry: () => void }

type Props = IdleProps | LoadingProps | SuccessProps | ErrorProps;

/** Convert width/height into a CSS aspect-ratio string, e.g. "4 / 3" */
function toAspectRatio(width?: number, height?: number): string {
  if (!width || !height) return "1 / 1";
  return `${width} / ${height}`;
}

export function GeneratedImagePanel(props: Props) {
  const aspectRatio =
    props.status === "success"
      ? toAspectRatio(props.generation.settings.width, props.generation.settings.height)
      : "1 / 1"; // idle / loading / error always show square placeholder

  return (
    <div
      role="region"
      aria-label="Generated image output"
      aria-live="polite"
      className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden"
      style={{
        aspectRatio,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.5)",
        background: "rgba(11, 11, 22, 0.8)",
        transition: "aspect-ratio 0.3s ease",
      }}
    >
      {props.status === "idle"    && <IdleState />}
      {props.status === "loading" && <LoadingState />}
      {props.status === "success" && <SuccessState {...props} />}
      {props.status === "error"   && <ErrorState {...props} />}
    </div>
  );
}

// ── Idle ──────────────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-5 p-10
                 border-2 border-dashed border-white/[0.08] rounded-3xl"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
      >
        <svg className="w-8 h-8 text-brand-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-white/80 mb-1.5">Output will appear here</p>
        <p className="text-[12px] text-surface-100 leading-relaxed max-w-[220px]">
          Generated visuals are saved automatically and accessible from the gallery.
        </p>
      </div>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

const STATUS_MESSAGES = [
  "Initializing model…",
  "Analyzing prompt…",
  "Generating composition…",
  "Refining details…",
  "Applying style…",
  "Finalizing render…",
] as const;

function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
      {/* Shimmer block */}
      <div
        className="w-full flex-1 rounded-2xl"
        aria-hidden="true"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.10) 50%, rgba(16,185,129,0.04) 100%)",
          backgroundSize: "800px 100%",
          animation: "shimmer 1.8s infinite linear",
        }}
      />

      {/* Status */}
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-400"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p
          key={msgIndex}
          className="text-[12px] font-medium text-white/80 animate-fade-in"
        >
          {STATUS_MESSAGES[msgIndex]}
        </p>
        <p className="text-[11px] text-surface-200">May take up to 60 seconds on first run</p>
      </div>
    </div>
  );
}

// ── Success ───────────────────────────────────────────────────────────────────

const IMAGE_STATUS_MESSAGES = [
  "Rendering image…",
  "Fetching from AI…",
  "Almost there…",
  "Applying style…",
  "Finalizing…",
] as const;

function SuccessState({ generation, isMocked }: SuccessProps) {
  const [imgReady, setImgReady] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  const modelLabel = generation.settings.model.split("/").pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  // Reset shimmer every time the image URL changes (new generation)
  useEffect(() => {
    setImgReady(false);
    setMsgIndex(0);
  }, [generation.imageUrl]);

  // Cycle status messages while image is loading
  useEffect(() => {
    if (imgReady) return;
    const t = setInterval(
      () => setMsgIndex((i) => (i + 1) % IMAGE_STATUS_MESSAGES.length),
      1800
    );
    return () => clearInterval(t);
  }, [imgReady]);

  return (
    <div className="relative w-full h-full">

      {/* ── Shimmer shown while the actual image is loading ── */}
      {!imgReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 animate-fade-in">
          {/* Shimmer block */}
          <div
            className="w-full flex-1 rounded-2xl"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.04) 100%)",
              backgroundSize: "800px 100%",
              animation: "shimmer 1.8s infinite linear",
            }}
          />
          {/* Status dots + message */}
          <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-brand-400"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p key={msgIndex} className="text-[12px] font-medium text-white/80 animate-fade-in">
              {IMAGE_STATUS_MESSAGES[msgIndex]}
            </p>
            <p className="text-[11px] text-surface-200">
              {isMocked ? "Generating via Pollinations.ai…" : "May take up to 60 seconds"}
            </p>
          </div>
        </div>
      )}

      {/* ── Actual image — hidden until loaded, then fades in ── */}
      <Image
        src={generation.imageUrl}
        alt={generation.prompt}
        fill
        className={clsx(
          "object-cover transition-opacity duration-500",
          imgReady ? "opacity-100" : "opacity-0"
        )}
        unoptimized
        priority
        onLoad={() => setImgReady(true)}
        onError={() => setImgReady(true)}
      />

      {/* ── Visual text overlay ── rendered on top of the image */}
      {imgReady && generation.overlayText && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in"
          aria-label={`Text overlay: ${generation.overlayText}`}
        >
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "clamp(1.5rem, 8cqw, 5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.92)",
              textShadow:
                "0 2px 12px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.9)",
              textAlign: "center",
              padding: "0 1rem",
              lineHeight: 1.1,
              userSelect: "none",
            }}
          >
            {generation.overlayText}
          </span>
        </div>
      )}

      {/* Model badge — bottom right, glass pill */}
      {!isMocked && modelLabel && imgReady && (
        <div className="absolute bottom-3 right-3 pointer-events-none animate-fade-in">
          <span
            className="rounded-full text-[10px] font-semibold tracking-wide px-2.5 py-1 text-white/60"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {modelLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────

const ERROR_HINTS: Record<string, string> = {
  API_QUOTA:      "Your HuggingFace free-tier credits are exhausted or the rate limit was hit.",
  API_TIMEOUT:    "Model was warming up. It should be ready now — try again.",
  INTERNAL_ERROR: "An unexpected server error occurred.",
  INVALID_PROMPT: "Revise your prompt and try again.",
};

function ErrorState({ error, onRetry }: ErrorProps) {
  // Dedicated premium state for credits / quota errors
  if (error.code === "API_QUOTA") {
    return <QuotaErrorState error={error} />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-5 p-10" role="alert">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-white mb-1.5">{error.error}</p>
        <p className="text-[12px] text-surface-100">{ERROR_HINTS[error.code]}</p>
      </div>
      {error.retryable && (
        <button
          id="retry-btn"
          onClick={onRetry}
          className="text-[13px] font-medium text-brand-400 hover:text-brand-300
                     underline underline-offset-2 transition-colors duration-150
                     focus:outline-none focus:ring-2 focus:ring-brand-500/30 rounded px-2 py-0.5"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ── Quota / Credits Exhausted ─────────────────────────────────────────────────

function QuotaErrorState({ error }: { error: ApiError }) {
  // Detect whether it’s a hard credit limit (402) or a rate limit (429)
  const isRateLimit = error.error.toLowerCase().includes("rate limit");

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6 p-10 animate-fade-in"
      role="alert"
      aria-label="Credits exhausted"
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          boxShadow: "0 0 24px rgba(245,158,11,0.08)",
        }}
      >
        {/* Coin / currency icon */}
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "#f59e0b" }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536-.219-2.121-.659-.586-.439-.879-1.012-.879-1.591s.293-1.152.879-1.591A3.75 3.75 0 0112 6.75" />
          <circle cx="12" cy="12" r="9.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "0 0 0 0 rgba(245,158,11,0.4)",
            animation: "quota-pulse 2s ease-out infinite",
          }}
        />
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p
          className="text-[15px] font-bold"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {isRateLimit ? "Rate Limit Reached" : "Credits Exhausted"}
        </p>
        <p className="text-[12px] text-white/70 leading-relaxed max-w-[260px]">
          {isRateLimit
            ? "You’ve hit the HuggingFace API rate limit. Wait a few minutes and try generating again."
            : "Your HuggingFace free-tier inference credits are used up for this billing period."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {isRateLimit ? (
          <p className="text-[11px] text-surface-200">Usually resets within a few minutes.</p>
        ) : (
          <a
            href="https://huggingface.co/settings/billing"
            target="_blank"
            rel="noopener noreferrer"
            id="hf-billing-link"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold
                       text-white transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 0 0 1px rgba(245,158,11,0.4), 0 4px 16px rgba(245,158,11,0.2)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Upgrade on HuggingFace
          </a>
        )}

        <p
          className="text-[11px] px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.12)",
            color: "rgba(245,158,11,0.7)",
          }}
        >
          ⚡ Images are still served via Pollinations.ai in fallback mode
        </p>
      </div>
    </div>
  );
}
