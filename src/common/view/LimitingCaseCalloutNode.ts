/**
 * LimitingCaseCalloutNode.ts
 *
 * Names the phenomenon at the moment the student produces it.
 *
 * The extreme regimes are already reachable — they are just unsignposted, so a
 * student who drags εᵣ to 1000 sees a dramatic picture with nothing telling them
 * what it is. This watches the material ratio and, on entering a regime, shows a
 * short caption near the interface for a few seconds.
 *
 * Note the captions describe what this sim's parameterization actually does.
 * With E₁ set by the user, εᵣ₂ ≫ εᵣ₁ drives E₂ₙ → 0 with E₂ₜ = E₁ₜ, so the field
 * in medium 2 turns *toward the interface* (θ₂ → 90°) — it is not the
 * "field enters a conductor normally" picture, which is driven from the other
 * side.
 */
import { Multilink, stepTimer, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { Node, Rectangle, RichText } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { CALLOUT_DURATION_MS, LIMITING_CASE_RATIO } from "../../FieldBoundaryConstants.js";

/** Which regime the material ratio is currently in. */
export type LimitingCase = "none" | "medium2Dominant" | "medium1Dominant" | "matched";

export type LimitingCaseCalloutStrings = {
  /** ε₂ ≫ ε₁ / μ₂ ≫ μ₁. */
  medium2Dominant: TReadOnlyProperty<string>;
  /** ε₁ ≫ ε₂ / μ₁ ≫ μ₂. */
  medium1Dominant: TReadOnlyProperty<string>;
  /** ε₁ = ε₂ — no kink at all. */
  matched: TReadOnlyProperty<string>;
};

/** Classify a material ratio (param2 / param1) into a named regime. */
export function classifyLimitingCase(param1: number, param2: number): LimitingCase {
  const ratio = param2 / param1;
  if (Math.abs(ratio - 1) < 1e-6) {
    return "matched";
  }
  if (ratio >= LIMITING_CASE_RATIO) {
    return "medium2Dominant";
  }
  if (ratio <= 1 / LIMITING_CASE_RATIO) {
    return "medium1Dominant";
  }
  return "none";
}

export class LimitingCaseCalloutNode extends Node {
  private hideTimer: (() => void) | null = null;

  public constructor(
    centerPosition: Vector2,
    param1Property: TReadOnlyProperty<number>,
    param2Property: TReadOnlyProperty<number>,
    strings: LimitingCaseCalloutStrings,
  ) {
    super({ pickable: false, visible: false });

    // Wraps rather than shrinking to fit: these sentences name a phenomenon and
    // have to stay readable, and a single long line would reach the medium panel.
    const text = new RichText("", {
      font: new PhetFont(13),
      fill: FieldBoundaryColors.textColorProperty,
      lineWrap: 320,
      align: "center",
    });
    const background = new Rectangle(0, 0, 10, 10, {
      cornerRadius: 6,
      fill: FieldBoundaryColors.calloutBackgroundColorProperty,
      stroke: FieldBoundaryColors.interfaceStrokeProperty,
      lineWidth: 1.5,
    });
    this.children = [background, text];

    text.boundsProperty.link(() => {
      background.setRect(0, 0, text.width + 24, text.height + 14);
      text.center = background.center;
      this.center = centerPosition;
    });

    // The regime, not the raw values, drives the callout — so dragging around
    // inside one regime does not re-fire it.
    let previous: LimitingCase = classifyLimitingCase(param1Property.value, param2Property.value);

    const show = (message: string): void => {
      text.string = message;
      this.visible = true;
      if (this.hideTimer) {
        this.hideTimer();
      }
      const listener = stepTimer.setTimeout(() => {
        this.visible = false;
        this.hideTimer = null;
      }, CALLOUT_DURATION_MS);
      this.hideTimer = () => {
        stepTimer.clearTimeout(listener);
        this.hideTimer = null;
      };
    };

    Multilink.multilink(
      [param1Property, param2Property, strings.medium1Dominant, strings.medium2Dominant, strings.matched],
      (param1, param2, medium1Dominant, medium2Dominant, matched) => {
        const current = classifyLimitingCase(param1, param2);
        if (current === previous) {
          return;
        }
        previous = current;
        if (current === "none") {
          this.visible = false;
          this.hideTimer?.();
          return;
        }
        show(
          current === "medium2Dominant" ? medium2Dominant : current === "medium1Dominant" ? medium1Dominant : matched,
        );
      },
    );
  }
}
