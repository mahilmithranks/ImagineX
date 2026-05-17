"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";

export function AnimatedHero() {
  return (
    <>
      {/* Three.js animated dot grid — fixed behind everything */}
      <DottedSurface />

      {/* Eyebrow badge */}
      <div
        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full
                   text-[11px] font-semibold tracking-widest text-brand-300 uppercase"
        style={{
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.20)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
        Generative Media Workspace
      </div>

      {/* Heading — static, no animation on the text itself */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-5">
        <span className="text-white">Turn words into </span>

        {/*
         * "visuals" — shiny sweeping gradient.
         * A bright highlight travels across the emerald gradient continuously.
         * background-size: 300% lets the position animation sweep a full highlight.
         */}
        <span
          style={{
            background:
              "linear-gradient(90deg, #059669 0%, #34d399 25%, #a7f3d0 45%, #6ee7b7 55%, #34d399 75%, #059669 100%)",
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shine 3s linear infinite",
            display: "inline",
          }}
        >
          visuals
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-[15px] leading-relaxed max-w-md mx-auto"
        style={{ color: "rgba(160,160,200,0.85)" }}
      >
        Generate production-quality images from natural language.
        Iterate, tweak, and build your creative output — all in one workspace.
      </p>
    </>
  );
}
