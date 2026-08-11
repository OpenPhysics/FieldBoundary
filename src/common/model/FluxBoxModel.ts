/**
 * FluxBoxModel.ts
 *
 * State for the Gaussian pillbox (Electric) / Amperian loop (Magnetic) tool:
 * a rectangle straddling the interface that the student can slide along the
 * boundary and collapse toward zero height.
 *
 * Collapsing it is the point: the side-face contributions are proportional to
 * the half-height, so as h → 0 they visibly vanish and ∮D·dA = Q_f,enc reduces
 * to the boundary condition instead of being asserted by the equation strip.
 */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import {
  DEFAULT_FLUX_BOX_CENTER_X,
  DEFAULT_FLUX_BOX_HALF_HEIGHT,
  FLUX_BOX_HALF_HEIGHT_RANGE,
  FLUX_BOX_WIDTH,
  MODEL_HALF_WIDTH,
} from "../../FieldBoundaryConstants.js";

/** Model x range the box center may occupy (kept fully inside the play area). */
export const FLUX_BOX_CENTER_X_RANGE = new Range(
  -MODEL_HALF_WIDTH + FLUX_BOX_WIDTH / 2,
  MODEL_HALF_WIDTH - FLUX_BOX_WIDTH / 2,
);

export class FluxBoxModel {
  public readonly showProperty = new BooleanProperty(false);

  /** Center of the box along the interface (model x). */
  public readonly centerXProperty = new NumberProperty(DEFAULT_FLUX_BOX_CENTER_X, {
    range: FLUX_BOX_CENTER_X_RANGE,
  });

  /** Half-height of the box; the collapsible dimension. */
  public readonly halfHeightProperty = new NumberProperty(DEFAULT_FLUX_BOX_HALF_HEIGHT, {
    range: FLUX_BOX_HALF_HEIGHT_RANGE,
  });

  /** Fixed width — the "w" in Q_f,enc = σ_f·w and I_f,enc = K_f·w. */
  public readonly width = FLUX_BOX_WIDTH;

  public reset(): void {
    this.showProperty.reset();
    this.centerXProperty.reset();
    this.halfHeightProperty.reset();
  }

  public dispose(): void {
    this.showProperty.dispose();
    this.centerXProperty.dispose();
    this.halfHeightProperty.dispose();
  }
}
