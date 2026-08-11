/**
 * AngleReadoutNode.ts
 *
 * θ₁ / θ₂ from the surface normal, plus the tanθ ratio check for E or H lines.
 *
 * The ratio row is a predicted-vs-measured comparison, not debug output: the
 * measured tanθ₂/tanθ₁ sits next to the material ratio ε₂/ε₁ (or μ₂/μ₁) that
 * the source-free BC predicts, with a match indicator.
 *
 * Two cases the readout must not lie about:
 *   • θ₁ ≈ 0 — the ratio is 0/0, so it shows "—" rather than "Infinity".
 *   • a free source present — the identity simply stops holding, so the row is
 *     dimmed and says so instead of looking like a law that just failed.
 */
import { DerivedProperty, Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { angleFromNormal } from "../model/interfaceFields.js";

/** Below this |tanθ₁| the ratio is numerically meaningless. */
const MIN_TAN = 1e-3;
/** Relative agreement counted as "matches the prediction". */
const MATCH_TOLERANCE = 0.02;

export type AngleReadoutStrings = {
  /** e.g. "tanθ₂/tanθ₁" */
  ratioLabel: TReadOnlyProperty<string>;
  /** e.g. "predicted ε₂/ε₁ = {{value}}" */
  predictedPattern: TReadOnlyProperty<string>;
  /** e.g. "tanθ ratio is not ε₂/ε₁ while σ_f ≠ 0" */
  sourcedNote: TReadOnlyProperty<string>;
  /** e.g. "θ₁ = {{theta1}} from the normal; θ₂ = {{theta2}}." */
  accessiblePattern: TReadOnlyProperty<string>;
};

export class AngleReadoutNode extends Node {
  public constructor(
    visibleProperty: Property<boolean>,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    parameterRatioProperty: TReadOnlyProperty<number>,
    freeSourceProperty: TReadOnlyProperty<number>,
    strings: AngleReadoutStrings,
  ) {
    super({ visibleProperty, tagName: "div" });

    const font = new PhetFont(14);
    const theta1Text = new Text("", { font, fill: FieldBoundaryColors.textColorProperty });
    const theta2Text = new Text("", { font, fill: FieldBoundaryColors.textColorProperty });
    const ratioText = new Text("", { font, fill: FieldBoundaryColors.accentColorProperty });
    const predictedText = new Text("", { font: new PhetFont(12), fill: FieldBoundaryColors.textColorProperty });

    this.addChild(
      new VBox({
        spacing: 4,
        align: "left",
        children: [theta1Text, theta2Text, ratioText, predictedText],
      }),
    );

    const formatDeg = (rad: number): string => ((rad * 180) / Math.PI).toFixed(1);

    Multilink.multilink(
      [
        primary1Property,
        primary2Property,
        parameterRatioProperty,
        freeSourceProperty,
        strings.ratioLabel,
        strings.predictedPattern,
        strings.sourcedNote,
        strings.accessiblePattern,
      ],
      (p1, p2, paramRatio, freeSource, ratioLabel, predictedPattern, sourcedNote, accessiblePattern) => {
        const t1 = angleFromNormal(p1);
        const t2 = angleFromNormal(p2);
        // "°" reads well on screen but is announced inconsistently, so the
        // accessible pattern spells out "degrees" around the bare number.
        const theta1String = formatDeg(t1);
        const theta2String = formatDeg(t2);
        theta1Text.string = `θ₁ = ${theta1String}°`;
        theta2Text.string = `θ₂ = ${theta2String}°`;

        const tan1 = Math.tan(t1);
        const tan2 = Math.tan(t2);
        const sourced = Math.abs(freeSource) >= 1e-9;
        // Normal incidence: both tangents vanish, so the ratio is 0/0.
        const defined = Math.abs(tan1) >= MIN_TAN;
        const tanRatio = defined ? tan2 / tan1 : Number.NaN;

        ratioText.string = `${ratioLabel} = ${defined ? tanRatio.toFixed(2) : "—"}`;

        if (sourced) {
          // The identity holds only for σ_f = K_f = 0; say that rather than
          // showing a mismatch that reads as a broken law.
          predictedText.string = sourcedNote;
          predictedText.fill = FieldBoundaryColors.freeComponentColorProperty;
          ratioText.fill = FieldBoundaryColors.freeComponentColorProperty;
        } else {
          const matches = defined && Math.abs(tanRatio - paramRatio) <= MATCH_TOLERANCE * Math.abs(paramRatio);
          predictedText.string =
            StringUtils.fillIn(predictedPattern, { value: paramRatio.toFixed(2) }) + (matches ? "  ✓" : "");
          predictedText.fill = FieldBoundaryColors.textColorProperty;
          ratioText.fill = FieldBoundaryColors.accentColorProperty;
        }

        this.accessibleParagraph = `${StringUtils.fillIn(accessiblePattern, {
          theta1: theta1String,
          theta2: theta2String,
        })} ${ratioText.string}. ${predictedText.string}`;
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
