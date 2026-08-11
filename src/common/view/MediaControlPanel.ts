/**
 * MediaControlPanel.ts
 *
 * Preset combo + relative εᵣ or μᵣ control for one medium.
 *
 * The parameter slider is LOGARITHMIC. Real materials span decades — glass 5,
 * water 80, ferrite 10³, mu-metal 2×10⁴ — while the pedagogically interesting
 * behavior is all at ratios of order 1–10. On a linear track that region would
 * be a dozen pixels wide. The slider therefore drives log₁₀(parameter) while the
 * readout, the model, and the accessible value text all stay in real units.
 */
import { DerivedProperty, MappedProperty, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import type { Color } from "scenerystack/scenery";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { ComboBox, type ComboBoxItem, HSlider } from "scenerystack/sun";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { LOG_SLIDER_DECADES } from "../../FieldBoundaryConstants.js";
import { FIELD_BOUNDARY_COMBO_BOX_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../FieldBoundaryButtonOptions.js";
import { FieldBoundaryPanel } from "../FieldBoundaryPanel.js";
import type { MaterialPreset, MaterialPresetId } from "../model/MaterialPresets.js";

export type MediaControlPanelStrings = {
  title: TReadOnlyProperty<string>;
  parameter: TReadOnlyProperty<string>;
  custom: TReadOnlyProperty<string>;
  accessibleName: TReadOnlyProperty<string>;
  sliderAccessibleName: TReadOnlyProperty<string>;
  sliderHelpText: TReadOnlyProperty<string>;
  /** Label for each preset id offered on this screen. */
  presetLabels: ReadonlyMap<MaterialPresetId, TReadOnlyProperty<string>>;
};

/** ≤ 10 reads better with a decimal; above that the decimal is noise. */
export function formatParameter(value: number): string {
  return value < 10 ? value.toFixed(1) : Math.round(value).toString();
}

export class MediaControlPanel extends FieldBoundaryPanel {
  public constructor(
    parameterProperty: Property<number>,
    parameterRange: Range,
    presets: readonly MaterialPreset[],
    presetProperty: Property<MaterialPresetId>,
    onUserParameterChange: () => void,
    strings: MediaControlPanelStrings,
    listParent: Node,
    options?: { fill?: TReadOnlyProperty<Color> },
  ) {
    const title = new Text(strings.title, {
      font: new PhetFont({ size: 15, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const item = (value: MaterialPresetId, label: TReadOnlyProperty<string>): ComboBoxItem<MaterialPresetId> => ({
      value,
      createNode: () => new Text(label, { font: new PhetFont(14), fill: LIGHT_SURFACE_TEXT_FILL }),
    });

    const comboItems: ComboBoxItem<MaterialPresetId>[] = presets.map((preset) => {
      const label = strings.presetLabels.get(preset.id);
      if (!label) {
        throw new Error(`missing label for material preset ${preset.id}`);
      }
      return item(preset.id, label);
    });
    comboItems.push(item("custom", strings.custom));

    const comboBox = new ComboBox(presetProperty, comboItems, listParent, {
      ...FIELD_BOUNDARY_COMBO_BOX_OPTIONS,
      accessibleName: strings.accessibleName,
    });

    // Slider works in log₁₀ space; everything the student reads stays linear.
    const logRange = { min: Math.log10(parameterRange.min), max: Math.log10(parameterRange.max) };
    const logProperty = new MappedProperty<number, number>(parameterProperty, {
      bidirectional: true,
      map: (value: number) => Math.log10(value),
      inverseMap: (logValue: number) => parameterRange.constrainValue(10 ** logValue),
    });

    const readout = new Text(
      new DerivedProperty(
        [parameterProperty, strings.parameter],
        (value, symbol) => `${symbol} = ${formatParameter(value)}`,
      ),
      { font: new PhetFont(13), fill: FieldBoundaryColors.textColorProperty },
    );

    const slider = new HSlider(logProperty, new Range(logRange.min, logRange.max), {
      trackSize: new Dimension2(140, 4),
      thumbSize: new Dimension2(14, 24),
      // One keyboard step is a fixed *factor*, which is what a log axis means.
      keyboardStep: (logRange.max - logRange.min) / 20,
      shiftKeyboardStep: (logRange.max - logRange.min) / 100,
      pageKeyboardStep: (logRange.max - logRange.min) / 5,
      accessibleName: strings.sliderAccessibleName,
      accessibleHelpText: strings.sliderHelpText,
      pdomCreateAriaValueText: (logValue: number) => formatParameter(10 ** logValue),
    });

    // Decade ticks make the logarithmic spacing legible rather than mysterious.
    for (const decade of LOG_SLIDER_DECADES) {
      if (decade >= parameterRange.min && decade <= parameterRange.max) {
        slider.addMajorTick(
          Math.log10(decade),
          new Text(formatParameter(decade), { font: new PhetFont(10), fill: FieldBoundaryColors.textColorProperty }),
        );
      }
    }

    parameterProperty.lazyLink(() => onUserParameterChange());

    super(
      new VBox({
        spacing: 8,
        align: "left",
        children: [title, comboBox, readout, slider],
      }),
      options?.fill ? { fill: options.fill } : {},
    );
  }
}
