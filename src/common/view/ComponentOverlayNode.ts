/**
 * ComponentOverlayNode.ts
 *
 * Dashed Et / En projections for primary fields in both media. Continuous
 * components are highlighted; free components stay muted.
 *
 * Which components stay continuous depends on the free source:
 *   Electric (σ_f): Eₜ always continuous; Dₙ continuous only when σ_f = 0.
 *   Magnetic (K_f): Bₙ always continuous; Hₜ continuous only when K_f = 0.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { COMPANION_SCALE_HEADROOM } from "../../FieldBoundaryConstants.js";
import { medium2DisplayVector } from "../model/interfaceFields.js";
import { displayScale } from "./displayScale.js";

export type ComponentOverlayMode = "electric" | "magnetic";

export class ComponentOverlayNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: Property<boolean>,
    mode: ComponentOverlayMode,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    companion1Property: TReadOnlyProperty<Vector2>,
    companion2Property: TReadOnlyProperty<Vector2>,
    freeSourceProperty: TReadOnlyProperty<number>,
  ) {
    super({ visibleProperty });

    const origin = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    const font = new PhetFont(13);

    const makeLine = (): Line =>
      new Line(0, 0, 0, 0, {
        stroke: FieldBoundaryColors.freeComponentColorProperty,
        lineWidth: 1.5,
        lineDash: [7, 5],
      });

    // Primary tangential (Eₜ always continuous; Hₜ only when K_f = 0)
    const p1t = makeLine();
    const p2t = makeLine();
    // Primary normal (discontinuous for E and H)
    const p1n = makeLine();
    const p2n = makeLine();
    // Companion normal (Bₙ always continuous; Dₙ only when σ_f = 0)
    const c1n = makeLine();
    const c2n = makeLine();
    // Companion tangential (discontinuous for D and B)
    const c1t = makeLine();
    const c2t = makeLine();

    const etLabel = new Text(mode === "electric" ? "Eₜ" : "Hₜ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });
    const dnLabel = new Text(mode === "electric" ? "Dₙ" : "Bₙ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });

    this.children = [p1t, p2t, p1n, p2n, c1n, c2n, c1t, c2t, etLabel, dnLabel];

    const applyHighlight = (line: Line, highlight: boolean): void => {
      line.stroke = highlight
        ? FieldBoundaryColors.continuousComponentColorProperty
        : FieldBoundaryColors.freeComponentColorProperty;
      line.lineWidth = highlight ? 2.5 : 1.5;
    };

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

    Multilink.multilink(
      [primary1Property, primary2Property, companion1Property, companion2Property, freeSourceProperty],
      (p1, p2, c1, c2, freeSource) => {
        const eMode = mode === "electric";
        const sourced = Math.abs(freeSource) >= 1e-9;
        const tangentialContinuous = eMode || !sourced;
        const normalCompanionContinuous = !(eMode && sourced);

        const scale = displayScale([c1, c2], [p1, p2], COMPANION_SCALE_HEADROOM);
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

        applyHighlight(p1t, tangentialContinuous);
        applyHighlight(p2t, tangentialContinuous);
        applyHighlight(p1n, false);
        applyHighlight(p2n, false);
        applyHighlight(c1n, normalCompanionContinuous);
        applyHighlight(c2n, normalCompanionContinuous);
        applyHighlight(c1t, false);
        applyHighlight(c2t, false);

        etLabel.fill = tangentialContinuous
          ? FieldBoundaryColors.continuousComponentColorProperty
          : FieldBoundaryColors.freeComponentColorProperty;
        dnLabel.fill = normalCompanionContinuous
          ? FieldBoundaryColors.continuousComponentColorProperty
          : FieldBoundaryColors.freeComponentColorProperty;

        const etTip = modelViewTransform.modelToViewPosition(new Vector2(p1.x, 0));
        etLabel.centerBottom = etTip.plusXY(0, -6);
        const dnTip = modelViewTransform.modelToViewPosition(new Vector2(0, sc1.y));
        dnLabel.rightCenter = dnTip.plusXY(-8, 0);
      },
    );
  }
}
