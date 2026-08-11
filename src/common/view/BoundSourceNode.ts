/**
 * BoundSourceNode.ts
 *
 * The explanation layer: it answers *why* a component jumps, rather than only
 * showing *that* it does. One implementation covers both screens, because the
 * two cases are exact duals:
 *
 *   Electric   P = (εᵣ − 1) E      σ_b = P₁ₙ − P₂ₙ      E₁ₙ − E₂ₙ = σ_f − σ_b
 *   Magnetic   M = (μᵣ − 1) H      K_b = M₂ₜ − M₁ₜ      B₂ₜ − B₁ₜ = K_f + K_b
 *
 * Bound glyphs use hollow dashed discs (vs solid free-source discs) and sit
 * slightly above the interface so they stay distinct when σ_f / K_f is also
 * nonzero.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  ARROW_HEAD_HEIGHT,
  ARROW_HEAD_WIDTH,
  BOUND_CHARGE_DISPLAY_MAX,
  BOUND_SCALE_HEADROOM,
  COMPANION_ARROW_TAIL_WIDTH,
  MODEL_HALF_WIDTH,
} from "../../FieldBoundaryConstants.js";
import { displayScale, formatScaleBadge } from "./displayScale.js";
import { createChargeMarker, createCurrentMarker, MARKER_RADIUS } from "./interfaceMarkers.js";

const MAX_MARKERS = 9;
/** View-pixel offset of bound glyphs above the interface (away from the free source). */
const BOUND_GLYPH_Y_OFFSET = 16;

export type BoundSourceMode = "electric" | "magnetic";

export type BoundSourceNodeOptions = {
  mode: BoundSourceMode;
  visibleProperty: Property<boolean>;
  /** P (electric) or M (magnetic) in each medium. */
  bound1Property: TReadOnlyProperty<Vector2>;
  bound2Property: TReadOnlyProperty<Vector2>;
  /** σ_b (electric) or K_b (magnetic). */
  boundSourceProperty: TReadOnlyProperty<number>;
  primary1Property: TReadOnlyProperty<Vector2>;
  primary2Property: TReadOnlyProperty<Vector2>;
  label1Property: TReadOnlyProperty<string>;
  label2Property: TReadOnlyProperty<string>;
  sourceLabelProperty: TReadOnlyProperty<string>;
};

export class BoundSourceNode extends Node {
  public constructor(modelViewTransform: ModelViewTransform2, options: BoundSourceNodeOptions) {
    super({ visibleProperty: options.visibleProperty, pickable: false });

    const originView = modelViewTransform.modelToViewPosition(new Vector2(0, 0));

    const arrowOptions = {
      headWidth: ARROW_HEAD_WIDTH - 4,
      headHeight: ARROW_HEAD_HEIGHT - 4,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: FieldBoundaryColors.polarizationColorProperty,
      lineWidth: 1.5,
      fill: FieldBoundaryColors.polarizationColorProperty,
      opacity: 0.9,
    };
    const arrow1 = new ArrowNode(0, 0, 0, 0, arrowOptions);
    const arrow2 = new ArrowNode(0, 0, 0, 0, arrowOptions);

    const labelFont = new PhetFont({ size: 14, weight: "bold" });
    const label1 = new Text(options.label1Property, {
      font: labelFont,
      fill: FieldBoundaryColors.polarizationColorProperty,
    });
    const label2 = new Text(options.label2Property, {
      font: labelFont,
      fill: FieldBoundaryColors.polarizationColorProperty,
    });
    const scaleBadge = new Text("", {
      font: new PhetFont(11),
      fill: FieldBoundaryColors.polarizationColorProperty,
    });
    const sourceLabel = new Text(options.sourceLabelProperty, {
      font: new PhetFont({ size: 13, weight: "bold" }),
      fill: FieldBoundaryColors.polarizationColorProperty,
    });

    const glyphLayer = new Node();
    this.children = [arrow1, arrow2, label1, label2, scaleBadge, glyphLayer, sourceLabel];

    const setArrowMedium1 = (arrow: ArrowNode, physicsTip: Vector2): Vector2 => {
      const tipView = modelViewTransform.modelToViewPosition(physicsTip);
      arrow.setTailAndTip(originView.x, originView.y, tipView.x, tipView.y);
      return tipView;
    };

    const setArrowMedium2 = (arrow: ArrowNode, physics: Vector2): Vector2 => {
      const tailView = modelViewTransform.modelToViewPosition(physics.timesScalar(-1));
      arrow.setTailAndTip(tailView.x, tailView.y, originView.x, originView.y);
      return tailView;
    };

    const positiveColorProperty =
      options.mode === "electric"
        ? FieldBoundaryColors.boundChargePositiveColorProperty
        : FieldBoundaryColors.boundCurrentColorProperty;

    const rebuildGlyphs = (boundSource: number): void => {
      glyphLayer.children = [];
      const magnitude = Math.abs(boundSource);
      if (magnitude < 1e-3) {
        sourceLabel.visible = false;
        return;
      }

      const positive = boundSource > 0;
      const colorProperty =
        options.mode === "electric"
          ? positive
            ? FieldBoundaryColors.boundChargePositiveColorProperty
            : FieldBoundaryColors.boundChargeNegativeColorProperty
          : positiveColorProperty;
      const count = Math.max(
        1,
        Math.min(MAX_MARKERS, Math.round((magnitude / BOUND_CHARGE_DISPLAY_MAX) * MAX_MARKERS)),
      );

      const xMin = -MODEL_HALF_WIDTH * 0.82;
      const xMax = MODEL_HALF_WIDTH * 0.82;
      const yView = originView.y - BOUND_GLYPH_Y_OFFSET;

      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const xView = modelViewTransform.modelToViewX(xMin + t * (xMax - xMin));
        const marker =
          options.mode === "electric"
            ? createChargeMarker(positive, colorProperty, "bound")
            : createCurrentMarker(positive, colorProperty, "bound");
        marker.translate(xView, yView);
        glyphLayer.addChild(marker);
      }

      sourceLabel.visible = true;
      sourceLabel.centerBottom = new Vector2(originView.x, yView - MARKER_RADIUS - 4);
    };

    Multilink.multilink(
      [
        options.bound1Property,
        options.bound2Property,
        options.boundSourceProperty,
        options.primary1Property,
        options.primary2Property,
      ],
      (bound1, bound2, boundSource, primary1, primary2) => {
        const scale = displayScale([bound1, bound2], [primary1, primary2], BOUND_SCALE_HEADROOM);
        const scaled1 = bound1.timesScalar(scale);
        const scaled2 = bound2.timesScalar(scale);

        const hide1 = scaled1.magnitude < 1e-3;
        const hide2 = scaled2.magnitude < 1e-3;
        arrow1.visible = !hide1;
        label1.visible = !hide1;
        arrow2.visible = !hide2;
        label2.visible = !hide2;

        if (!hide1) {
          const tip = setArrowMedium1(arrow1, scaled1);
          label1.rightBottom = tip.plusXY(-10, -4);
          scaleBadge.string = formatScaleBadge(scale);
          scaleBadge.visible = scaleBadge.string.length > 0;
          scaleBadge.rightTop = label1.rightBottom.plusXY(0, 1);
        } else {
          scaleBadge.visible = false;
        }
        if (!hide2) {
          const tail = setArrowMedium2(arrow2, scaled2);
          label2.rightTop = tail.plusXY(-10, 4);
        }

        rebuildGlyphs(boundSource);
      },
    );
  }
}
