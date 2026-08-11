/**
 * ComponentOverlayNode.ts
 *
 * Dashed Et / En projections for primary fields in both media. Continuous
 * components are highlighted; free components stay muted.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { medium2DisplayVector } from "../model/interfaceFields.js";

export type ComponentOverlayMode = "electric" | "magnetic";

/**
 * Electric: Et continuous, En free (Dn continuous shown via companion elsewhere).
 * Magnetic: Ht continuous, Hn free (Bn continuous).
 * We draw the primary-field components and emphasize the continuous tangential one,
 * plus a second pair for the companion's continuous normal.
 */
export class ComponentOverlayNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: Property<boolean>,
    mode: ComponentOverlayMode,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    companion1Property: TReadOnlyProperty<Vector2>,
    companion2Property: TReadOnlyProperty<Vector2>,
  ) {
    super({ visibleProperty });

    const origin = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    const font = new PhetFont(13);

    const makeLine = (highlight: boolean): Line =>
      new Line(0, 0, 0, 0, {
        stroke: highlight
          ? FieldBoundaryColors.continuousComponentColorProperty
          : FieldBoundaryColors.freeComponentColorProperty,
        lineWidth: highlight ? 2.5 : 1.5,
        lineDash: [7, 5],
      });

    // Primary tangential (continuous for E and H)
    const p1t = makeLine(true);
    const p2t = makeLine(true);
    // Primary normal (discontinuous for E and H)
    const p1n = makeLine(false);
    const p2n = makeLine(false);
    // Companion normal (continuous for D and B)
    const c1n = makeLine(true);
    const c2n = makeLine(true);
    // Companion tangential (discontinuous for D and B)
    const c1t = makeLine(false);
    const c2t = makeLine(false);

    const etLabel = new Text(mode === "electric" ? "Eₜ" : "Hₜ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });
    const dnLabel = new Text(mode === "electric" ? "Dₙ" : "Bₙ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });

    this.children = [p1t, p2t, p1n, p2n, c1n, c2n, c1t, c2t, etLabel, dnLabel];

    const setSeg = (line: Line, tipModel: Vector2, axis: "t" | "n", medium2: boolean): void => {
      const display = medium2 ? medium2DisplayVector(tipModel) : tipModel;
      const tip = modelViewTransform.modelToViewPosition(display);
      if (axis === "t") {
        line.setPoint1(origin.x, origin.y);
        line.setPoint2(tip.x, origin.y);
      } else {
        line.setPoint1(origin.x, origin.y);
        line.setPoint2(origin.x, tip.y);
      }
    };

    const companionScale = (c1: Vector2, c2: Vector2, p1: Vector2, p2: Vector2): number => {
      const maxLen = Math.max(c1.magnitude, c2.magnitude, 1e-6);
      const primaryMax = Math.max(p1.magnitude, p2.magnitude, 1e-6);
      return Math.min(1, (primaryMax * 1.15) / maxLen);
    };

    Multilink.multilink(
      [primary1Property, primary2Property, companion1Property, companion2Property],
      (p1, p2, c1, c2) => {
        const scale = companionScale(c1, c2, p1, p2);
        setSeg(p1t, new Vector2(p1.x, 0), "t", false);
        setSeg(p2t, new Vector2(p2.x, 0), "t", true);
        setSeg(p1n, new Vector2(0, p1.y), "n", false);
        setSeg(p2n, new Vector2(0, p2.y), "n", true);

        const sc1 = c1.timesScalar(scale);
        const sc2 = c2.timesScalar(scale);
        setSeg(c1t, new Vector2(sc1.x, 0), "t", false);
        setSeg(c2t, new Vector2(sc2.x, 0), "t", true);
        setSeg(c1n, new Vector2(0, sc1.y), "n", false);
        setSeg(c2n, new Vector2(0, sc2.y), "n", true);

        const etTip = modelViewTransform.modelToViewPosition(new Vector2(p1.x, 0));
        etLabel.centerBottom = etTip.plusXY(0, -6);
        const dnTip = modelViewTransform.modelToViewPosition(new Vector2(0, sc1.y));
        dnLabel.rightCenter = dnTip.plusXY(-8, 0);
      },
    );
  }
}
