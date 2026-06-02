# ImagineX — Premium Generative Media Workspace

**🚀 Live Demo:** [https://imaginex-1qzc.onrender.com/](https://imaginex-1qzc.onrender.com/)

ImagineX is a state-of-the-art, production-grade creative tool designed to seamlessly transform natural language into stunning visual media. By prioritizing user experience, modern design aesthetics, and a robust underlying architecture, ImagineX transcends the typical AI wrapper to deliver a premium, end-to-end generative workflow.

## 🌟 Core Features

### 1. High-Fidelity Text-to-Image Generation
At the heart of ImagineX is a seamless integration with the **Hugging Face Inference API**. Users can input natural language prompts and receive high-quality generated outputs. The application handles the complex asynchronous states (loading, polling, error-handling, success) behind the scenes, offering users a buttery-smooth experience.

### 2. AI Prompt Enhancer & Style Presets
To guarantee output diversity without forcing users to become "prompt engineers", ImagineX utilizes a server-side **Prompt Enhancer**. Users can select from curated Style Presets (e.g., *Realistic, Cinematic, Anime, 3D Render, Pixel Art*). The system intercepts the base prompt and dynamically injects advanced styling modifiers before sending the request to the model, ensuring highly stylized and accurate results.

### 3. "Tweak & Iterate" Workflow
Creativity is iterative. ImagineX introduces a seamless "Tweak" functionality. When viewing a generated image, users can click "Tweak" to instantly map the image's original prompt and all advanced settings (style preset, aspect ratio, steps, guidance, negative prompt) back into the active generation form. The Advanced Settings panel auto-opens when pre-filled, giving the user full visibility into what is loaded and ready to change.

### 4. Local SQLite Gallery Persistence
No images are lost. Using a robust **Repository Pattern** over `better-sqlite3`, all generations are automatically persisted locally. The gallery serves as a persistent visual history of the user's workspace, complete with immediate download capabilities directly to the user's device.

### 5. Premium UI & Micro-interactions
The user interface has been meticulously crafted to feel like a high-end subscription product:
- **Atmospheric Aesthetic**: A deep midnight/charcoal baseline paired with vivid Emerald (`#10b981`) accents.
- **Glassmorphism**: A macOS-inspired floating frosted glass navbar and translucent panels.
- **Dynamic Backgrounds**: An interactive `three.js` particle background (`DottedSurface`) anchors the hero section with a continuous, never-stopping wave animation.
- **Fluid CSS Animations**: Custom staggered shimmers for loading states, smooth slide-up text transitions, and continuous sweeping gradient shines on focal points.

### 6. Intelligent Error Handling & Fallback
- **Network resilience**: When HuggingFace is unreachable (timeout, DNS failure), requests automatically fall back to [Pollinations.ai](https://pollinations.ai) — a free image API — so users always get a result.
- **Credits Exhausted UI**: HTTP 402/429 from HuggingFace shows a dedicated amber "Credits Exhausted" panel with a billing link, clearly distinguishing a credit issue from a system error.
- **Style & settings preserved**: All advanced settings (style preset, negative prompt, aspect ratio) are forwarded to the fallback API where supported.

---

## 🛠️ Architecture & Tech Stack

ImagineX is built using a modern, scalable web stack:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack) 
- **Language**: TypeScript (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom design token system (globals.css).
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Three.js](https://threejs.org/)
- **Database**: Local SQLite using [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- **AI Infrastructure**: [Hugging Face Serverless Inference API](https://huggingface.co/docs/api-inference/index)
- **Theming**: `next-themes` (forced dark mode, handling SSR hydration mismatches)

### Directory Structure
```text
/src
 ├── app/                  # Next.js App Router (pages, layouts, API routes)
 │   ├── api/generate/     # Server-side generation handler & Prompt Enhancer
 │   ├── api/gallery/      # Gallery persistence endpoints
 │   ├── globals.css       # Core design tokens, gradients, and keyframes
 │   ├── layout.tsx        # Root layout, Font definitions, ThemeProvider
 │   └── page.tsx          # Server Component shell for the Home view
 │
 ├── components/           # Reusable UI & Layout Components
 │   ├── ui/               # Radix/shadcn-inspired primitive components (DottedSurface)
 │   ├── AnimatedHero.tsx  # Client-side 3D background & Framer animations
 │   ├── Navbar.tsx        # Frosted glass global navigation
 │   ├── PromptForm.tsx    # Complex generation input & settings handler
 │   └── GalleryGrid.tsx   # Async loading grid with skeleton shimmers
 │
 ├── hooks/                # Custom React Hooks
 │   ├── useGenerate.ts    # State machine for the generation lifecycle (Discriminated Unions)
 │   └── useGallery.ts     # Gallery fetching and optimistic state updates
 │
 ├── lib/                  # Utilities, DB schema, and API integrations
 │   ├── db.ts             # SQLite connection initialization
 │   ├── generationRepo.ts # Repository pattern data access layer
 │   ├── huggingface.ts    # HF Inference client 
 │   └── download.ts       # Blob-based image downloading utility
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- A Hugging Face account and an Access Token (Read/Write)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/imaginex.git
   cd imaginex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Open `.env.local` and add your Hugging Face API Token:
   ```env
   HUGGINGFACE_API_KEY="hf_your_api_token_here"
   ```
   *(Note: The application includes a fallback mock mode if the key is missing or rate-limited, ensuring the UI remains testable).*

4. **Initialize Database**
   The application will automatically initialize the `.data/imaginex.db` SQLite database upon the first generation or gallery request. No manual schema setup is required.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 💡 Future Roadmap

While ImagineX is structurally complete as a generative workspace MVP, future iterations could include:
- **Cloud Persistence**: Migrating from SQLite to PostgreSQL (e.g., Supabase or Vercel Postgres) for deployed multi-tenant architecture.
- **Image-to-Image Generation**: Expanding the Hugging Face router to support ControlNet or Img2Img models.
- **Authentication**: Implementing NextAuth/Clerk for user-specific galleries and workspaces.
- **Asset Storage**: Migrating Base64 stored data-URIs to a dedicated object store (AWS S3 / Cloudflare R2).

---

## 📋 Recent Updates (June 2026)

| # | Change | Files |
|---|--------|-------|
| 1 | Fixed `ConnectTimeoutError` (undici `UND_ERR_*`) causing unhandled 500 — now falls back to Pollinations.ai | `huggingface.ts` |
| 2 | Fixed Tweak → Retry silently dropping advanced settings (style, ratio, model, overlay) | `HomeClient.tsx` |
| 3 | Added dedicated **Credits Exhausted** amber UI panel (HTTP 402/429) with HuggingFace billing link | `GeneratedImagePanel.tsx`, `huggingface.ts`, `globals.css` |
| 4 | Advanced Settings auto-opens in Tweak mode so pre-filled style/steps/guidance/negative are visible | `PromptForm.tsx` |
| 5 | Negative prompt now forwarded to Pollinations.ai fallback via `?negative=` URL param | `huggingface.ts` |
| 6 | Fixed background dots stopping — removed `resolvedTheme` dependency that was restarting the Three.js scene on mount | `dotted-surface.tsx` |