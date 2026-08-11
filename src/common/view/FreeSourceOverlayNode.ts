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
 * Each marker sits on an opaque disc so the dashed interface stroke does not
 * show through. Marker count grows with |source|; nothing is drawn at zero.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, type Color, Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { MODEL_HALF_WIDTH } from "../../FieldBoundaryConstants.js";

export type FreeSourceMode = "electric" | "magnetic";

const MAX_MARKERS = 9;
const MARKER_RADIUS = 11;

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
            ? this.createChargeMarker(positive, colorProperty)
            : this.createCurrentMarker(positive, colorProperty);
        marker.translate(xView, yView);
        markers.push(marker);
      }

      this.children = markers;
    };

    sourceProperty.link(rebuild);
  }

  /** Opaque disc that masks the dashed interface under the glyph. */
  private createBackdrop(): Circle {
    return new Circle(MARKER_RADIUS, {
      fill: FieldBoundaryColors.panelBackgroundColorProperty,
      stroke: FieldBoundaryColors.panelBorderColorProperty,
      lineWidth: 1,
      pickable: false,
    });
  }

  private createChargeMarker(positive: boolean, colorProperty: TReadOnlyProperty<Color>): Node {
    const symbol = positive ? "+" : "−";
    const text = new Text(symbol, {
      font: new PhetFont({ size: 22, weight: "bold" }),
      fill: colorProperty,
      pickable: false,
    });
    text.center = Vector2.ZERO;
    return new Node({ children: [this.createBackdrop(), text], pickable: false });
  }

  /**
   * ⊙ for current out of page (+ẑ): circle outline with a filled center dot.
   * ⊗ for current into page (−ẑ): circle outline with a cross.
   */
  private createCurrentMarker(positive: boolean, colorProperty: TReadOnlyProperty<Color>): Node {
    const radius = MARKER_RADIUS - 2;
    const ring = new Circle(radius, {
      stroke: colorProperty,
      lineWidth: 2.5,
      pickable: false,
    });

    let inner: Node;
    if (positive) {
      inner = new Circle(2.6, { fill: colorProperty, pickable: false });
    } else {
      const d = radius * 0.55;
      inner = new Node({
        children: [
          new Line(-d, -d, d, d, { stroke: colorProperty, lineWidth: 2.5, pickable: false }),
          new Line(-d, d, d, -d, { stroke: colorProperty, lineWidth: 2.5, pickable: false }),
        ],
      });
    }

    return new Node({ children: [this.createBackdrop(), ring, inner], pickable: false });
  }
}
