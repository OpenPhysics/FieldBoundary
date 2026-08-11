/**
 * fluxTally.ts
 *
 * Live per-face (pillbox) / per-leg (loop) tally for the Gauss / Ampère tool.
 * Shared by the in-play box and its readout panel so both read one source.
 */
import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { amperianCirculation, type InterfaceBoxTally, pillboxFlux } from "../model/interfaceFields.js";

export type FluxTallyMode = "electric" | "magnetic";

/**
 * @param mode - electric ⇒ ∮D·dA = Q_f,enc; magnetic ⇒ ∮H·dl = I_f,enc
 * @param field1Property - D₁ (electric) or H₁ (magnetic)
 * @param field2Property - D₂ (electric) or H₂ (magnetic)
 */
export function createFluxTallyProperty(
  mode: FluxTallyMode,
  field1Property: TReadOnlyProperty<Vector2>,
  field2Property: TReadOnlyProperty<Vector2>,
  freeSourceProperty: TReadOnlyProperty<number>,
  halfHeightProperty: TReadOnlyProperty<number>,
  width: number,
): TReadOnlyProperty<InterfaceBoxTally> {
  return new DerivedProperty(
    [field1Property, field2Property, freeSourceProperty, halfHeightProperty],
    (field1, field2, freeSource, halfHeight) =>
      mode === "electric"
        ? pillboxFlux(field1, field2, freeSource, width, halfHeight)
        : amperianCirculation(field1, field2, freeSource, width, halfHeight),
  );
}

/** Two-decimal signed formatting, with "0.00" instead of "-0.00". */
export function formatTallyValue(value: number): string {
  const rounded = Math.abs(value) < 5e-3 ? 0 : value;
  return rounded.toFixed(2);
}
