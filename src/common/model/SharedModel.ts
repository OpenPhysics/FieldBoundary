/**
 * SharedModel.ts
 *
 * Cross-screen view-tool toggles. Each screen owns its own instance.
 * The screen-specific bound-source layer lives on ElectricModel / MagneticModel.
 */
import { BooleanProperty } from "scenerystack/axon";
import { FluxBoxModel } from "./FluxBoxModel.js";

export class SharedModel {
  public readonly showComponentsProperty = new BooleanProperty(true);
  public readonly showFieldLinesProperty = new BooleanProperty(false);
  public readonly showProtractorProperty = new BooleanProperty(false);
  public readonly showAnglesProperty = new BooleanProperty(true);

  /**
   * Surface-normal reference line. Separate from `showAnglesProperty`: the
   * normal is exactly the line a student needs when measuring with the
   * protractor, so hiding the θ readouts must not take it away.
   */
  public readonly showNormalProperty = new BooleanProperty(true);

  /** Gaussian pillbox (Electric) / Amperian loop (Magnetic) tool. */
  public readonly fluxBox = new FluxBoxModel();

  public reset(): void {
    this.showComponentsProperty.reset();
    this.showFieldLinesProperty.reset();
    this.showProtractorProperty.reset();
    this.showAnglesProperty.reset();
    this.showNormalProperty.reset();
    this.fluxBox.reset();
  }

  public dispose(): void {
    this.showComponentsProperty.dispose();
    this.showFieldLinesProperty.dispose();
    this.showProtractorProperty.dispose();
    this.showAnglesProperty.dispose();
    this.showNormalProperty.dispose();
    this.fluxBox.dispose();
  }
}
