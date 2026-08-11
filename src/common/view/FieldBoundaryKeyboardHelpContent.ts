/**
 * FieldBoundaryKeyboardHelpContent.ts
 *
 * Shared keyboard-help dialog content for both Electric and Magnetic screens.
 *
 * The sim has four sliders, two combo boxes, and draggable play-area objects
 * (the field tip, and the pillbox / loop) with distinct normal and shift drag
 * speeds — so basic actions alone would leave most of the keyboard interface
 * undocumented.
 */
import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class FieldBoundaryKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const a11y = StringManager.getInstance().getKeyboardHelpStrings();
    super(
      [
        new MoveDraggableItemsKeyboardHelpSection({
          headingStringProperty: a11y.moveItemsHeadingStringProperty,
        }),
        new SliderControlsKeyboardHelpSection(),
      ],
      [
        new ComboBoxKeyboardHelpSection({
          headingString: a11y.materialListHeadingStringProperty,
          thingAsLowerCaseSingular: a11y.materialSingularStringProperty,
          thingAsLowerCasePlural: a11y.materialPluralStringProperty,
        }),
        new BasicActionsKeyboardHelpSection({ withCheckboxContent: true }),
      ],
    );
  }
}
