/**
 * FieldBoundaryConstants.ts
 *
 * Named numeric constants for layout and the interface-field model.
 */

import { Range } from "scenerystack/dot";
import FieldBoundaryNamespace from "./FieldBoundaryNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/**
 * ScreenView.DEFAULT_LAYOUT_BOUNDS, duplicated as plain numbers so the model
 * space can be derived from it without importing the (DOM-heavy) joist module
 * into the model layer. `InterfaceScreenView` asserts the two agree.
 */
export const LAYOUT_WIDTH = 1024;
export const LAYOUT_HEIGHT = 618;

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Horizontal gap between the play area and the right-hand control column. */
export const PLAY_AREA_RIGHT_GUTTER = 280;

/** Vertical space reserved above the play area for the equation strip. */
export const PLAY_AREA_TOP_INSET = 48;

/** Play-area size in view pixels (drives the isotropic model-view transform). */
export const PLAY_AREA_WIDTH = LAYOUT_WIDTH - SCREEN_VIEW_MARGIN - PLAY_AREA_RIGHT_GUTTER;
export const PLAY_AREA_HEIGHT = LAYOUT_HEIGHT - 2 * SCREEN_VIEW_MARGIN - PLAY_AREA_TOP_INSET;

// ── Model space (arbitrary field units; ε₀ = μ₀ = 1) ───────────────────────────

/** Model x half-width of the play area. */
export const MODEL_HALF_WIDTH = 5;

/**
 * Model y extent of each medium away from the interface.
 *
 * Derived from the play-area aspect ratio so the model-view transform is
 * ISOTROPIC: px/unit is identical in x and y. Anything else draws every angle
 * compressed toward (or away from) the normal, so the arrows would disagree
 * with the θ readout and with the protractor. Do not hard-code this.
 */
export const MODEL_HALF_HEIGHT = (MODEL_HALF_WIDTH * PLAY_AREA_HEIGHT) / PLAY_AREA_WIDTH;

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

/**
 * Relative permittivity εᵣ range. Reaches conductor-like values so the
 * limiting case is inside the slider; the slider itself is logarithmic
 * (see LOG_SLIDER_DECADES) because the interesting behavior is at εᵣ ≲ 10.
 */
export const ELECTRIC_PARAMETER_RANGE = new Range(1, 1000);

/**
 * Relative permeability μᵣ range. Real magnetic materials span four decades
 * (ferrite ≈ 10³, iron ≈ 5×10³, mu-metal ≈ 2×10⁴), which is precisely why μ is
 * the interesting parameter — the range has to reach them.
 */
export const MAGNETIC_PARAMETER_RANGE = new Range(1, 20000);

/** Slider tick decades for the logarithmic εᵣ / μᵣ controls. */
export const LOG_SLIDER_DECADES = [1, 10, 100, 1000, 10000];

/**
 * A material contrast of this factor or more counts as a limiting case and
 * fires the transient callout naming what just happened.
 */
export const LIMITING_CASE_RATIO = 20;

/** How long a limiting-case callout stays on screen (ms). */
export const CALLOUT_DURATION_MS = 6000;

export const DEFAULT_EPS1 = 1;
export const DEFAULT_EPS2 = 4;
export const DEFAULT_MU1 = 1;
export const DEFAULT_MU2 = 4;

/** Default free surface charge density σ_f (no free charge). */
export const DEFAULT_SURFACE_CHARGE = 0;

/** Default free surface current density K_f (no free current). */
export const DEFAULT_SURFACE_CURRENT = 0;

/**
 * Free surface charge density σ_f slider range. Comparable to typical Dₙ
 * magnitudes so the discontinuity is visible; large positive σ_f can reverse
 * E₂ₙ (the medium-2 field then points away from medium 1).
 */
export const SURFACE_CHARGE_RANGE = new Range(-2, 2);

/**
 * Display scale for bound-source glyph density (|σ_b| or |K_b| mapped onto this
 * ceiling). Typical values for the default presets are O(1).
 */
export const BOUND_CHARGE_DISPLAY_MAX = 3;

/**
 * Free surface current density K_f slider range (K_f along +ẑ, out of page).
 * Comparable to typical Hₜ magnitudes so the tangential H jump is visible.
 */
export const SURFACE_CURRENT_RANGE = new Range(-2, 2);

/** Number of field lines drawn when the lattice toggle is on. */
export const FIELD_LINE_COUNT = 9;

/**
 * Companion (D / B) arrows are drawn no longer than this multiple of the
 * primary arrow, so large εᵣ / μᵣ stay on screen. The applied factor is shown
 * next to the companion label — an invisible rescale invites false
 * length comparisons.
 */
export const COMPANION_SCALE_HEADROOM = 1.15;

/** Polarization / magnetization arrows are scaled against the primary likewise. */
export const BOUND_SCALE_HEADROOM = 0.95;

// ── Gaussian pillbox / Amperian loop ──────────────────────────────────────────

/** Model width of the pillbox / loop (the "w" in σ_f·w and K_f·w). */
export const FLUX_BOX_WIDTH = 2.4;

/** Model half-height of the pillbox / loop; collapsible toward zero. */
export const FLUX_BOX_HALF_HEIGHT_RANGE = new Range(0.05, 1.6);

export const DEFAULT_FLUX_BOX_HALF_HEIGHT = 0.9;
export const DEFAULT_FLUX_BOX_CENTER_X = -1.6;

/** Arrow geometry (view pixels). */
export const ARROW_HEAD_WIDTH = 16;
export const ARROW_HEAD_HEIGHT = 14;
export const ARROW_TAIL_WIDTH = 5;
export const COMPANION_ARROW_TAIL_WIDTH = 3.5;

/**
 * Sideways separation between adjacent vector lanes (view pixels).
 *
 * E, D and P are collinear by construction, so drawn from a common anchor they
 * stack on one ray and the shortest disappears under the longest. Each is given
 * its own lane instead — see `view/vectorLanes.ts`. Wide enough to separate the
 * tails at a glance, narrow enough that the three still read as one direction.
 */
export const VECTOR_LANE_SPACING = 9;

FieldBoundaryNamespace.register("FieldBoundaryConstants", {
  LAYOUT_WIDTH,
  LAYOUT_HEIGHT,
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLAY_AREA_RIGHT_GUTTER,
  PLAY_AREA_TOP_INSET,
  PLAY_AREA_WIDTH,
  PLAY_AREA_HEIGHT,
  MODEL_HALF_WIDTH,
  MODEL_HALF_HEIGHT,
  DEFAULT_FIELD_MAGNITUDE,
  FIELD_MAGNITUDE_RANGE,
  DEFAULT_FIELD_ANGLE,
  MAX_FIELD_ANGLE,
  ELECTRIC_PARAMETER_RANGE,
  MAGNETIC_PARAMETER_RANGE,
  LOG_SLIDER_DECADES,
  LIMITING_CASE_RATIO,
  CALLOUT_DURATION_MS,
  DEFAULT_EPS1,
  DEFAULT_EPS2,
  DEFAULT_MU1,
  DEFAULT_MU2,
  DEFAULT_SURFACE_CHARGE,
  DEFAULT_SURFACE_CURRENT,
  SURFACE_CHARGE_RANGE,
  SURFACE_CURRENT_RANGE,
  BOUND_CHARGE_DISPLAY_MAX,
  FIELD_LINE_COUNT,
  COMPANION_SCALE_HEADROOM,
  BOUND_SCALE_HEADROOM,
  VECTOR_LANE_SPACING,
  FLUX_BOX_WIDTH,
  FLUX_BOX_HALF_HEIGHT_RANGE,
  DEFAULT_FLUX_BOX_HALF_HEIGHT,
  DEFAULT_FLUX_BOX_CENTER_X,
});
