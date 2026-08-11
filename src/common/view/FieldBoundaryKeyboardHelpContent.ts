/**
 * FieldBoundaryKeyboardHelpContent.ts
 *
 * Shared keyboard-help dialog content for both Electric and Magnetic screens.
 * Basic actions cover buttons and Reset All; add slider/combo sections as needed.
 */
import { BasicActionsKeyboardHelpSection, TwoColumnKeyboardHelpContent } from "scenerystack/scenery-phet";

export class FieldBoundaryKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], []);
  }
}
