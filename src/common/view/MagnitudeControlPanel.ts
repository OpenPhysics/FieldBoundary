/**
 * MagnitudeControlPanel.ts
 *
 * Slider for the primary-field magnitude (angle is set by dragging the tip).
 */
import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { FIELD_MAGNITUDE_RANGE } from "../../FieldBoundaryConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../FieldBoundaryButtonOptions.js";
import { FieldBoundaryPanel } from "../FieldBoundaryPanel.js";

export class MagnitudeControlPanel extends FieldBoundaryPanel {
  public constructor(
    magnitudeProperty: Property<number>,
    titleProperty: TReadOnlyProperty<string>,
    accessibleName: TReadOnlyProperty<string>,
    accessibleHelpText: TReadOnlyProperty<string>,
    /** e.g. "{{value}} field units" — a bare number tells a listener nothing. */
    valueTextPattern: TReadOnlyProperty<string>,
  ) {
    const title = new Text(titleProperty, {
      font: new PhetFont({ size: 15, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const numberControl = new NumberControl("", magnitudeProperty, FIELD_MAGNITUDE_RANGE, {
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
        pdomCreateAriaValueText: (value: number) => StringUtils.fillIn(valueTextPattern, { value: value.toFixed(1) }),
      },
      accessibleName,
      accessibleHelpText,
      arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });

    super(
      new VBox({
        spacing: 8,
        align: "left",
        children: [title, numberControl],
      }),
    );
  }
}
