/**
 * page.tsx — Home page Server Component shell.
 *
 * Keeps the layout, hero, and Suspense boundary here (server).
 * All client state (useGenerate, useGallery) lives in HomeClient.
 */

import { Suspense } from "react";
import { HomeClient } from "@/app/HomeClient";
import { AnimatedHero } from "@/components/AnimatedHero";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="mb-14 text-center max-w-2xl mx-auto">
        <AnimatedHero />
      </div>

      {/* ── Generator (client) ────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>

    </div>
  );
}
