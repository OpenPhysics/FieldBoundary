/**
 * MagneticModel.ts
 *
 * Magnetic interface: drag H₁ angle/magnitude; derive H₂, B₁, B₂ from μᵣ.
 */
import type { Vector2 } from "scenerystack/dot";
import { DualMediaInterfaceModel } from "../../common/model/DualMediaInterfaceModel.js";
import { refractMagnetic } from "../../common/model/interfaceFields.js";
import {
  DEFAULT_MU1,
  DEFAULT_MU2,
  DEFAULT_SURFACE_CURRENT,
  SURFACE_CURRENT_RANGE,
} from "../../FieldBoundaryConstants.js";

export class MagneticModel extends DualMediaInterfaceModel {
  /** Relative permeability μᵣ in medium 1 (alias of param1Property). */
  public readonly mu1Property = this.param1Property;
  /** Relative permeability μᵣ in medium 2 (alias of param2Property). */
  public readonly mu2Property = this.param2Property;

  /** Free surface current density K_f on the interface (+ẑ, out of page). */
  public readonly surfaceCurrentProperty = this.freeSourceProperty;

  public readonly h1AngleProperty = this.primaryAngleProperty;
  public readonly h1MagnitudeProperty = this.primaryMagnitudeProperty;

  public readonly h1Property = this.primary1Property;
  public readonly h2Property = this.primary2Property;
  public readonly b1Property = this.companion1Property;
  public readonly b2Property = this.companion2Property;

  public constructor() {
    super({
      defaultParam1: DEFAULT_MU1,
      defaultParam2: DEFAULT_MU2,
      defaultMedium2Preset: "highK",
      freeSourceDefault: DEFAULT_SURFACE_CURRENT,
      freeSourceRange: SURFACE_CURRENT_RANGE,
      presetParameter: (preset) => preset.mur,
    });
    this.connectFieldMultilink();
  }

  protected applyRefraction(primary1: Vector2, mu1: number, mu2: number, surfaceCurrent: number): void {
    const refracted = refractMagnetic(primary1, mu1, mu2, surfaceCurrent);
    this.h2Property.value = refracted.h2;
    this.b1Property.value = refracted.b1;
    this.b2Property.value = refracted.b2;
  }

  public setH1FromTip(tip: Vector2): void {
    this.setPrimaryFromTip(tip);
  }
}
