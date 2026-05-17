// ────────────────────────────────────────────────────────────────────────────
// Generation domain types
// ────────────────────────────────────────────────────────────────────────────

/** Identifiers for curated style presets. "none" means no enhancement. */
export type StylePresetId =
  | "none"
  | "realistic"
  | "cinematic"
  | "anime"
  | "digital-art"
  | "3d-render"
  | "pixel-art";

export interface GenerationSettings {
  /** Model identifier */
  model: string;
  width: number;
  height: number;
  steps: number;
  guidanceScale: number;
  negativePrompt?: string;
  /** Style preset applied before sending to the AI model */
  stylePreset?: StylePresetId;
}

export type GenerationStatus = "pending" | "generating" | "success" | "error";

export interface Generation {
  id: string;
  prompt: string;
  settings: GenerationSettings;
  /** Absolute URL or data-URI of the generated image */
  imageUrl: string;
  /** ISO-8601 timestamp */
  createdAt: string;
  status: GenerationStatus;
  /** Optional overlay text (bonus feature) */
  overlayText?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// API request / response shapes
// ────────────────────────────────────────────────────────────────────────────

export interface GenerateRequest {
  prompt: string;
  settings?: Partial<GenerationSettings>;
  overlayText?: string;
}

export interface GenerateResponse {
  generation: Generation;
  /** True when the API quota was hit and a mock was returned */
  isMocked: boolean;
}

export interface GalleryResponse {
  generations: Generation[];
  total: number;
}

export interface ApiError {
  error: string;
  code: "INVALID_PROMPT" | "API_QUOTA" | "API_TIMEOUT" | "INTERNAL_ERROR";
  retryable: boolean;
}
