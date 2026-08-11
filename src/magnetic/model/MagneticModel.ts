/**
 * MagneticModel.ts
 *
 * Magnetic interface: drag H₁ angle/magnitude; derive H₂, B₁, B₂ from μᵣ.
 */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import { DualMediaInterfaceModel } from "../../common/model/DualMediaInterfaceModel.js";
import { refractMagnetic } from "../../common/model/interfaceFields.js";
import { MAGNETIC_PRESETS } from "../../common/model/MaterialPresets.js";
import {
  DEFAULT_MU1,
  DEFAULT_MU2,
  DEFAULT_SURFACE_CURRENT,
  MAGNETIC_PARAMETER_RANGE,
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

  /** Magnetization M = (μᵣ − 1) H in each medium (dual of P). */
  public readonly m1Property = new Vector2Property(new Vector2(0, 0));
  public readonly m2Property = new Vector2Property(new Vector2(0, 0));

  /** Bound surface current K_b = M₂ₜ − M₁ₜ on the interface (dual of σ_b). */
  public readonly boundCurrentProperty = new NumberProperty(0);

  /**
   * Show magnetization arrows and bound-current glyphs (magnetic-only tool).
   * Default off, matching the Electric screen's bound-charge layer.
   */
  public readonly showBoundCurrentProperty = new BooleanProperty(false);

  public constructor() {
    super({
      defaultParam1: DEFAULT_MU1,
      defaultParam2: DEFAULT_MU2,
      defaultMedium1Preset: "air",
      defaultMedium2Preset: "custom",
      presets: MAGNETIC_PRESETS,
      parameterRange: MAGNETIC_PARAMETER_RANGE,
      freeSourceDefault: DEFAULT_SURFACE_CURRENT,
      freeSourceRange: SURFACE_CURRENT_RANGE,
    });
    this.connectFieldMultilink();
  }

  protected applyRefraction(primary1: Vector2, mu1: number, mu2: number, surfaceCurrent: number): void {
    const refracted = refractMagnetic(primary1, mu1, mu2, surfaceCurrent);
    this.h2Property.value = refracted.h2;
    this.b1Property.value = refracted.b1;
    this.b2Property.value = refracted.b2;
    this.m1Property.value = refracted.m1;
    this.m2Property.value = refracted.m2;
    this.boundCurrentProperty.value = refracted.boundCurrent;
  }

  public setH1FromTip(tip: Vector2): void {
    this.setPrimaryFromTip(tip);
  }

  public override reset(): void {
    super.reset();
    this.showBoundCurrentProperty.reset();
  }

  public override dispose(): void {
    super.dispose();
    this.m1Property.dispose();
    this.m2Property.dispose();
    this.boundCurrentProperty.dispose();
    this.showBoundCurrentProperty.dispose();
  }
}
