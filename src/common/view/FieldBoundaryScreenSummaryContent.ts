/**
 * FieldBoundaryScreenSummaryContent.ts
 *
 * Shared accessible screen summary. Pass the screen's a11y string bag
 * (electric or magnetic); both share the same four-region shape.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";

export type FieldBoundaryA11ySummaryStrings = {
  screenSummary: {
    playAreaStringProperty: TReadOnlyProperty<string>;
    controlAreaStringProperty: TReadOnlyProperty<string>;
    interactionHintStringProperty: TReadOnlyProperty<string>;
  };
  currentDetailsStringProperty: TReadOnlyProperty<string>;
};

export class FieldBoundaryScreenSummaryContent extends ScreenSummaryContent {
  public constructor(a11y: FieldBoundaryA11ySummaryStrings) {
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: a11y.currentDetailsStringProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
