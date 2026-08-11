/**
 * MagneticsModel.ts
 *
 * Magnetic interface: drag H₁ angle/magnitude; derive H₂, B₁, B₂ from μᵣ.
 */
import { Multilink, NumberProperty, type Property, StringProperty } from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { angleFromNormal, clampAngle, fieldFromPolar, refractMagnetic } from "../../common/model/interfaceFields.js";
import { type MaterialPresetId, presetById } from "../../common/model/MaterialPresets.js";
import { SharedModel } from "../../common/model/SharedModel.js";
import {
  DEFAULT_FIELD_ANGLE,
  DEFAULT_FIELD_MAGNITUDE,
  DEFAULT_MU1,
  DEFAULT_MU2,
  RELATIVE_PARAMETER_RANGE,
} from "../../FieldBoundaryConstants.js";

export class MagneticsModel implements TModel {
  public readonly shared = new SharedModel();

  public readonly mu1Property = new NumberProperty(DEFAULT_MU1, {
    range: RELATIVE_PARAMETER_RANGE,
  });
  public readonly mu2Property = new NumberProperty(DEFAULT_MU2, {
    range: RELATIVE_PARAMETER_RANGE,
  });

  public readonly medium1PresetProperty = new StringProperty("vacuum") as Property<MaterialPresetId>;
  public readonly medium2PresetProperty = new StringProperty("highK") as Property<MaterialPresetId>;

  public readonly h1AngleProperty = new NumberProperty(DEFAULT_FIELD_ANGLE);
  public readonly h1MagnitudeProperty = new NumberProperty(DEFAULT_FIELD_MAGNITUDE);

  public readonly h1Property = new Vector2Property(fieldFromPolar(DEFAULT_FIELD_MAGNITUDE, DEFAULT_FIELD_ANGLE));
  public readonly h2Property = new Vector2Property(new Vector2(0, 0));
  public readonly b1Property = new Vector2Property(new Vector2(0, 0));
  public readonly b2Property = new Vector2Property(new Vector2(0, 0));

  private applyingPreset = false;

  public constructor() {
    Multilink.multilink(
      [this.h1AngleProperty, this.h1MagnitudeProperty, this.mu1Property, this.mu2Property],
      (angle, magnitude, mu1, mu2) => {
        const h1 = fieldFromPolar(magnitude, angle);
        const refracted = refractMagnetic(h1, mu1, mu2);
        this.h1Property.value = h1;
        this.h2Property.value = refracted.h2;
        this.b1Property.value = refracted.b1;
        this.b2Property.value = refracted.b2;
      },
    );

    this.medium1PresetProperty.link((id) => this.applyPreset(1, id));
    this.medium2PresetProperty.link((id) => this.applyPreset(2, id));
  }

  public setH1FromTip(tip: Vector2): void {
    const y = Math.max(0.2, tip.y);
    this.h1AngleProperty.value = clampAngle(Math.atan2(tip.x, y));
  }

  public get theta1(): number {
    return angleFromNormal(this.h1Property.value);
  }

  public get theta2(): number {
    return angleFromNormal(this.h2Property.value);
  }

  private applyPreset(medium: 1 | 2, id: MaterialPresetId): void {
    if (id === "custom") {
      return;
    }
    const preset = presetById(id);
    if (!preset) {
      return;
    }
    const value = Math.min(RELATIVE_PARAMETER_RANGE.max, preset.mur);
    this.applyingPreset = true;
    if (medium === 1) {
      this.mu1Property.value = value;
    } else {
      this.mu2Property.value = value;
    }
    this.applyingPreset = false;
  }

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
    this.mu1Property.reset();
    this.mu2Property.reset();
    this.medium1PresetProperty.reset();
    this.medium2PresetProperty.reset();
    this.h1AngleProperty.reset();
    this.h1MagnitudeProperty.reset();
  }

  public step(_dt: number): void {
    // Static boundary-condition visualization — no time evolution.
  }
}
