/**
 * ToolsControlPanel.ts
 *
 * Checkboxes for the play-area tools. "Angles" and "Surface normal" are
 * separate toggles: the normal is the reference line a student needs *while*
 * measuring with the protractor, so hiding the θ readouts and arcs must not
 * remove it.
 *
 * The "Vectors" row at the top is a horizontal group of three symbol
 * checkboxes (E / D / P, dually H / B / M). It is horizontal rather than three
 * more rows in the vertical list because the labels are single glyphs and the
 * right-hand column has no room to spare — and grouping them says what the lane
 * offsets in the play area say: these three are one family of arrows. Isolating
 * one is the fastest way to answer "which arrow is that?", since E, D and P are
 * collinear and can only ever differ in length.
 *
 * The P / M checkbox carries the bound-source glyphs (σ_b / K_b) with it; the
 * bare glyph label would not say so, which is what `boundSource` — "Bound
 * charge (P, σ_b)" — is for as its accessible name.
 */
import type { BooleanProperty, TReadOnlyProperty } from "scenerystack/axon";
import { type Color, HBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox, VerticalCheckboxGroup } from "scenerystack/sun";
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
  /** "Bound charge (P, σ_b)" / "Magnetization (M, K_b)" — the P/M accessible name. */
  boundSource: TReadOnlyProperty<string>;
  /** "Vectors" section heading. */
  vectors: TReadOnlyProperty<string>;
  /** Bare glyphs on the vector checkboxes: "E" / "D" / "P", or "H" / "B" / "M". */
  primarySymbol: TReadOnlyProperty<string>;
  companionSymbol: TReadOnlyProperty<string>;
  boundSymbol: TReadOnlyProperty<string>;
  /** Accessible names for the primary / companion vector checkboxes. */
  showPrimary: TReadOnlyProperty<string>;
  showCompanion: TReadOnlyProperty<string>;
  /** Arrow colors, so each glyph matches the arrow its checkbox controls. */
  primaryColor: TReadOnlyProperty<Color>;
  companionColor: TReadOnlyProperty<Color>;
};

const CHECKBOX_OPTIONS = {
  checkboxColor: FieldBoundaryColors.textColorProperty,
  checkboxColorBackground: FieldBoundaryColors.panelBackgroundColorProperty,
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

    // ── Vectors row ───────────────────────────────────────────────────────────
    // Each glyph is coloured like the arrow it controls, so the checkbox and the
    // thing it hides are matched without reading the label.
    const symbol = (stringProperty: TReadOnlyProperty<string>, fill: TReadOnlyProperty<Color>): Text =>
      new Text(stringProperty, {
        font: new PhetFont({ size: 15, weight: "bold" }),
        fill,
      });

    const vectorsHeading = new Text(strings.vectors, {
      font: new PhetFont(14),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const vectorsRow = new HBox({
      spacing: 14,
      children: [
        new Checkbox(shared.showPrimaryVectorProperty, symbol(strings.primarySymbol, strings.primaryColor), {
          ...CHECKBOX_OPTIONS,
          accessibleName: strings.showPrimary,
        }),
        new Checkbox(shared.showCompanionVectorProperty, symbol(strings.companionSymbol, strings.companionColor), {
          ...CHECKBOX_OPTIONS,
          accessibleName: strings.showCompanion,
        }),
        new Checkbox(
          showBoundSourceProperty,
          symbol(strings.boundSymbol, FieldBoundaryColors.polarizationColorProperty),
          { ...CHECKBOX_OPTIONS, accessibleName: strings.boundSource },
        ),
      ],
    });

    const group = new VerticalCheckboxGroup(
      [
        { property: shared.showComponentsProperty, createNode: () => label(strings.components) },
        { property: shared.showFieldLinesProperty, createNode: () => label(strings.fieldLines) },
        { property: shared.showProtractorProperty, createNode: () => label(strings.protractor) },
        { property: shared.showAnglesProperty, createNode: () => label(strings.angles) },
        { property: shared.showNormalProperty, createNode: () => label(strings.surfaceNormal) },
        { property: shared.fluxBox.showProperty, createNode: () => label(strings.fluxBox) },
      ],
      {
        spacing: 8,
        checkboxOptions: CHECKBOX_OPTIONS,
      },
    );

    super(
      new VBox({
        spacing: 10,
        align: "left",
        children: [title, vectorsHeading, vectorsRow, group],
      }),
      { accessibleHeading },
    );
  }
}
