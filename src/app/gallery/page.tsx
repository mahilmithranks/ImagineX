/**
 * app/gallery/page.tsx — Gallery page.
 *
 * Full grid of all past generations with tweak and delete actions.
 * Thin page — delegates grid rendering to GalleryGrid, data to useGallery.
 */

"use client";

import { GalleryGrid } from "@/components/GalleryGrid";
import { useGallery } from "@/hooks/useGallery";

export default function GalleryPage() {
  const { generations, total, isLoading, error, removeGeneration } = useGallery();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gallery</h1>
          {!isLoading && (
            <p className="text-sm text-surface-100 mt-1">
              {total} {total === 1 ? "generation" : "generations"}
            </p>
          )}
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-xl text-white text-sm font-semibold
                     px-4 py-2.5 transition-all duration-150 active:scale-[0.97]
                     focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          style={{
            background: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
            boxShadow: "0 0 0 1px rgba(16,185,129,0.4), 0 4px 16px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New image
        </a>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <GalleryGrid
        generations={generations}
        isLoading={isLoading}
        error={error}
        onDelete={removeGeneration}
      />
    </div>
  );
}
