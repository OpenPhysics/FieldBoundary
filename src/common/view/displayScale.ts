/**
 * displayScale.ts
 *
 * One implementation of the "shrink the secondary arrows so large εᵣ / μᵣ stay
 * on screen" rule, shared by the vector, component-overlay, and bound-source
 * layers (it used to exist as three near-identical copies that could drift).
 *
 * The factor is deliberately surfaced in the UI via `formatScaleBadge`:
 * comparing arrow lengths is the most natural thing a student does with two
 * arrows, so a silent rescale rewards a false inference about |D| versus |E|.
 */
import type { Vector2 } from "scenerystack/dot";

/**
 * Largest factor ≤ 1 that keeps every vector in `scaled` within `headroom`
 * times the longest vector in `reference`.
 */
export function displayScale(scaled: readonly Vector2[], reference: readonly Vector2[], headroom: number): number {
  const maxScaled = Math.max(...scaled.map((v) => v.magnitude), 1e-6);
  const maxReference = Math.max(...reference.map((v) => v.magnitude), 1e-6);
  return Math.min(1, (maxReference * headroom) / maxScaled);
}

/** True when the scale factor is close enough to 1 that no badge is warranted. */
export function isUnityScale(scale: number): boolean {
  return scale > 0.995;
}

/**
 * Badge text for a display scale, e.g. "×0.25". Empty when the arrows are drawn
 * at true relative length.
 */
export function formatScaleBadge(scale: number): string {
  if (isUnityScale(scale)) {
    return "";
  }
  return `×${scale < 0.01 ? scale.toExponential(1) : scale.toFixed(2)}`;
}
