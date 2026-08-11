/**
 * ToolsControlPanel.ts
 *
 * Checkboxes for the play-area tools. "Angles" and "Surface normal" are
 * separate toggles: the normal is the reference line a student needs *while*
 * measuring with the protractor, so hiding the θ readouts must not remove it.
 *
 * The bound-source toggle (P/σ_b on Electric, M/K_b on Magnetic) is optional
 * only in the sense that its label differs per screen.
 */
import type { BooleanProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { VerticalCheckboxGroup } from "scenerystack/sun";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { FieldBoundaryPanel } from "../FieldBoundaryPanel.js";
import type { SharedModel } from "../model/SharedModel.js";

export type ToolsControlPanelStrings = {
  title: TReadOnlyProperty<string>;
  components: TReadOnlyProperty<string>;
  fieldLines: TReadOnlyProperty<string>;
  protractor: TReadOnlyProperty<string>;
  angles: TReadOnlyProperty<string>;
  surfaceNormal: TReadOnlyProperty<string>;
  /** "Gaussian pillbox" (Electric) / "Amperian loop" (Magnetic). */
  fluxBox: TReadOnlyProperty<string>;
  /** "Bound charge (P, σ_b)" / "Magnetization (M, K_b)". */
  boundSource: TReadOnlyProperty<string>;
};

export class ToolsControlPanel extends FieldBoundaryPanel {
  public constructor(
    shared: SharedModel,
    strings: ToolsControlPanelStrings,
    showBoundSourceProperty: BooleanProperty,
    accessibleHeading: TReadOnlyProperty<string>,
  ) {
    const title = new Text(strings.title, {
      font: new PhetFont({ size: 15, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const label = (stringProperty: TReadOnlyProperty<string>): Text =>
      new Text(stringProperty, {
        font: new PhetFont(14),
        fill: FieldBoundaryColors.textColorProperty,
      });

    const group = new VerticalCheckboxGroup(
      [
        { property: shared.showComponentsProperty, createNode: () => label(strings.components) },
        { property: shared.showFieldLinesProperty, createNode: () => label(strings.fieldLines) },
        { property: shared.showProtractorProperty, createNode: () => label(strings.protractor) },
        { property: shared.showAnglesProperty, createNode: () => label(strings.angles) },
        { property: shared.showNormalProperty, createNode: () => label(strings.surfaceNormal) },
        { property: shared.fluxBox.showProperty, createNode: () => label(strings.fluxBox) },
        { property: showBoundSourceProperty, createNode: () => label(strings.boundSource) },
      ],
      {
        spacing: 8,
        checkboxOptions: {
          checkboxColor: FieldBoundaryColors.controlSurfaceTextColorProperty,
          checkboxColorBackground: FieldBoundaryColors.controlSurfaceColorProperty,
        },
      },
    );

    super(
      new VBox({
        spacing: 10,
        align: "left",
        children: [title, group],
      }),
      { accessibleHeading },
    );
  }
}
