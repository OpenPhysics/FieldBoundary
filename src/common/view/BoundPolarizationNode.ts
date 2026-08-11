/**
 * BoundPolarizationNode.ts
 *
 * Electric-only explanation layer: polarization arrows P₁ / P₂ and bound
 * surface-charge glyphs σ_b on the interface.
 *
 *   P = (εᵣ − 1) E   (vacuum ⇒ P = 0)
 *   σ_b = P₁ₙ − P₂ₙ  (n̂ from medium 2 → 1)
 *
 * Bound glyphs use hollow discs (vs solid free-charge discs) and sit slightly
 * above the interface so they remain distinct when σ_f is also nonzero.
 * Identity: E₁ₙ − E₂ₙ = σ_f − σ_b.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, type Color, Node, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  ARROW_HEAD_HEIGHT,
  ARROW_HEAD_WIDTH,
  BOUND_CHARGE_DISPLAY_MAX,
  COMPANION_ARROW_TAIL_WIDTH,
  MODEL_HALF_WIDTH,
} from "../../FieldBoundaryConstants.js";

const MAX_MARKERS = 9;
const MARKER_RADIUS = 10;
/** View-pixel offset of bound glyphs above the interface (away from free σ_f). */
const BOUND_GLYPH_Y_OFFSET = 16;

export class BoundPolarizationNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: Property<boolean>,
    p1Property: TReadOnlyProperty<Vector2>,
    p2Property: TReadOnlyProperty<Vector2>,
    boundChargeProperty: TReadOnlyProperty<number>,
    e1Property: TReadOnlyProperty<Vector2>,
    e2Property: TReadOnlyProperty<Vector2>,
    p1LabelProperty: TReadOnlyProperty<string>,
    p2LabelProperty: TReadOnlyProperty<string>,
    sigmaBLabelProperty: TReadOnlyProperty<string>,
  ) {
    super({ visibleProperty, pickable: false });

    const originView = modelViewTransform.modelToViewPosition(new Vector2(0, 0));

    const p1Arrow = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH - 4,
      headHeight: ARROW_HEAD_HEIGHT - 4,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: FieldBoundaryColors.polarizationColorProperty,
      lineWidth: 1.5,
      fill: FieldBoundaryColors.polarizationColorProperty,
      opacity: 0.9,
    });
    const p2Arrow = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH - 4,
      headHeight: ARROW_HEAD_HEIGHT - 4,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: FieldBoundaryColors.polarizationColorProperty,
      lineWidth: 1.5,
      fill: FieldBoundaryColors.polarizationColorProperty,
      opacity: 0.9,
    });

    const labelFont = new PhetFont({ size: 14, weight: "bold" });
    const p1Label = new Text(p1LabelProperty, {
      font: labelFont,
      fill: FieldBoundaryColors.polarizationColorProperty,
    });
    const p2Label = new Text(p2LabelProperty, {
      font: labelFont,
      fill: FieldBoundaryColors.polarizationColorProperty,
    });
    const sigmaLabel = new Text(sigmaBLabelProperty, {
      font: new PhetFont({ size: 13, weight: "bold" }),
      fill: FieldBoundaryColors.polarizationColorProperty,
    });

    const glyphLayer = new Node();
    this.children = [p1Arrow, p2Arrow, p1Label, p2Label, glyphLayer, sigmaLabel];

    const scaleP = (p1: Vector2, p2: Vector2, e1: Vector2, e2: Vector2): number => {
      const maxP = Math.max(p1.magnitude, p2.magnitude, 1e-6);
      const maxE = Math.max(e1.magnitude, e2.magnitude, 1e-6);
      return Math.min(1, (maxE * 0.95) / maxP);
    };

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

    const rebuildGlyphs = (sigmaB: number): void => {
      glyphLayer.children = [];
      const magnitude = Math.abs(sigmaB);
      if (magnitude < 1e-3) {
        sigmaLabel.visible = false;
        return;
      }

      const positive = sigmaB > 0;
      const colorProperty = positive
        ? FieldBoundaryColors.boundChargePositiveColorProperty
        : FieldBoundaryColors.boundChargeNegativeColorProperty;
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
        const marker = createBoundChargeMarker(positive, colorProperty);
        marker.translate(xView, yView);
        glyphLayer.addChild(marker);
      }

      sigmaLabel.visible = true;
      sigmaLabel.centerBottom = new Vector2(originView.x, yView - MARKER_RADIUS - 4);
    };

    Multilink.multilink(
      [p1Property, p2Property, boundChargeProperty, e1Property, e2Property],
      (p1, p2, sigmaB, e1, e2) => {
        const scale = scaleP(p1, p2, e1, e2);
        const sp1 = p1.timesScalar(scale);
        const sp2 = p2.timesScalar(scale);

        const hideP1 = sp1.magnitude < 1e-3;
        const hideP2 = sp2.magnitude < 1e-3;
        p1Arrow.visible = !hideP1;
        p1Label.visible = !hideP1;
        p2Arrow.visible = !hideP2;
        p2Label.visible = !hideP2;

        if (!hideP1) {
          const tip = setArrowMedium1(p1Arrow, sp1);
          p1Label.rightBottom = tip.plusXY(-10, -4);
        }
        if (!hideP2) {
          const tail = setArrowMedium2(p2Arrow, sp2);
          p2Label.rightTop = tail.plusXY(-10, 4);
        }

        rebuildGlyphs(sigmaB);
      },
    );
  }
}

function createBoundChargeMarker(positive: boolean, colorProperty: TReadOnlyProperty<Color>): Node {
  // Hollow disc: distinguishes bound σ_b from solid free σ_f markers.
  const backdrop = new Circle(MARKER_RADIUS, {
    fill: FieldBoundaryColors.panelBackgroundColorProperty,
    stroke: colorProperty,
    lineWidth: 2.5,
    lineDash: [4, 3],
    pickable: false,
  });
  const text = new Text(positive ? "+" : "−", {
    font: new PhetFont({ size: 18, weight: "bold" }),
    fill: colorProperty,
    pickable: false,
  });
  text.center = Vector2.ZERO;
  return new Node({ children: [backdrop, text], pickable: false });
}
