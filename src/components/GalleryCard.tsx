/**
 * GalleryCard.tsx — Premium AI asset card.
 * Hover reveals Tweak · PNG · Delete actions.
 */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { downloadImage } from "@/lib/download";
import type { Generation } from "@/types/generation";

interface Props {
  generation: Generation;
  onDelete: (id: string) => void;
}

export function GalleryCard({ generation, onDelete }: Props) {
  const router = useRouter();

  function handleTweak() {
    sessionStorage.setItem(`tweak:${generation.id}`, JSON.stringify(generation));
    router.push(`/?tweak=${generation.id}`);
  }

  const date = new Date(generation.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const modelLabel = generation.settings.model.split("/").pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  return (
    <article
      className="group relative rounded-2xl overflow-hidden flex flex-col
                 transition-all duration-250 ease-out
                 hover:-translate-y-1"
      style={{
        background: "rgba(15, 15, 30, 0.8)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.35)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 1px rgba(16,185,129,0.2), 0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.35)";
      }}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden"
           style={{ background: "rgba(11,11,22,0.8)" }}>
        <Image
          src={generation.imageUrl}
          alt={generation.prompt}
          fill
          className="object-cover transition-transform duration-400 ease-out group-hover:scale-[1.04]"
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay text badge */}
        {generation.overlayText && (
          <div className="absolute bottom-0 inset-x-0 p-3">
            <span
              className="inline-block rounded-xl text-white text-[11px] font-medium
                         px-2.5 py-1 max-w-full truncate"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {generation.overlayText}
            </span>
          </div>
        )}

        {/* Model badge — glass pill, top left */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="rounded-full text-[10px] font-semibold tracking-wide px-2 py-0.5 text-white/55"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {modelLabel}
          </span>
        </div>

        {/* Hover action overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100
                     transition-opacity duration-200
                     flex items-center justify-center gap-2"
          style={{ background: "rgba(7,7,13,0.65)", backdropFilter: "blur(2px)" }}
          aria-hidden="true"
        >
          {/* Tweak */}
          <button
            id={`tweak-${generation.id}`}
            onClick={handleTweak}
            title="Tweak this generation"
            className="flex items-center gap-1.5 rounded-xl text-[12px] font-semibold
                       px-3 py-2 transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-white/40"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#111",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Tweak
          </button>

          {/* Download */}
          <button
            id={`download-${generation.id}`}
            onClick={() => downloadImage(generation.imageUrl, `imaginex-${generation.id}`)}
            title="Download as PNG"
            className="flex items-center gap-1.5 rounded-xl text-[12px] font-semibold
                       px-3 py-2 text-white transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-brand-400/50"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              boxShadow: "0 0 0 1px rgba(16,185,129,0.4), 0 2px 8px rgba(16,185,129,0.25)",
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PNG
          </button>

          {/* Delete */}
          <button
            id={`delete-${generation.id}`}
            onClick={() => onDelete(generation.id)}
            title="Delete"
            className="flex items-center gap-1.5 rounded-xl text-[12px] font-semibold
                       px-3 py-2 text-white transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-red-400/40"
            style={{
              background: "rgba(220,38,38,0.75)",
              boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* ── Metadata ──────────────────────────────────────────────────── */}
      <div className="px-3.5 py-3 flex flex-col gap-1.5"
           style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[13px] text-white/85 leading-snug line-clamp-2 font-medium">
          {generation.prompt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-surface-100">{date}</span>
          <span className="text-[10px] text-surface-200 truncate ml-2 max-w-[120px]" title={generation.settings.model}>
            {modelLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
