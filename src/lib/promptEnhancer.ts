/**
 * promptEnhancer.ts — Combines user prompt with style preset instructions.
 *
 * Design decisions:
 *   - Single responsibility: this file ONLY builds the final prompt string.
 *   - The user's original intent is always preserved — instructions are
 *     appended, never substituted.
 *   - "none" preset is a no-op, so existing generations are unaffected.
 *   - Kept as a pure function: no side effects, fully testable.
 *
 * Extensibility:
 *   - Adding a new preset is a one-line addition to STYLE_PRESETS in constants.ts.
 *   - More advanced enhancement (e.g. LoRA tokens, negative prompt injection)
 *     can be added here without touching the route or UI layer.
 */

import { STYLE_PRESETS } from "@/lib/constants";
import type { StylePresetId } from "@/types/generation";

/**
 * Returns the final prompt to send to the AI model.
 *
 * If a style preset is selected, its instruction string is appended
 * to the user's prompt with a comma separator. The user's original
 * wording is always the leading part of the final prompt.
 */
export function enhancePrompt(
  userPrompt: string,
  stylePresetId?: StylePresetId
): string {
  if (!stylePresetId || stylePresetId === "none") {
    return userPrompt;
  }

  const preset = STYLE_PRESETS.find((p) => p.id === stylePresetId);
  if (!preset?.instructions) {
    return userPrompt;
  }

  return `${userPrompt}, ${preset.instructions}`;
}
