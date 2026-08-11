/**
 * EquationStripNode.ts
 *
 * Compact BC reminder with continuous terms highlighted when components show,
 * plus the E↔H duality line — the payoff of having two screens, which a student
 * otherwise has to notice unaided.
 *
 * With a free source present (σ_f ≠ 0 or K_f ≠ 0) the normally-continuous term
 * becomes a jump condition, so the strip swaps that term and the title to
 * reflect the sourced boundary condition instead of falsely claiming equality.
 *
 * Term nodes are created once and re-shown, never rebuilt: recreating them on
 * every slider tick leaked Text nodes still holding string-Property listeners.
 */
import { DerivedProperty, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";

export type EquationStripStrings = {
  /** Title when the free source is zero. */
  sourceFreeTitle: TReadOnlyProperty<string>;
  /** Title when the free source is nonzero. */
  sourcedTitle: TReadOnlyProperty<string>;
  /** The always-continuous term (Eₜ / Bₙ). */
  continuousTerm: TReadOnlyProperty<string>;
  /** The conditionally-continuous term with no free source (Dₙ / Hₜ). */
  conditionalTerm: TReadOnlyProperty<string>;
  /** The same term rewritten as a jump when the free source is nonzero. */
  conditionalJumpTerm: TReadOnlyProperty<string>;
  /** The two always-discontinuous terms. */
  discontinuousTerm1: TReadOnlyProperty<string>;
  discontinuousTerm2: TReadOnlyProperty<string>;
  /** Cross-screen duality reminder. */
  duality: TReadOnlyProperty<string>;
};

export class EquationStripNode extends Node {
  public constructor(
    mode: "electric" | "magnetic",
    showComponentsProperty: Property<boolean>,
    freeSourceProperty: TReadOnlyProperty<number>,
    strings: EquationStripStrings,
  ) {
    super({ tagName: "div" });

    const font = new PhetFont({ size: 15 });
    const highlightFont = new PhetFont({ size: 15, weight: "bold" });

    const sourcedProperty = new DerivedProperty([freeSourceProperty], (s) => Math.abs(s) >= 1e-9);

    const titleStringProperty = new DerivedProperty(
      [sourcedProperty, strings.sourceFreeTitle, strings.sourcedTitle],
      (sourced, free0, freeN) => (sourced ? freeN : free0),
    );
    const title = new Text(titleStringProperty, {
      font: new PhetFont({ size: 14, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
    });

    const term = (stringProperty: TReadOnlyProperty<string>, continuous: boolean): Text =>
      new Text(stringProperty, {
        font: continuous ? highlightFont : font,
        fill: continuous ? FieldBoundaryColors.equationHighlightColorProperty : FieldBoundaryColors.textColorProperty,
      });

    // Electric: Eₜ is always continuous, Dₙ only when σ_f = 0.
    // Magnetic: Bₙ is always continuous, Hₜ only when K_f = 0.
    const alwaysContinuous = term(strings.continuousTerm, true);
    const conditional = term(strings.conditionalTerm, true);
    const conditionalJump = term(strings.conditionalJumpTerm, false);
    const discontinuous1 = term(strings.discontinuousTerm1, false);
    const discontinuous2 = term(strings.discontinuousTerm2, false);

    // Electric leads with the tangential term, magnetic with the tangential H
    // term too — in both modes the conditional term is the one that moves.
    const orderedTerms = (conditionalNode: Node): Node[] =>
      mode === "electric"
        ? [alwaysContinuous, conditionalNode, discontinuous1, discontinuous2]
        : [conditionalNode, alwaysContinuous, discontinuous1, discontinuous2];

    const row = new HBox({ spacing: 14, children: orderedTerms(conditional) });

    const dualityText = new Text(strings.duality, {
      font: new PhetFont(11),
      fill: FieldBoundaryColors.freeComponentColorProperty,
    });

    const content = new VBox({
      spacing: 3,
      align: "left",
      children: [new HBox({ spacing: 18, children: [title, row], align: "center" }), dualityText],
    });

    const applyOpacity = (): void => {
      row.opacity = showComponentsProperty.value ? 1 : 0.55;
    };

    sourcedProperty.link((sourced) => {
      row.children = orderedTerms(sourced ? conditionalJump : conditional);
      applyOpacity();
    });
    showComponentsProperty.link(applyOpacity);

    // The strip is the sim's thesis statement; it needs to reach assistive tech.
    const accessibleStringProperty = new DerivedProperty(
      [
        titleStringProperty,
        sourcedProperty,
        strings.continuousTerm,
        strings.conditionalTerm,
        strings.conditionalJumpTerm,
        strings.discontinuousTerm1,
        strings.discontinuousTerm2,
        strings.duality,
      ],
      (titleString, sourced, continuous, conditionalTerm, jumpTerm, disc1, disc2, duality) =>
        `${titleString}: ${[continuous, sourced ? jumpTerm : conditionalTerm, disc1, disc2].join("; ")}. ${duality}`,
    );
    this.accessibleParagraph = accessibleStringProperty;

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
