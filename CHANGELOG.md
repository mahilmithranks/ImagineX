# Changelog — ImagineX

All notable changes to this project are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v1.3.0] — June 2, 2026

### 🐛 Bug Fixes

#### `ConnectTimeoutError` causing 500 on `/api/generate`
- **Problem:** When HuggingFace was unreachable, Node's `undici` HTTP client threw a `ConnectTimeoutError` with code `UND_ERR_CONNECT_TIMEOUT`. This is **not** an `AbortError`, so the existing catch block re-threw it unhandled, producing a generic `500 Internal Server Error` with no image.
- **Fix:** Added explicit detection for all undici/network error codes (`UND_ERR_*`, `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`) and names (`ConnectTimeoutError`, `FetchError`). These now gracefully fall back to **Pollinations.ai** instead of crashing.
- **Files:** `src/lib/huggingface.ts`

---

#### Tweak → Retry silently dropping advanced settings
- **Problem:** In `HomeClient.tsx`, the error-state retry handler only stored `lastPrompt`. When a user clicked **Tweak**, changed style / ratio / steps in Advanced Settings, and the generation failed — hitting **Retry** called `generate(lastPrompt)` with no settings, discarding all changes.
- **Fix:** Added `lastSettings` and `lastOverlay` state. `handleSubmit` now saves all three before calling `generate()`. Retry replays `generate(lastPrompt, lastSettings, lastOverlay)` fully.
- **Files:** `src/app/HomeClient.tsx`

---

#### Background dots stopping on page load
- **Problem:** `DottedSurface` had `[resolvedTheme]` in its `useEffect` dependency array. On every mount, the theme transitions `undefined → "dark"`, tearing down and rebuilding the entire Three.js scene — visibly stopping the wave animation.
- **Fix:** Removed `resolvedTheme` dependency entirely. The dot color is hardcoded to emerald and the theme is forced-dark, so reacting to theme changes was never needed. Effect now runs **once on mount** and cleans up on unmount — animation is continuous.
- **Files:** `src/components/ui/dotted-surface.tsx`

---

### ✨ New Features

#### Credits Exhausted — dedicated amber UI panel
- **Background:** HuggingFace returns `402 Payment Required` when free-tier credits are zero, and `429 Too Many Requests` on rate limit. Previously both codes fell through to a generic mock or a plain red error panel.
- **What's new:**
  - `402` and `429` are now explicitly detected in `huggingface.ts` and throw `QuotaError` with human-readable messages distinguishing the two cases.
  - A new `QuotaErrorState` component renders with an **amber/gold** theme (distinct from the red generic error), a pulsing coin icon (`@keyframes quota-pulse`), context-aware copy, and an **"Upgrade on HuggingFace"** CTA button for credit exhaustion.
  - Rate-limit variant shows a "usually resets in a few minutes" message instead.
  - An amber pill at the bottom informs users that **Pollinations.ai** is available as a free fallback.
- **Files:** `src/lib/huggingface.ts`, `src/components/GeneratedImagePanel.tsx`, `src/app/globals.css`

---

### 🔧 Improvements

#### Advanced Settings auto-opens in Tweak mode
- **Problem:** The Advanced Settings panel was always collapsed by default, even when tweaking a generation that had non-default style, steps, guidance, or negative prompt pre-filled. Users had no visual confirmation that settings were loaded, making it appear as if Tweak wasn't working.
- **Fix:** `PromptForm` now checks if any `initialSettings` value is non-default and opens the panel automatically on mount.
- **Files:** `src/components/PromptForm.tsx`

---

#### Negative prompt forwarded to Pollinations.ai fallback
- **Problem:** `buildMockDataUri` only accepted `width` and `height` — the negative prompt was completely discarded in the fallback path.
- **Fix:** Pollinations.ai supports a `?negative=` URL parameter. `buildMockDataUri` now accepts `negativePrompt` and appends it when set. All four fallback call sites updated.
- **Files:** `src/lib/huggingface.ts`

---

## [v1.2.0] — May 2026

### ✨ New Features

- **Pollinations.ai fallback** — When HuggingFace is unavailable or the API key is missing, all generation requests fall back to [Pollinations.ai](https://pollinations.ai). The fallback URL includes the full enhanced prompt (with style instructions), aspect ratio, and a random seed.
- **Style preset prompt enhancement (server-side)** — A `promptEnhancer` on the `/api/generate` route appends curated technical modifiers to the user's prompt based on the selected style (Realistic, Cinematic, Anime, Digital Art, 3D Render, Pixel Art).
- **"Tweak & Iterate" workflow** — Gallery cards expose a **Tweak** button. Clicking it saves the generation to `sessionStorage` and navigates to `/?tweak=<id>`. `HomeClient` reads this and pre-fills the `PromptForm` for rapid iteration.
- **SQLite gallery persistence** — All generations are persisted to `.data/imaginex.db` via `better-sqlite3`. A clean Repository pattern (`generationRepository.ts`) provides the data-access layer.

---

## [v1.1.0] — April 2026

### 🐛 Bug Fixes

- **Three.js DottedSurface memory leak** — `requestAnimationFrame` ID went stale; cleanup never cancelled the frame, causing `render()` after `dispose()`. Replaced ID tracking with a boolean `running` flag checked at the start of each tick.
- **Hero gradient text invisible under Framer Motion** — `VerticalCutReveal`'s `overflow: hidden` broke `background-clip: text` on the word "visuals". Isolated it from Framer Motion; replaced with a pure CSS `@keyframes shine` animation on `background-position`.
- **React Server Component hydration mismatch** — `page.tsx` (Server Component) was passing event handlers to client components. Refactored into `HomeClient.tsx` as a dedicated Client Component owning all interactive state.

### ✨ New Features

- **macOS-style frosted glass Navbar** — Floating pill with `backdrop-filter: blur(24px)`, tubelight inset highlight, and a centered layout with Generate / Gallery links.

---

## [v1.0.0] — March 2026

### 🚀 Initial Release

- Text-to-image generation via **HuggingFace Inference API**
- 4-state output panel (idle / loading / success / error) with animated status messages
- Gallery grid with skeleton shimmer loading and optimistic updates
- **Midnight & Emerald** design system — custom Tailwind tokens, multi-layer radial gradient body, premium scrollbar, and full keyframe library (`shimmer`, `fadeIn`, `slideUp`, `bounce`, `shine`)
- **Three.js DottedSurface** — 40×60 grid of emerald-tinted dots with sinusoidal wave animation on transparent WebGL canvas

---

*Last updated: June 2, 2026*
