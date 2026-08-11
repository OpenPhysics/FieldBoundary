/**
 * ElectricModel.ts
 *
 * Electric interface: drag E₁ angle/magnitude; derive E₂, D₁, D₂ from εᵣ.
 */
import { Multilink, NumberProperty, type Property, StringProperty } from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { angleFromNormal, clampAngle, fieldFromPolar, refractElectric } from "../../common/model/interfaceFields.js";
import { type MaterialPresetId, presetById } from "../../common/model/MaterialPresets.js";
import { SharedModel } from "../../common/model/SharedModel.js";
import {
  DEFAULT_EPS1,
  DEFAULT_EPS2,
  DEFAULT_FIELD_ANGLE,
  DEFAULT_FIELD_MAGNITUDE,
  DEFAULT_SURFACE_CHARGE,
  RELATIVE_PARAMETER_RANGE,
  SURFACE_CHARGE_RANGE,
} from "../../FieldBoundaryConstants.js";

export class ElectricModel implements TModel {
  public readonly shared = new SharedModel();

  public readonly eps1Property = new NumberProperty(DEFAULT_EPS1, {
    range: RELATIVE_PARAMETER_RANGE,
  });
  public readonly eps2Property = new NumberProperty(DEFAULT_EPS2, {
    range: RELATIVE_PARAMETER_RANGE,
  });

  /** Free surface charge density σ_f on the interface (default: none). */
  public readonly surfaceChargeProperty = new NumberProperty(DEFAULT_SURFACE_CHARGE, {
    range: SURFACE_CHARGE_RANGE,
  });

  public readonly medium1PresetProperty = new StringProperty("vacuum") as Property<MaterialPresetId>;
  public readonly medium2PresetProperty = new StringProperty("glass") as Property<MaterialPresetId>;

  public readonly e1AngleProperty = new NumberProperty(DEFAULT_FIELD_ANGLE);
  public readonly e1MagnitudeProperty = new NumberProperty(DEFAULT_FIELD_MAGNITUDE);

  public readonly e1Property = new Vector2Property(fieldFromPolar(DEFAULT_FIELD_MAGNITUDE, DEFAULT_FIELD_ANGLE));
  public readonly e2Property = new Vector2Property(new Vector2(0, 0));
  public readonly d1Property = new Vector2Property(new Vector2(0, 0));
  public readonly d2Property = new Vector2Property(new Vector2(0, 0));

  private applyingPreset = false;

  public constructor() {
    Multilink.multilink(
      [
        this.e1AngleProperty,
        this.e1MagnitudeProperty,
        this.eps1Property,
        this.eps2Property,
        this.surfaceChargeProperty,
      ],
      (angle, magnitude, eps1, eps2, sigmaF) => {
        const e1 = fieldFromPolar(magnitude, angle);
        const refracted = refractElectric(e1, eps1, eps2, sigmaF);
        this.e1Property.value = e1;
        this.e2Property.value = refracted.e2;
        this.d1Property.value = refracted.d1;
        this.d2Property.value = refracted.d2;
      },
    );

    this.medium1PresetProperty.link((id) => this.applyPreset(1, id));
    this.medium2PresetProperty.link((id) => this.applyPreset(2, id));
  }

  /** Set E₁ from a medium-1 tip (model coords); magnitude stays fixed. */
  public setE1FromTip(tip: Vector2): void {
    const y = Math.max(0.2, tip.y);
    this.e1AngleProperty.value = clampAngle(Math.atan2(tip.x, y));
  }

  public get theta1(): number {
    return angleFromNormal(this.e1Property.value);
  }

  public get theta2(): number {
    return angleFromNormal(this.e2Property.value);
  }

  private applyPreset(medium: 1 | 2, id: MaterialPresetId): void {
    if (id === "custom") {
      return;
    }
    const preset = presetById(id);
    if (!preset) {
      return;
    }
    const value = Math.min(RELATIVE_PARAMETER_RANGE.max, preset.epsr);
    this.applyingPreset = true;
    if (medium === 1) {
      this.eps1Property.value = value;
    } else {
      this.eps2Property.value = value;
    }
    this.applyingPreset = false;
  }

  /** Mark the matching medium as custom when the user moves a slider. */
  public markCustom(medium: 1 | 2): void {
    if (this.applyingPreset) {
      return;
    }
    if (medium === 1) {
      this.medium1PresetProperty.value = "custom";
    } else {
      this.medium2PresetProperty.value = "custom";
    }
  }

  public reset(): void {
    this.shared.reset();
    this.eps1Property.reset();
    this.eps2Property.reset();
    this.surfaceChargeProperty.reset();
    this.medium1PresetProperty.reset();
    this.medium2PresetProperty.reset();
    this.e1AngleProperty.reset();
    this.e1MagnitudeProperty.reset();
  }

  public step(_dt: number): void {
    // Static boundary-condition visualization — no time evolution.
  }
}
