# 🎯 ImagineX — 15-Min Interview Cheat Sheet

> Scan top-to-bottom. Every row = **What → Where → Why/Problem Solved**.

---

## 1. TECH STACK — What & Why

| Technology | File(s) | What it does | Problem it solves |
|---|---|---|---|
| **Next.js 16 App Router** | `src/app/` | Framework. Pages + API routes in one repo. Server Components by default. | Colocation of API + UI. Zero client JS for static shells. |
| **TypeScript (strict)** | everywhere | Type safety across the whole codebase | Catches bugs at compile time, not runtime |
| **Tailwind CSS** | `tailwind.config.js`, `globals.css` | Utility-first styling + custom design tokens | Rapid UI building with a consistent design system |
| **Framer Motion** | `AnimatedHero.tsx` | Declarative animations (`VerticalCutReveal`, slide-ups) | Smooth staggered text entrances on the hero |
| **Three.js** | `components/ui/dotted-surface.tsx` | WebGL particle grid (40×60 emerald dots with sine wave) | Dynamic "alive" background impossible with pure CSS |
| **better-sqlite3** | `src/lib/db.ts` | Synchronous SQLite — file-based local DB | Zero-config persistence. No external DB server needed. |
| **next-themes** | `src/app/layout.tsx` | Dark/light mode management with SSR safety | Prevents hydration mismatch from `class="dark"` injection |
| **HuggingFace API** | `src/lib/huggingface.ts` | Text-to-image via FLUX.1-schnell model | Primary AI image generation engine |
| **Pollinations.ai** | `src/lib/huggingface.ts` | Free fallback image API (no auth needed) | Ensures users ALWAYS get an image even if HF is down |

---

## 2. ARCHITECTURE — Server vs Client

```
page.tsx (SERVER Component)          ← No state. No event handlers. Just layout HTML.
    └── HomeClient.tsx (CLIENT)      ← Owns ALL interactive state (generate + gallery)
            ├── useGenerate.ts       ← State machine for the generation lifecycle
            ├── useGallery.ts        ← Fetches + optimistically manages gallery list
            ├── PromptForm.tsx       ← User input (prompt, style, settings, overlay)
            └── GeneratedImagePanel.tsx ← 4-state output display
```

**Why split page.tsx and HomeClient.tsx?**
- React Server Components CANNOT have `useState` or event handlers
- Trying to pass `onSubmit` from `page.tsx` caused: *"Event handlers cannot be passed to Client Component props"*
- Fix: `HomeClient.tsx` is the single `"use client"` boundary — all interactivity lives inside it

---

## 3. STATE MACHINE — `useGenerate.ts`

**File:** `src/hooks/useGenerate.ts`

```typescript
type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; generation: Generation; isMocked: boolean }
  | { status: "error"; error: ApiError };
```

**What:** A discriminated union that models exactly 4 states  
**Where:** `src/hooks/useGenerate.ts` → consumed by `HomeClient.tsx`  
**Why:** TypeScript narrows the type automatically. If `state.status === "success"`, you KNOW `state.generation` exists — no null checks.  
**Problem solved:** Impossible UI states. You can never accidentally render a "success" panel while `generation` is undefined.

**Key pattern — `useCallback` on `generate`:**
- Prevents the function from being recreated on every render
- Without it: `onSuccess` captures a stale `addGeneration` reference → second generation never updates the gallery (**stale closure bug**)

---

## 4. API INTEGRATION — `huggingface.ts`

**File:** `src/lib/huggingface.ts`

### The call flow:
```
POST /api/generate
  → promptEnhancer.ts  (appends style modifiers + overlay text to prompt)
  → huggingface.ts     (calls FLUX.1-schnell model)
  → returns base64 data-URI  OR  Pollinations.ai URL
```

### Error handling table (most important thing to know):

| Scenario | Detection | Response |
|---|---|---|
| No API key | `!apiKey` check at top | Immediate → Pollinations.ai |
| Model loading | HTTP 503 | → Pollinations.ai |
| Credits exhausted | HTTP 402 | Throw `QuotaError` → amber UI panel |
| Rate limited | HTTP 429 | Throw `QuotaError` → amber UI panel |
| 60s timeout | `AbortController` fires | `AbortError` → Pollinations.ai |
| DNS/TCP failure | `UND_ERR_*`, `ECONNREFUSED` | → Pollinations.ai |
| Any other HTTP error | `!response.ok` | → Pollinations.ai |

**Why separate `QuotaError` from other errors?**  
402/429 = billing issue, not transient. Silently falling back would mislead the user into thinking it worked. Instead: dedicated **amber UI panel** with "Upgrade on HuggingFace" button.

**The undici bug (hardest fix):**  
Node's internal HTTP client (`undici`) throws `ConnectTimeoutError` on network timeout — NOT `AbortError`. The original code re-threw it unhandled → 500 crash. Fix: check `error.code.startsWith("UND_ERR")` and `error.name === "ConnectTimeoutError"`.

---

## 5. PROMPT ENHANCER — `promptEnhancer.ts`

**File:** `src/lib/promptEnhancer.ts`  
**What:** Server-side function that appends style modifiers to the user's raw prompt  
**Where:** Called inside `/api/generate/route.ts` before sending to HuggingFace  
**Why:** Users shouldn't need to be "prompt engineers". Selecting "Cinematic" appends technical modifiers like `"cinematic lighting, anamorphic lens, film grain"` automatically.

```
User types:  "A cat on a rooftop"
Style = Cinematic
Final prompt sent to FLUX: "A cat on a rooftop, cinematic lighting, anamorphic lens, film grain"
```

**Text overlay:** If overlay text is set (e.g., "NIGHT CITY"), it appends:  
`The word "NIGHT CITY" is written boldly and realistically integrated into the scene.`  
→ FLUX renders the text **natively into the pixel** — it's not a CSS overlay, it's part of the image.

---

## 6. DATABASE — `db.ts` + `generationRepository.ts`

### db.ts
**What:** Singleton SQLite connection  
**Problem solved:** Next.js hot-reload re-initialises modules in dev. Without a singleton cached on `global.__db`, a new DB connection opens every hot-reload.  
**WAL mode:** `db.pragma("journal_mode = WAL")` — allows concurrent reads while writing. Better performance under load.  
**Auto-init:** Table is created with `CREATE TABLE IF NOT EXISTS` on startup — no manual migration needed.

### generationRepository.ts
**What:** Repository Pattern — the ONLY place that touches the DB  
**Why:** API routes call `insertGeneration()`, `getAllGenerations()` etc. — they never write raw SQL.  
**Problem solved:** If you swap SQLite → PostgreSQL later, you only change this one file. Zero changes to route handlers or UI.

```
API Route → generationRepository.ts → db.ts → .data/imaginex.db
```

**Settings stored as JSON blob** in a `TEXT` column — no schema migration needed when adding new settings fields.

---

## 7. TWEAK WORKFLOW — End-to-End

**Files:** `GalleryCard.tsx` → `sessionStorage` → `HomeClient.tsx` → `PromptForm.tsx`

```
1. User hovers gallery card → "Tweak" button appears
2. Click → saves full Generation object to sessionStorage as "tweak:<id>"
3. Navigates to /?tweak=<id>
4. HomeClient reads tweakId from URL params
5. Fetches generation from sessionStorage → sets initialPrompt, initialSettings, initialOverlay
6. PromptForm is rendered with key={tweakId} → FORCES a clean remount
7. Advanced Settings panel auto-opens if any non-default value detected
```

**Why `key={tweakId}` on PromptForm?**  
React's `useState` only reads initial values ONCE on mount. If you just change the `initialPrompt` prop after mount, the internal state doesn't update. Using `key` forces React to unmount + remount — fresh state with correct initial values.

**Retry also preserves settings:**  
`lastPrompt`, `lastSettings`, `lastOverlay` are saved in `HomeClient` before every `generate()` call. Retry replays all three — not just the prompt.

---

## 8. GALLERY — `useGallery.ts`

**What:** Custom hook managing the gallery list  
**Where:** `src/hooks/useGallery.ts` → used in `HomeClient.tsx`

**Two key patterns:**

**Optimistic add** — When generation succeeds, `addGeneration()` instantly prepends to the list without waiting for a DB re-fetch. The DB write happens in the background on the server.

**Optimistic remove** — When user deletes an image, it's removed from UI immediately. DELETE request fires async. If it fails, `fetchGallery()` is called to restore correct state.

**Why:** No spinner on the gallery after generating. The image appears immediately.

---

## 9. UI BUGS FIXED

### Bug 1 — Hero text "visuals" invisible
**Cause:** Framer Motion's `VerticalCutReveal` uses `overflow: hidden` on each span → breaks `background-clip: text` (stacking context issue)  
**Fix:** Isolated "visuals" from Framer Motion. Pure CSS `@keyframes shine` animates `background-position` on a `300% auto` gradient — sweeping highlight effect.

### Bug 2 — Three.js dots stopping mid-animation
**Cause:** `requestAnimationFrame` ID went stale. Cleanup never cancelled the frame → `render()` called after `dispose()`.  
**Fix:** Replaced ID tracking with a `boolean running` flag. `animate()` checks `if (!running) return` at the start of each tick.

### Bug 3 — Gallery cards all square despite aspect ratio setting
**Cause:** `GalleryCard` hardcoded `aspect-square`.  
**Fix:** Compute `aspectRatio = width / height` → apply via inline `style={{ aspectRatio }}`. Switch gallery from CSS grid → **CSS columns (masonry)** layout so mixed-ratio cards pack without gaps.

### Bug 4 — Tailwind transition classes not working
**Cause:** `duration-250` and `duration-400` don't exist in Tailwind's default scale → silently ignored → instant (no) transition.  
**Fix:** `duration-250` → `duration-200`, `duration-400` → `duration-300`.

### Bug 5 — SSR Hydration mismatch
**Cause:** SSR renders `<html>` with no class. Client injects `class="dark"` immediately → DOM mismatch React warning.  
**Fix:** `suppressHydrationWarning` on `<html>` + `<body>`. `ThemeProvider` with `forcedTheme="dark"`.

---

## 10. QUICK ANSWERS — If They Ask Directly

**"Why no external SDK for HuggingFace?"**  
Raw `fetch()` keeps the bundle lean and avoids version churn. HF's API is simple REST — no SDK needed.

**"Why SQLite and not Postgres?"**  
This is a single-user local workspace. SQLite is zero-config, file-based, survives restarts. Repository pattern makes switching to Postgres trivial later (just replace `db.ts` + `generationRepository.ts`).

**"How would you scale this for multiple users?"**  
1. Add auth (NextAuth/Clerk) → 2. Swap SQLite → Supabase/Vercel Postgres → 3. Move base64 image storage → S3/R2 object store → 4. Store only URL in DB.

**"What is FLUX.1-schnell?"**  
Open-source text-to-image model by Black Forest Labs. "schnell" = fast (German). Excellent prompt adherence and native text rendering capability.

**"What's Pollinations.ai?"**  
Free, no-auth image generation API: `image.pollinations.ai/prompt/{text}`. Used as a graceful fallback — supports `width`, `height`, `seed`, and `negative` params.

**"What does 'forward deployed engineer' mean to you in context of this project?"**  
Taking ownership of the full stack — from the AI API integration to the UI edge cases. A FDE ships working software to real users, handles failure gracefully, and builds for extensibility.

---

*ImagineX v1.5.0 | June 2026*
