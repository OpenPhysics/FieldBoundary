/**
 * FreeSourceOverlayNode.ts
 *
 * Visualizes free surface charge (σ_f) or free surface current (K_f) on the
 * interface.
 *
 *   Electric:  +  markers (red) for σ_f > 0,  −  markers (blue) for σ_f < 0.
 *   Magnetic:  ⊙  markers (out of page, +ẑ) for K_f > 0,
 *              ⊗  markers (into page, −ẑ) for K_f < 0.
 *
 * Marker count grows with |source|; nothing is drawn at zero. Glyph geometry is
 * shared with the bound-source layer via `interfaceMarkers`.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node } from "scenerystack/scenery";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { MODEL_HALF_WIDTH } from "../../FieldBoundaryConstants.js";
import { createChargeMarker, createCurrentMarker } from "./interfaceMarkers.js";

export type FreeSourceMode = "electric" | "magnetic";

const MAX_MARKERS = 9;

export class FreeSourceOverlayNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    mode: FreeSourceMode,
    sourceProperty: TReadOnlyProperty<number>,
    maxValue: number,
  ) {
    super({ pickable: false });

    const rebuild = (value: number): void => {
      this.children = [];
      const magnitude = Math.abs(value);
      if (magnitude < 1e-3) {
        return;
      }

      const positive = value > 0;
      const colorProperty =
        mode === "electric"
          ? positive
            ? FieldBoundaryColors.positiveChargeColorProperty
            : FieldBoundaryColors.negativeChargeColorProperty
          : FieldBoundaryColors.surfaceCurrentColorProperty;

      const count = Math.max(1, Math.min(MAX_MARKERS, Math.round((magnitude / maxValue) * MAX_MARKERS)));

      const xMin = -MODEL_HALF_WIDTH * 0.82;
      const xMax = MODEL_HALF_WIDTH * 0.82;
      const yView = modelViewTransform.modelToViewY(0);

      const markers: Node[] = [];
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const xModel = xMin + t * (xMax - xMin);
        const xView = modelViewTransform.modelToViewX(xModel);
        const marker =
          mode === "electric"
            ? createChargeMarker(positive, colorProperty)
            : createCurrentMarker(positive, colorProperty);
        marker.translate(xView, yView);
        markers.push(marker);
      }

      this.children = markers;
    };

    sourceProperty.link(rebuild);
  }
}
