/**
 * SharedModel.ts
 *
 * Cross-screen view-tool toggles. Each screen owns its own instance.
 */
import { BooleanProperty } from "scenerystack/axon";

export class SharedModel {
  public readonly showComponentsProperty = new BooleanProperty(true);
  public readonly showFieldLinesProperty = new BooleanProperty(false);
  public readonly showProtractorProperty = new BooleanProperty(false);
  public readonly showAnglesProperty = new BooleanProperty(true);

  public reset(): void {
    this.showComponentsProperty.reset();
    this.showFieldLinesProperty.reset();
    this.showProtractorProperty.reset();
    this.showAnglesProperty.reset();
  }
}
