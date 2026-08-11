/**
 * FieldBoundaryConstants.ts
 *
 * Named numeric constants for layout and the interface-field model.
 */

import { Range } from "scenerystack/dot";
import FieldBoundaryNamespace from "./FieldBoundaryNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Horizontal gap between the play area and the right-hand control column. */
export const PLAY_AREA_RIGHT_GUTTER = 280;

// ── Model space (arbitrary field units; ε₀ = μ₀ = 1) ───────────────────────────

/** Model x half-width of the play area. */
export const MODEL_HALF_WIDTH = 5;

/** Model y extent of each medium away from the interface. */
export const MODEL_HALF_HEIGHT = 3.5;

/** Default primary-field magnitude (E₁ or H₁). */
export const DEFAULT_FIELD_MAGNITUDE = 2.2;

/** Allowed primary-field magnitudes. */
export const FIELD_MAGNITUDE_RANGE = new Range(0.8, 3.5);

/** Default angle of the primary field from the interface normal (rad). */
export const DEFAULT_FIELD_ANGLE = Math.PI / 5;

/**
 * Max |θ| from the normal. Keeps a nonzero normal component so boundary
 * scaling stays well-defined.
 */
export const MAX_FIELD_ANGLE = Math.PI / 2 - 0.12;

/** Relative permittivity / permeability slider range (allows water-like εᵣ). */
export const RELATIVE_PARAMETER_RANGE = new Range(1, 80);

export const DEFAULT_EPS1 = 1;
export const DEFAULT_EPS2 = 4;
export const DEFAULT_MU1 = 1;
export const DEFAULT_MU2 = 4;

/** Number of field lines drawn when the lattice toggle is on. */
export const FIELD_LINE_COUNT = 9;

/** Arrow geometry (view pixels). */
export const ARROW_HEAD_WIDTH = 16;
export const ARROW_HEAD_HEIGHT = 14;
export const ARROW_TAIL_WIDTH = 5;
export const COMPANION_ARROW_TAIL_WIDTH = 3.5;

FieldBoundaryNamespace.register("FieldBoundaryConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLAY_AREA_RIGHT_GUTTER,
  MODEL_HALF_WIDTH,
  MODEL_HALF_HEIGHT,
  DEFAULT_FIELD_MAGNITUDE,
  FIELD_MAGNITUDE_RANGE,
  DEFAULT_FIELD_ANGLE,
  MAX_FIELD_ANGLE,
  RELATIVE_PARAMETER_RANGE,
  DEFAULT_EPS1,
  DEFAULT_EPS2,
  DEFAULT_MU1,
  DEFAULT_MU2,
  FIELD_LINE_COUNT,
});
