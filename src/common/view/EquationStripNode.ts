/**
 * EquationStripNode.ts
 *
 * Compact BC reminder with continuous terms highlighted when components show.
 *
 * With a free source present (σ_f ≠ 0 or K_f ≠ 0) the normally-continuous term
 * becomes a jump condition, so the strip swaps that term and the title to
 * reflect the sourced boundary condition instead of falsely claiming equality.
 */
import { DerivedProperty, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";

export class EquationStripNode extends Node {
  public constructor(
    mode: "electric" | "magnetic",
    showComponentsProperty: Property<boolean>,
    titleProperty: TReadOnlyProperty<string>,
    freeTitleProperty: TReadOnlyProperty<string>,
    freeSourceProperty: TReadOnlyProperty<number>,
  ) {
    super();

    const font = new PhetFont({ size: 15 });
    const highlightFont = new PhetFont({ size: 15, weight: "bold" });

    const titleStringProperty = new DerivedProperty(
      [freeSourceProperty, titleProperty, freeTitleProperty],
      (s, free0, freeN) => (Math.abs(s) < 1e-9 ? free0 : freeN),
    );
    const title = new Text(titleStringProperty, {
      font: new PhetFont({ size: 14, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const term = (label: string, continuous: boolean): Text =>
      new Text(label, {
        font: continuous ? highlightFont : font,
        fill: continuous ? FieldBoundaryColors.equationHighlightColorProperty : FieldBoundaryColors.textColorProperty,
      });

    const row = new HBox({ spacing: 14, children: [] });
    const content = new HBox({ spacing: 18, children: [title, row], align: "center" });

    const buildRow = (sourced: boolean): void => {
      if (mode === "electric") {
        row.children = sourced
          ? [
              term("E₁ₜ = E₂ₜ", true),
              term("D₁ₙ − D₂ₙ = σ_f", false),
              term("E₁ₙ ≠ E₂ₙ", false),
              term("D₁ₜ ≠ D₂ₜ", false),
            ]
          : [term("E₁ₜ = E₂ₜ", true), term("D₁ₙ = D₂ₙ", true), term("E₁ₙ ≠ E₂ₙ", false), term("D₁ₜ ≠ D₂ₜ", false)];
      } else {
        row.children = sourced
          ? [
              term("H₂ₜ − H₁ₜ = K_f", false),
              term("B₁ₙ = B₂ₙ", true),
              term("H₁ₙ ≠ H₂ₙ", false),
              term("B₁ₜ ≠ B₂ₜ", false),
            ]
          : [term("H₁ₜ = H₂ₜ", true), term("B₁ₙ = B₂ₙ", true), term("H₁ₙ ≠ H₂ₙ", false), term("B₁ₜ ≠ B₂ₜ", false)];
      }
    };

    const update = (): void => {
      buildRow(Math.abs(freeSourceProperty.value) >= 1e-9);
      row.opacity = showComponentsProperty.value ? 1 : 0.55;
    };

    freeSourceProperty.link(update);
    showComponentsProperty.link(() => {
      row.opacity = showComponentsProperty.value ? 1 : 0.55;
    });

    const background = new Rectangle(0, 0, 10, 10, {
      cornerRadius: 6,
      fill: FieldBoundaryColors.panelBackgroundColorProperty,
      stroke: FieldBoundaryColors.panelBorderColorProperty,
    });

    content.boundsProperty.link((bounds) => {
      background.setRect(0, 0, bounds.width + 24, bounds.height + 12);
      content.left = 12;
      content.centerY = background.centerY;
    });

    this.children = [background, content];
  }
}
