/**
 * FluxTallyPanel.ts
 *
 * Live tally for the Gaussian pillbox / Amperian loop: each face or leg, the
 * side contributions that vanish as the box collapses, the total, and the free
 * source it encloses.
 *
 * The last two rows are the point — when they agree, the student has just
 * derived the boundary condition rather than been told it.
 */
import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { GridBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { FieldBoundaryPanel } from "../FieldBoundaryPanel.js";
import type { InterfaceBoxTally } from "../model/interfaceFields.js";
import { formatTallyValue } from "./fluxTally.js";

export type FluxTallyPanelStrings = {
  title: TReadOnlyProperty<string>;
  medium1Face: TReadOnlyProperty<string>;
  medium2Face: TReadOnlyProperty<string>;
  sides: TReadOnlyProperty<string>;
  total: TReadOnlyProperty<string>;
  enclosed: TReadOnlyProperty<string>;
  /** Nudge toward collapsing the box. */
  hint: TReadOnlyProperty<string>;
  /** Accessible summary pattern with {{total}} and {{enclosed}}. */
  accessiblePattern: TReadOnlyProperty<string>;
};

export class FluxTallyPanel extends FieldBoundaryPanel {
  public constructor(
    tallyProperty: TReadOnlyProperty<InterfaceBoxTally>,
    visibleProperty: TReadOnlyProperty<boolean>,
    strings: FluxTallyPanelStrings,
  ) {
    const labelFont = new PhetFont(12);
    const valueFont = new PhetFont({ size: 12, weight: "bold" });

    const title = new Text(strings.title, {
      font: new PhetFont({ size: 13, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const label = (stringProperty: TReadOnlyProperty<string>): Text =>
      new Text(stringProperty, { font: labelFont, fill: FieldBoundaryColors.textColorProperty });

    const topValue = new Text("", { font: valueFont, fill: FieldBoundaryColors.textColorProperty });
    const bottomValue = new Text("", { font: valueFont, fill: FieldBoundaryColors.textColorProperty });
    const sidesValue = new Text("", { font: valueFont, fill: FieldBoundaryColors.freeComponentColorProperty });
    const totalValue = new Text("", { font: valueFont, fill: FieldBoundaryColors.accentColorProperty });
    const enclosedValue = new Text("", { font: valueFont, fill: FieldBoundaryColors.accentColorProperty });

    tallyProperty.link((tally) => {
      topValue.string = formatTallyValue(tally.top);
      bottomValue.string = formatTallyValue(tally.bottom);
      // Left and right are equal and opposite for uniform fields, so print the
      // pair — "±0.42" shrinking toward "±0.00" is what the collapse shows.
      sidesValue.string = `±${formatTallyValue(Math.abs(tally.right))}`;
      totalValue.string = formatTallyValue(tally.total);
      enclosedValue.string = formatTallyValue(tally.enclosedFree);
    });

    const grid = new GridBox({
      xSpacing: 12,
      ySpacing: 3,
      xAlign: "left",
      rows: [
        [label(strings.medium1Face), topValue],
        [label(strings.medium2Face), bottomValue],
        [label(strings.sides), sidesValue],
        [label(strings.total), totalValue],
        [label(strings.enclosed), enclosedValue],
      ],
    });

    const hint = new Text(strings.hint, {
      font: new PhetFont(10),
      fill: FieldBoundaryColors.freeComponentColorProperty,
      maxWidth: 200,
    });

    super(
      new VBox({
        spacing: 6,
        align: "left",
        children: [title, grid, hint],
      }),
      {
        visibleProperty,
        accessibleParagraph: new DerivedProperty([tallyProperty, strings.accessiblePattern], (tally, pattern) =>
          StringUtils.fillIn(pattern, {
            total: formatTallyValue(tally.total),
            enclosed: formatTallyValue(tally.enclosedFree),
            sides: formatTallyValue(Math.abs(tally.right)),
          }),
        ),
      },
    );
  }
}
