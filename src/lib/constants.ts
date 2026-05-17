import type { GenerationSettings, StylePresetId } from "@/types/generation";

export const DEFAULT_SETTINGS: GenerationSettings = {
  model: "black-forest-labs/FLUX.1-schnell",
  width: 1024,
  height: 1024,
  steps: 4,
  guidanceScale: 0,
  negativePrompt: "",
  stylePreset: "none",
};

export const AVAILABLE_MODELS = [
  { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX Schnell", description: "Fast · free tier" },
  { id: "stabilityai/stable-diffusion-2-1",  label: "SD 2.1",       description: "Balanced · free tier" },
  { id: "runwayml/stable-diffusion-v1-5",    label: "SD 1.5",       description: "Classic · free tier" },
] as const;

export const ASPECT_RATIO_PRESETS = [
  { label: "Square (1:1)",    width: 1024, height: 1024 },
  { label: "Portrait (3:4)",  width:  768, height: 1024 },
  { label: "Landscape (4:3)", width: 1024, height:  768 },
  { label: "Wide (16:9)",     width: 1024, height:  576 },
] as const;

export const MAX_PROMPT_LENGTH = 500;
export const GALLERY_PAGE_SIZE = 12;

/** Curated style presets — each maps to prompt enhancement instructions appended server-side. */
export const STYLE_PRESETS: {
  id: StylePresetId;
  label: string;
  emoji: string;
  instructions: string;
}[] = [
  { id: "none",        label: "None",        emoji: "✦",  instructions: "" },
  { id: "realistic",   label: "Realistic",   emoji: "📷", instructions: "ultra realistic, professional photography, natural lighting, highly detailed, sharp focus, 8k resolution" },
  { id: "cinematic",   label: "Cinematic",   emoji: "🎬", instructions: "cinematic shot, dramatic lighting, film grain, anamorphic lens, movie still, shallow depth of field, color graded" },
  { id: "anime",       label: "Anime",       emoji: "🎌", instructions: "anime style, vibrant colors, sharp linework, cel shading, detailed illustration, studio quality" },
  { id: "digital-art", label: "Digital Art", emoji: "🎨", instructions: "digital art, concept art illustration, vibrant colors, artstation quality, highly detailed, professional artwork" },
  { id: "3d-render",   label: "3D Render",   emoji: "🧊", instructions: "3D render, octane render, physically based rendering, studio lighting, photorealistic materials, high detail" },
  { id: "pixel-art",   label: "Pixel Art",   emoji: "🕹️", instructions: "pixel art, 16-bit style, retro game aesthetic, crisp pixels, limited color palette, sprite art" },
];

