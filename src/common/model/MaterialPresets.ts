/**
 * MaterialPresets.ts
 *
 * Named material presets for the media panels. The two screens have separate
 * lists: a shared list would be degenerate on the Magnetic screen, where every
 * ordinary dielectric has μᵣ ≈ 1 and three of four entries would be
 * indistinguishable from vacuum.
 *
 * Each list ends in a limiting case (conductor-like / ferromagnet) so the
 * pedagogically interesting extreme is one click away rather than a slider
 * hunt; selecting one fires the limiting-case callout in the play area.
 */

export type MaterialPresetId =
  // Electric
  | "vacuum"
  | "glass"
  | "water"
  | "conductor"
  // Magnetic
  | "air"
  | "ferrite"
  | "iron"
  | "muMetal"
  // Both
  | "custom";

export type MaterialPreset = {
  readonly id: MaterialPresetId;
  /** εᵣ on the Electric screen, μᵣ on the Magnetic screen. */
  readonly value: number;
  /** True for the extreme entries that name a limiting case when selected. */
  readonly limitingCase?: boolean;
};

/** Relative permittivity εᵣ presets (Electric screen). */
export const ELECTRIC_PRESETS: readonly MaterialPreset[] = [
  { id: "vacuum", value: 1 },
  { id: "glass", value: 5 },
  { id: "water", value: 80 },
  { id: "conductor", value: 1000, limitingCase: true },
];

/**
 * Relative permeability μᵣ presets (Magnetic screen). Real magnetic materials
 * span four decades, which is the whole reason μ is interesting.
 */
export const MAGNETIC_PRESETS: readonly MaterialPreset[] = [
  { id: "air", value: 1 },
  { id: "ferrite", value: 1000 },
  { id: "iron", value: 5000 },
  { id: "muMetal", value: 20000, limitingCase: true },
];

export function presetById(presets: readonly MaterialPreset[], id: MaterialPresetId): MaterialPreset | null {
  return presets.find((p) => p.id === id) ?? null;
}
