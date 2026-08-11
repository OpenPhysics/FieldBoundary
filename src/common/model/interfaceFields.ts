/**
 * interfaceFields.ts
 *
 * Pure Maxwell planar-interface helpers (no free surface charge/current).
 * Uses relative εᵣ / μᵣ with ε₀ = μ₀ = 1 in sim units.
 *
 * Convention: n̂ = +ŷ points from medium 2 into medium 1. Tangential = x.
 * Primary angle θ is measured from n̂ toward +x̂ (atan2(Et, En)).
 */

import { Vector2 } from "scenerystack/dot";
import { MAX_FIELD_ANGLE } from "../../FieldBoundaryConstants.js";

/** Build a primary field from magnitude and angle-from-normal. */
export function fieldFromPolar(magnitude: number, angle: number): Vector2 {
  const theta = clampAngle(angle);
  return new Vector2(magnitude * Math.sin(theta), magnitude * Math.cos(theta));
}

/** Angle from the interface normal for a physics vector (Et, En). */
export function angleFromNormal(field: Vector2): number {
  return Math.atan2(field.x, field.y);
}

export function clampAngle(angle: number): number {
  return Math.max(-MAX_FIELD_ANGLE, Math.min(MAX_FIELD_ANGLE, angle));
}

/**
 * Electric BC with σ_f = 0:
 *   E₂ₜ = E₁ₜ
 *   E₂ₙ = (ε₁ / ε₂) E₁ₙ
 *   Dᵢ = εᵢ Eᵢ
 */
export function refractElectric(e1: Vector2, eps1: number, eps2: number): { e2: Vector2; d1: Vector2; d2: Vector2 } {
  const e2 = new Vector2(e1.x, e1.y * (eps1 / eps2));
  return {
    e2,
    d1: e1.timesScalar(eps1),
    d2: e2.timesScalar(eps2),
  };
}

/**
 * Magnetic BC with K_f = 0:
 *   H₂ₜ = H₁ₜ
 *   H₂ₙ = (μ₁ / μ₂) H₁ₙ
 *   Bᵢ = μᵢ Hᵢ
 */
export function refractMagnetic(h1: Vector2, mu1: number, mu2: number): { h2: Vector2; b1: Vector2; b2: Vector2 } {
  const h2 = new Vector2(h1.x, h1.y * (mu1 / mu2));
  return {
    h2,
    b1: h1.timesScalar(mu1),
    b2: h2.timesScalar(mu2),
  };
}

/**
 * Display tip for a medium-2 physics vector (Et, En): flip the normal so the
 * arrow is drawn into the lower half-plane while preserving Et and |En|.
 */
export function medium2DisplayVector(physics: Vector2): Vector2 {
  return new Vector2(physics.x, -physics.y);
}
