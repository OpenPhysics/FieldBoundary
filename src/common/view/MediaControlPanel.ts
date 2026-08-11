/**
 * MediaControlPanel.ts
 *
 * Preset combo + relative εᵣ or μᵣ slider for one medium.
 */
import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import { ComboBox, type ComboBoxItem } from "scenerystack/sun";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { RELATIVE_PARAMETER_RANGE } from "../../FieldBoundaryConstants.js";
import {
  FIELD_BOUNDARY_COMBO_BOX_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../FieldBoundaryButtonOptions.js";
import { FieldBoundaryPanel } from "../FieldBoundaryPanel.js";
import type { MaterialPresetId } from "../model/MaterialPresets.js";

export type MediaControlPanelStrings = {
  title: TReadOnlyProperty<string>;
  parameter: TReadOnlyProperty<string>;
  vacuum: TReadOnlyProperty<string>;
  water: TReadOnlyProperty<string>;
  glass: TReadOnlyProperty<string>;
  highK: TReadOnlyProperty<string>;
  custom: TReadOnlyProperty<string>;
  accessibleName: TReadOnlyProperty<string>;
  sliderAccessibleName: TReadOnlyProperty<string>;
};

export class MediaControlPanel extends FieldBoundaryPanel {
  public constructor(
    parameterProperty: Property<number>,
    presetProperty: Property<MaterialPresetId>,
    onUserParameterChange: () => void,
    strings: MediaControlPanelStrings,
    listParent: Node,
  ) {
    const title = new Text(strings.title, {
      font: new PhetFont({ size: 15, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const item = (value: MaterialPresetId, label: TReadOnlyProperty<string>): ComboBoxItem<MaterialPresetId> => ({
      value,
      createNode: () => new Text(label, { font: new PhetFont(14), fill: LIGHT_SURFACE_TEXT_FILL }),
    });

    const comboBox = new ComboBox(
      presetProperty,
      [
        item("vacuum", strings.vacuum),
        item("water", strings.water),
        item("glass", strings.glass),
        item("highK", strings.highK),
        item("custom", strings.custom),
      ],
      listParent,
      {
        ...FIELD_BOUNDARY_COMBO_BOX_OPTIONS,
        accessibleName: strings.accessibleName,
      },
    );

    const numberControl = new NumberControl(strings.parameter, parameterProperty, RELATIVE_PARAMETER_RANGE, {
      delta: 0.1,
      includeArrowButtons: true,
      soundGenerator: null,
      layoutFunction: NumberControl.createLayoutFunction4({ verticalSpacing: 4 }),
      titleNodeOptions: { fill: FieldBoundaryColors.textColorProperty, font: new PhetFont(13) },
      numberDisplayOptions: {
        decimalPlaces: 1,
        textOptions: { fill: LIGHT_SURFACE_TEXT_FILL, font: new PhetFont(13) },
        backgroundFill: FieldBoundaryColors.controlSurfaceColorProperty,
        backgroundStroke: FieldBoundaryColors.panelBorderColorProperty,
      },
      sliderOptions: {
        trackSize: new Dimension2(120, 4),
        thumbSize: new Dimension2(14, 24),
      },
      accessibleName: strings.sliderAccessibleName,
      arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });

    parameterProperty.lazyLink(() => onUserParameterChange());

    super(
      new VBox({
        spacing: 10,
        align: "left",
        children: [title, comboBox, numberControl],
      }),
    );
  }
}
