/**
 * GalleryGrid.tsx — Masonry container for GalleryCards.
 * Handles: skeleton, empty state, populated masonry grid.
 *
 * Uses CSS columns (masonry) so cards with varied aspect ratios
 * (square, portrait, landscape, wide) stack without row-height gaps.
 */

"use client";

import { GalleryCard } from "@/components/GalleryCard";
import type { Generation } from "@/types/generation";

interface Props {
  generations: Generation[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
}

export function GalleryGrid({ generations, isLoading, error, onDelete }: Props) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3" role="alert">
        <p className="text-[13px] text-red-400">{error}</p>
        <p className="text-[11px] text-surface-100">Refresh the page to try again.</p>
      </div>
    );
  }

  if (isLoading) return <SkeletonGrid />;
  if (generations.length === 0) return <EmptyState />;

  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3"
      style={{ columnGap: "1.25rem" }}
    >
      {generations.map((g) => (
        <div key={g.id} className="mb-5 break-inside-avoid">
          <GalleryCard generation={g} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  // Alternate aspect ratios to visually simulate a mixed-ratio masonry layout
  const skeletonRatios = ["1/1", "3/4", "4/3", "1/1", "16/9", "3/4"];

  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3"
      style={{ columnGap: "1.25rem" }}
      aria-label="Loading gallery…"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="mb-5 break-inside-avoid rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,15,30,0.8)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              aspectRatio: skeletonRatios[i],
              backgroundImage: "linear-gradient(90deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.09) 50%, rgba(16,185,129,0.04) 100%)",
              backgroundSize: "800px 100%",
              animation: `shimmer 1.8s ${i * 0.12}s infinite linear`,
            }}
          />
          <div className="px-3.5 py-3 flex flex-col gap-2.5"
               style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="h-2.5 w-3/4 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-2   w-2/5 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.12)",
          boxShadow: "0 0 24px rgba(16,185,129,0.06)",
        }}
      >
        <svg className="w-7 h-7 text-brand-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12z" />
        </svg>
      </div>

      <div className="max-w-xs">
        <p className="text-[15px] font-semibold text-white/80 mb-2">Your workspace is empty</p>
        <p className="text-[13px] text-surface-100 leading-relaxed">
          Every generation is saved here automatically. Start from the{" "}
          <a
            href="/"
            className="text-brand-400 hover:text-brand-300 underline underline-offset-2
                       transition-colors duration-150 focus:outline-none
                       focus:ring-2 focus:ring-brand-500/30 rounded"
          >
            Generate
          </a>{" "}
          page, then return to tweak and iterate.
        </p>
      </div>
    </div>
  );
}
