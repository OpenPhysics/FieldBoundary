/**
 * currentDetails.ts
 *
 * Builds the "current details" region of the screen summary from live model
 * state. Without this a non-visual student hears what the controls do but
 * nothing about the fields — not the angles, not which component is continuous,
 * not that a jump appeared when they moved the σ_f slider. The entire
 * conceptual payload of the sim is in these sentences.
 *
 * Electric and Magnetic get separate builders because the conditional sentence
 * is a different one on each screen (σ_f breaks Dₙ; K_f breaks Hₜ), and a merged
 * builder would need string keys that are dead on one screen.
 */
import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { angleFromNormal } from "../model/interfaceFields.js";

/** Below this a source or bound density counts as zero for description purposes. */
const NEGLIGIBLE = 5e-3;

export type ElectricDetailsStrings = {
  /** "{{theta1}} … {{theta2}}" */
  angles: TReadOnlyProperty<string>;
  /** "{{param1}} … {{param2}}" */
  materials: TReadOnlyProperty<string>;
  tangentialContinuous: TReadOnlyProperty<string>;
  /** σ_f = 0 ⇒ Dₙ continuous. */
  normalCompanionContinuous: TReadOnlyProperty<string>;
  /** "{{value}}" — σ_f ≠ 0 ⇒ Dₙ jumps. */
  normalCompanionJump: TReadOnlyProperty<string>;
  /** "{{ratio}}" */
  normalRatio: TReadOnlyProperty<string>;
  normalReversed: TReadOnlyProperty<string>;
  /** "{{value}}" */
  boundCharge: TReadOnlyProperty<string>;
};

export type MagneticDetailsStrings = {
  angles: TReadOnlyProperty<string>;
  materials: TReadOnlyProperty<string>;
  /** K_f = 0 ⇒ Hₜ continuous. */
  tangentialContinuous: TReadOnlyProperty<string>;
  /** "{{value}}" — K_f ≠ 0 ⇒ Hₜ jumps. */
  tangentialJump: TReadOnlyProperty<string>;
  normalCompanionContinuous: TReadOnlyProperty<string>;
  /** "{{ratio}}" */
  normalRatio: TReadOnlyProperty<string>;
  tangentialReversed: TReadOnlyProperty<string>;
  /** "{{value}}" */
  boundCurrent: TReadOnlyProperty<string>;
};

const deg = (field: Vector2): string => ((angleFromNormal(field) * 180) / Math.PI).toFixed(1);
const num = (value: number): string => (Math.abs(value) < NEGLIGIBLE ? 0 : value).toFixed(2);

export function createElectricDetailsProperty(
  e1Property: TReadOnlyProperty<Vector2>,
  e2Property: TReadOnlyProperty<Vector2>,
  eps1Property: TReadOnlyProperty<number>,
  eps2Property: TReadOnlyProperty<number>,
  surfaceChargeProperty: TReadOnlyProperty<number>,
  boundChargeProperty: TReadOnlyProperty<number>,
  strings: ElectricDetailsStrings,
): TReadOnlyProperty<string> {
  return new DerivedProperty(
    [
      e1Property,
      e2Property,
      eps1Property,
      eps2Property,
      surfaceChargeProperty,
      boundChargeProperty,
      strings.angles,
      strings.materials,
      strings.tangentialContinuous,
      strings.normalCompanionContinuous,
      strings.normalCompanionJump,
      strings.normalRatio,
      strings.normalReversed,
      strings.boundCharge,
    ],
    (
      e1,
      e2,
      eps1,
      eps2,
      sigmaF,
      sigmaB,
      anglesPattern,
      materialsPattern,
      tangentialContinuous,
      companionContinuous,
      companionJump,
      normalRatioPattern,
      normalReversed,
      boundPattern,
    ) => {
      const sentences = [
        StringUtils.fillIn(anglesPattern, { theta1: deg(e1), theta2: deg(e2) }),
        StringUtils.fillIn(materialsPattern, { param1: num(eps1), param2: num(eps2) }),
        tangentialContinuous,
        Math.abs(sigmaF) < NEGLIGIBLE ? companionContinuous : StringUtils.fillIn(companionJump, { value: num(sigmaF) }),
        // A large positive σ_f can flip E₂ₙ so the medium-2 field points away
        // from the interface — a striking moment that must not pass in silence.
        e2.y < 0 ? normalReversed : StringUtils.fillIn(normalRatioPattern, { ratio: num(e2.y / e1.y) }),
      ];
      if (Math.abs(sigmaB) >= NEGLIGIBLE) {
        sentences.push(StringUtils.fillIn(boundPattern, { value: num(sigmaB) }));
      }
      return sentences.join(" ");
    },
  );
}

export function createMagneticDetailsProperty(
  h1Property: TReadOnlyProperty<Vector2>,
  h2Property: TReadOnlyProperty<Vector2>,
  mu1Property: TReadOnlyProperty<number>,
  mu2Property: TReadOnlyProperty<number>,
  surfaceCurrentProperty: TReadOnlyProperty<number>,
  boundCurrentProperty: TReadOnlyProperty<number>,
  strings: MagneticDetailsStrings,
): TReadOnlyProperty<string> {
  return new DerivedProperty(
    [
      h1Property,
      h2Property,
      mu1Property,
      mu2Property,
      surfaceCurrentProperty,
      boundCurrentProperty,
      strings.angles,
      strings.materials,
      strings.tangentialContinuous,
      strings.tangentialJump,
      strings.normalCompanionContinuous,
      strings.normalRatio,
      strings.tangentialReversed,
      strings.boundCurrent,
    ],
    (
      h1,
      h2,
      mu1,
      mu2,
      kF,
      kB,
      anglesPattern,
      materialsPattern,
      tangentialContinuous,
      tangentialJump,
      companionContinuous,
      normalRatioPattern,
      tangentialReversed,
      boundPattern,
    ) => {
      const sentences = [
        StringUtils.fillIn(anglesPattern, { theta1: deg(h1), theta2: deg(h2) }),
        StringUtils.fillIn(materialsPattern, { param1: num(mu1), param2: num(mu2) }),
        Math.abs(kF) < NEGLIGIBLE ? tangentialContinuous : StringUtils.fillIn(tangentialJump, { value: num(kF) }),
        companionContinuous,
        StringUtils.fillIn(normalRatioPattern, { ratio: num(h2.y / h1.y) }),
      ];
      // K_f large enough to flip H₂ₜ reverses the tangential field in medium 2.
      if (isTangentialReversed(h1, h2)) {
        sentences.push(tangentialReversed);
      }
      if (Math.abs(kB) >= NEGLIGIBLE) {
        sentences.push(StringUtils.fillIn(boundPattern, { value: num(kB) }));
      }
      return sentences.join(" ");
    },
  );
}

/** True when E₂ₙ points away from medium 1 (only possible with σ_f ≠ 0). */
export function isNormalReversed(e2: Vector2): boolean {
  return e2.y < 0;
}

/** True when H₂ₜ opposes H₁ₜ (only possible with K_f ≠ 0). */
export function isTangentialReversed(h1: Vector2, h2: Vector2): boolean {
  return Math.abs(h1.x) >= NEGLIGIBLE && Math.abs(h2.x) >= NEGLIGIBLE && Math.sign(h1.x) !== Math.sign(h2.x);
}
