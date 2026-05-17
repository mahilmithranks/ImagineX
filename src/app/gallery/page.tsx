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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gallery</h1>
          {!isLoading && (
            <p className="text-sm text-muted mt-1">
              {total} {total === 1 ? "generation" : "generations"}
            </p>
          )}
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-400
                     text-white text-sm font-semibold px-4 py-2.5 transition-colors duration-150
                     shadow-lg shadow-brand-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New image
        </a>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <GalleryGrid
        generations={generations}
        isLoading={isLoading}
        error={error}
        onDelete={removeGeneration}
      />
    </div>
  );
}
