/**
 * ToolsControlPanel.ts
 *
 * Checkboxes for components, field lines, protractor, and angle readouts.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
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
};

export class ToolsControlPanel extends FieldBoundaryPanel {
  public constructor(shared: SharedModel, strings: ToolsControlPanelStrings) {
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
      ],
      {
        spacing: 8,
        checkboxOptions: {
          checkboxColor: FieldBoundaryColors.textColorProperty,
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
    );
  }
}
