/**
 * EquationStripNode.ts
 *
 * Compact BC reminder with continuous terms highlighted when components show.
 */
import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";

export class EquationStripNode extends Node {
  public constructor(
    mode: "electric" | "magnetic",
    showComponentsProperty: Property<boolean>,
    titleProperty: TReadOnlyProperty<string>,
  ) {
    super();

    const font = new PhetFont({ size: 15 });
    const highlightFont = new PhetFont({ size: 15, weight: "bold" });

    const title = new Text(titleProperty, {
      font: new PhetFont({ size: 14, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const term = (label: string, continuous: boolean): Text =>
      new Text(label, {
        font: continuous ? highlightFont : font,
        fill: continuous ? FieldBoundaryColors.equationHighlightColorProperty : FieldBoundaryColors.textColorProperty,
      });

    const electricRow = new HBox({
      spacing: 14,
      children: [term("E₁ₜ = E₂ₜ", true), term("D₁ₙ = D₂ₙ", true), term("E₁ₙ ≠ E₂ₙ", false), term("D₁ₜ ≠ D₂ₜ", false)],
    });
    const magneticRow = new HBox({
      spacing: 14,
      children: [term("H₁ₜ = H₂ₜ", true), term("B₁ₙ = B₂ₙ", true), term("H₁ₙ ≠ H₂ₙ", false), term("B₁ₜ ≠ B₂ₜ", false)],
    });

    const row = mode === "electric" ? electricRow : magneticRow;
    showComponentsProperty.link((show) => {
      row.opacity = show ? 1 : 0.55;
    });

    const content = new HBox({ spacing: 18, children: [title, row], align: "center" });
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
