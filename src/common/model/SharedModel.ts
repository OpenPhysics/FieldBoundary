/**
 * SharedModel.ts
 *
 * Cross-screen view-tool toggles. Each screen owns its own instance.
 * The screen-specific bound-source layer lives on ElectricModel / MagneticModel.
 */
import { BooleanProperty } from "scenerystack/axon";
import { FluxBoxModel } from "./FluxBoxModel.js";

export class SharedModel {
  /**
   * Per-quantity arrow visibility. E, D and P are collinear, so even drawn in
   * separate lanes the play area is busiest when all three are up; being able
   * to look at one at a time is the cheapest way to answer "which arrow is
   * that?". The bound (P / M) toggle is screen-specific and lives on
   * ElectricModel / MagneticModel alongside its glyph layer.
   */
  public readonly showPrimaryVectorProperty = new BooleanProperty(true);
  public readonly showCompanionVectorProperty = new BooleanProperty(true);

  public readonly showComponentsProperty = new BooleanProperty(true);
  public readonly showFieldLinesProperty = new BooleanProperty(false);
  public readonly showProtractorProperty = new BooleanProperty(false);
  /**
   * θ₁ / θ₂ numeric readout and the play-area arcs from the surface normal.
   * Separate from `showNormalProperty` / `showProtractorProperty`: those are
   * measuring tools; this is the angle annotation itself.
   */
  public readonly showAnglesProperty = new BooleanProperty(true);

  /**
   * Surface-normal reference line. Separate from `showAnglesProperty`: the
   * normal is exactly the line a student needs when measuring with the
   * protractor, so hiding the θ readouts and arcs must not take it away.
   */
  public readonly showNormalProperty = new BooleanProperty(true);

  /** Gaussian pillbox (Electric) / Amperian loop (Magnetic) tool. */
  public readonly fluxBox = new FluxBoxModel();

  public reset(): void {
    this.showPrimaryVectorProperty.reset();
    this.showCompanionVectorProperty.reset();
    this.showComponentsProperty.reset();
    this.showFieldLinesProperty.reset();
    this.showProtractorProperty.reset();
    this.showAnglesProperty.reset();
    this.showNormalProperty.reset();
    this.fluxBox.reset();
  }

  public dispose(): void {
    this.showPrimaryVectorProperty.dispose();
    this.showCompanionVectorProperty.dispose();
    this.showComponentsProperty.dispose();
    this.showFieldLinesProperty.dispose();
    this.showProtractorProperty.dispose();
    this.showAnglesProperty.dispose();
    this.showNormalProperty.dispose();
    this.fluxBox.dispose();
  }
}
