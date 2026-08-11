/**
 * AngleReadoutNode.ts
 *
 * θ₁ / θ₂ from the surface normal, plus the tanθ ratio check for E or H lines.
 */
import { DerivedProperty, Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { angleFromNormal } from "../model/interfaceFields.js";

export class AngleReadoutNode extends Node {
  public constructor(
    visibleProperty: Property<boolean>,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    ratioLabelProperty: TReadOnlyProperty<string>,
    parameterRatioProperty: TReadOnlyProperty<number>,
  ) {
    super({ visibleProperty });

    const font = new PhetFont(14);
    const theta1Text = new Text("", { font, fill: FieldBoundaryColors.textColorProperty });
    const theta2Text = new Text("", { font, fill: FieldBoundaryColors.textColorProperty });
    const ratioText = new Text("", { font, fill: FieldBoundaryColors.accentColorProperty });

    this.addChild(
      new VBox({
        spacing: 4,
        align: "left",
        children: [theta1Text, theta2Text, ratioText],
      }),
    );

    const formatDeg = (rad: number): string => `${((rad * 180) / Math.PI).toFixed(1)}°`;

    Multilink.multilink(
      [primary1Property, primary2Property, parameterRatioProperty, ratioLabelProperty],
      (p1, p2, paramRatio, ratioLabel) => {
        const t1 = angleFromNormal(p1);
        const t2 = angleFromNormal(p2);
        theta1Text.string = `θ₁ = ${formatDeg(t1)}`;
        theta2Text.string = `θ₂ = ${formatDeg(t2)}`;
        const tan1 = Math.tan(t1);
        const tan2 = Math.tan(t2);
        const tanRatio = Math.abs(tan1) < 1e-6 ? Number.POSITIVE_INFINITY : tan2 / tan1;
        ratioText.string = `${ratioLabel}: ${tanRatio.toFixed(2)}  (param ${paramRatio.toFixed(2)})`;
      },
    );
  }
}

/** ε₂/ε₁ or μ₂/μ₁ as a DerivedProperty helper for the readout. */
export function createParameterRatioProperty(
  p1: TReadOnlyProperty<number>,
  p2: TReadOnlyProperty<number>,
): TReadOnlyProperty<number> {
  return new DerivedProperty([p1, p2], (a, b) => b / a);
}
