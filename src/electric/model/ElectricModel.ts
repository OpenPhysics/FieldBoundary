/**
 * ElectricModel.ts
 *
 * Electric interface: drag E₁ angle/magnitude; derive E₂, D₁, D₂ from εᵣ.
 */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import { DualMediaInterfaceModel } from "../../common/model/DualMediaInterfaceModel.js";
import { refractElectric } from "../../common/model/interfaceFields.js";
import {
  DEFAULT_EPS1,
  DEFAULT_EPS2,
  DEFAULT_SURFACE_CHARGE,
  SURFACE_CHARGE_RANGE,
} from "../../FieldBoundaryConstants.js";

export class ElectricModel extends DualMediaInterfaceModel {
  /** Relative permittivity εᵣ in medium 1 (alias of param1Property). */
  public readonly eps1Property = this.param1Property;
  /** Relative permittivity εᵣ in medium 2 (alias of param2Property). */
  public readonly eps2Property = this.param2Property;

  /** Free surface charge density σ_f on the interface (default: none). */
  public readonly surfaceChargeProperty = this.freeSourceProperty;

  public readonly e1AngleProperty = this.primaryAngleProperty;
  public readonly e1MagnitudeProperty = this.primaryMagnitudeProperty;

  public readonly e1Property = this.primary1Property;
  public readonly e2Property = this.primary2Property;
  public readonly d1Property = this.companion1Property;
  public readonly d2Property = this.companion2Property;

  /** Polarization P = (εᵣ − 1) E in each medium. */
  public readonly p1Property = new Vector2Property(new Vector2(0, 0));
  public readonly p2Property = new Vector2Property(new Vector2(0, 0));

  /** Bound surface charge σ_b = P₁ₙ − P₂ₙ on the interface. */
  public readonly boundChargeProperty = new NumberProperty(0);

  /**
   * Show polarization arrows and bound-charge glyphs (electric-only tool).
   * Default on.
   */
  public readonly showBoundChargeProperty = new BooleanProperty(true);

  public constructor() {
    super({
      defaultParam1: DEFAULT_EPS1,
      defaultParam2: DEFAULT_EPS2,
      defaultMedium2Preset: "glass",
      freeSourceDefault: DEFAULT_SURFACE_CHARGE,
      freeSourceRange: SURFACE_CHARGE_RANGE,
      presetParameter: (preset) => preset.epsr,
    });
    this.connectFieldMultilink();
  }

  protected applyRefraction(primary1: Vector2, eps1: number, eps2: number, sigmaF: number): void {
    const refracted = refractElectric(primary1, eps1, eps2, sigmaF);
    this.e2Property.value = refracted.e2;
    this.d1Property.value = refracted.d1;
    this.d2Property.value = refracted.d2;
    this.p1Property.value = refracted.p1;
    this.p2Property.value = refracted.p2;
    this.boundChargeProperty.value = refracted.sigmaB;
  }

  /** Set E₁ from a medium-1 tip (model coords); magnitude stays fixed. */
  public setE1FromTip(tip: Vector2): void {
    this.setPrimaryFromTip(tip);
  }

  public override reset(): void {
    super.reset();
    this.showBoundChargeProperty.reset();
  }
}
