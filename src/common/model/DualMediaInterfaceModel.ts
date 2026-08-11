/**
 * DualMediaInterfaceModel.ts
 *
 * Shared skeleton for Electric / Magnetic interface models: relative material
 * parameters, free-source Property, primary angle/magnitude, presets, and tip drag.
 * Subclasses own public aliases (e1/h1, …) and implement refraction writeback.
 */
import { Multilink, NumberProperty, type Property, StringProperty, type UnknownMultilink } from "scenerystack/axon";
import { type Range, Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { DEFAULT_FIELD_ANGLE, DEFAULT_FIELD_MAGNITUDE } from "../../FieldBoundaryConstants.js";
import { angleFromNormal, clampAngle, fieldFromPolar } from "./interfaceFields.js";
import { type MaterialPreset, type MaterialPresetId, presetById } from "./MaterialPresets.js";
import { SharedModel } from "./SharedModel.js";

export type DualMediaInterfaceModelConfig = {
  defaultParam1: number;
  defaultParam2: number;
  defaultMedium1Preset: MaterialPresetId;
  defaultMedium2Preset: MaterialPresetId;
  /** εᵣ presets on Electric, μᵣ presets on Magnetic. */
  presets: readonly MaterialPreset[];
  /** εᵣ range on Electric, μᵣ range on Magnetic. */
  parameterRange: Range;
  freeSourceDefault: number;
  freeSourceRange: Range;
};

export abstract class DualMediaInterfaceModel implements TModel {
  public readonly shared = new SharedModel();

  public readonly param1Property: NumberProperty;
  public readonly param2Property: NumberProperty;
  public readonly freeSourceProperty: NumberProperty;
  public readonly parameterRange: Range;
  public readonly presets: readonly MaterialPreset[];

  public readonly medium1PresetProperty: Property<MaterialPresetId>;
  public readonly medium2PresetProperty: Property<MaterialPresetId>;

  public readonly primaryAngleProperty = new NumberProperty(DEFAULT_FIELD_ANGLE);
  public readonly primaryMagnitudeProperty = new NumberProperty(DEFAULT_FIELD_MAGNITUDE);

  public readonly primary1Property = new Vector2Property(fieldFromPolar(DEFAULT_FIELD_MAGNITUDE, DEFAULT_FIELD_ANGLE));
  public readonly primary2Property = new Vector2Property(new Vector2(0, 0));
  public readonly companion1Property = new Vector2Property(new Vector2(0, 0));
  public readonly companion2Property = new Vector2Property(new Vector2(0, 0));

  private applyingPreset = false;
  private fieldMultilink: UnknownMultilink | null = null;

  protected constructor(config: DualMediaInterfaceModelConfig) {
    this.parameterRange = config.parameterRange;
    this.presets = config.presets;
    this.param1Property = new NumberProperty(config.defaultParam1, { range: config.parameterRange });
    this.param2Property = new NumberProperty(config.defaultParam2, { range: config.parameterRange });
    this.freeSourceProperty = new NumberProperty(config.freeSourceDefault, {
      range: config.freeSourceRange,
    });
    this.medium1PresetProperty = new StringProperty(config.defaultMedium1Preset) as Property<MaterialPresetId>;
    this.medium2PresetProperty = new StringProperty(config.defaultMedium2Preset) as Property<MaterialPresetId>;

    this.medium1PresetProperty.link((id) => this.applyPreset(1, id));
    this.medium2PresetProperty.link((id) => this.applyPreset(2, id));
  }

  /**
   * Wire primary → refracted Multilink. Call from the subclass constructor after
   * any extra Properties (e.g. polarization) used by applyRefraction exist.
   */
  protected connectFieldMultilink(): void {
    this.fieldMultilink = Multilink.multilink(
      [
        this.primaryAngleProperty,
        this.primaryMagnitudeProperty,
        this.param1Property,
        this.param2Property,
        this.freeSourceProperty,
      ],
      (angle, magnitude, param1, param2, freeSource) => {
        const primary1 = fieldFromPolar(magnitude, angle);
        this.primary1Property.value = primary1;
        this.applyRefraction(primary1, param1, param2, freeSource);
      },
    );
  }

  /**
   * Write derived primary2 / companion fields (and any screen-specific extras)
   * from the primary field and material / free-source parameters.
   */
  protected abstract applyRefraction(primary1: Vector2, param1: number, param2: number, freeSource: number): void;

  /** Set primary angle from a medium-1 tip (model coords); magnitude stays fixed. */
  public setPrimaryFromTip(tip: Vector2): void {
    const y = Math.max(0.2, tip.y);
    this.primaryAngleProperty.value = clampAngle(Math.atan2(tip.x, y));
  }

  public get theta1(): number {
    return angleFromNormal(this.primary1Property.value);
  }

  public get theta2(): number {
    return angleFromNormal(this.primary2Property.value);
  }

  private applyPreset(medium: 1 | 2, id: MaterialPresetId): void {
    if (id === "custom") {
      return;
    }
    const preset = presetById(this.presets, id);
    if (!preset) {
      return;
    }
    const value = this.parameterRange.constrainValue(preset.value);
    this.applyingPreset = true;
    if (medium === 1) {
      this.param1Property.value = value;
    } else {
      this.param2Property.value = value;
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
    this.param1Property.reset();
    this.param2Property.reset();
    this.freeSourceProperty.reset();
    this.medium1PresetProperty.reset();
    this.medium2PresetProperty.reset();
    this.primaryAngleProperty.reset();
    this.primaryMagnitudeProperty.reset();
  }

  /**
   * Release every AXON listener this model owns. Exercised by the memory-leak
   * suite: the field Multilink is registered on the parameter Properties, so
   * without disposing it the whole model stays reachable.
   */
  public dispose(): void {
    this.fieldMultilink?.dispose();
    this.fieldMultilink = null;
    this.shared.dispose();
    this.param1Property.dispose();
    this.param2Property.dispose();
    this.freeSourceProperty.dispose();
    this.medium1PresetProperty.dispose();
    this.medium2PresetProperty.dispose();
    this.primaryAngleProperty.dispose();
    this.primaryMagnitudeProperty.dispose();
    this.primary1Property.dispose();
    this.primary2Property.dispose();
    this.companion1Property.dispose();
    this.companion2Property.dispose();
  }

  public step(_dt: number): void {
    // Static boundary-condition visualization — no time evolution.
  }
}
