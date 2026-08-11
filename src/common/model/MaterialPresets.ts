/**
 * MaterialPresets.ts
 *
 * Named relative-permittivity / permeability presets for the media panels.
 */

export type MaterialPresetId = "vacuum" | "water" | "glass" | "highK" | "custom";

export type MaterialPreset = {
  readonly id: MaterialPresetId;
  readonly epsr: number;
  readonly mur: number;
};

export const MATERIAL_PRESETS: readonly MaterialPreset[] = [
  { id: "vacuum", epsr: 1, mur: 1 },
  { id: "water", epsr: 80, mur: 1 }, // clamped by slider max when applied
  { id: "glass", epsr: 5, mur: 1 },
  { id: "highK", epsr: 20, mur: 8 },
];

export function presetById(id: MaterialPresetId): MaterialPreset | null {
  return MATERIAL_PRESETS.find((p) => p.id === id) ?? null;
}
