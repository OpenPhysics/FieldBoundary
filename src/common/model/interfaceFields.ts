/**
 * interfaceFields.ts
 *
 * Pure Maxwell planar-interface helpers. Supports optional free surface charge
 * (σ_f) and free surface current (K_f). Uses relative εᵣ / μᵣ with ε₀ = μ₀ = 1
 * in sim units.
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
 * Electric BC with free surface charge density σ_f on the interface:
 *   E₂ₜ = E₁ₜ                          (tangential E always continuous)
 *   ε₁E₁ₙ − ε₂E₂ₙ = σ_f                (Dₙ − σ_f jump; n̂ from medium 2 → 1)
 *   E₂ₙ = (ε₁E₁ₙ − σ_f) / ε₂
 *   Dᵢ = εᵢ Eᵢ
 *
 * σ_f defaults to 0, recovering the source-free BC E₂ₙ = (ε₁/ε₂)E₁ₙ.
 */
export function refractElectric(
  e1: Vector2,
  eps1: number,
  eps2: number,
  sigmaF = 0,
): { e2: Vector2; d1: Vector2; d2: Vector2; p1: Vector2; p2: Vector2; sigmaB: number } {
  const e2 = new Vector2(e1.x, (e1.y * eps1 - sigmaF) / eps2);
  const d1 = e1.timesScalar(eps1);
  const d2 = e2.timesScalar(eps2);
  const p1 = polarization(e1, eps1);
  const p2 = polarization(e2, eps2);
  return {
    e2,
    d1,
    d2,
    p1,
    p2,
    sigmaB: boundSurfaceCharge(p1, p2),
  };
}

/**
 * Polarization in a linear dielectric: P = (εᵣ − 1) E  (ε₀ = 1).
 * Vacuum (εᵣ = 1) has P = 0.
 */
export function polarization(e: Vector2, eps: number): Vector2 {
  return e.timesScalar(eps - 1);
}

/**
 * Bound surface charge on the interface with n̂ from medium 2 → 1:
 *   σ_b = P₁ₙ − P₂ₙ
 * Related identity: E₁ₙ − E₂ₙ = σ_f − σ_b  (and D₁ₙ − D₂ₙ = σ_f).
 */
export function boundSurfaceCharge(p1: Vector2, p2: Vector2): number {
  return p1.y - p2.y;
}

/**
 * Magnetic BC with free surface current density K_f (scalar along +ẑ, out of
 * the t–n page). With n̂ = +ŷ (from medium 2 into medium 1):
 *   n̂ × (H₁ − H₂) = K_f ẑ   ⇒   H₂ₜ = H₁ₜ + K_f
 *   B₁ₙ = B₂ₙ                (normal B always continuous)
 *   H₂ₙ = (μ₁ / μ₂) H₁ₙ
 *   Bᵢ = μᵢ Hᵢ
 *
 * K_f defaults to 0, recovering the source-free BC H₂ₜ = H₁ₜ.
 */
export function refractMagnetic(
  h1: Vector2,
  mu1: number,
  mu2: number,
  surfaceCurrent = 0,
): { h2: Vector2; b1: Vector2; b2: Vector2 } {
  const h2 = new Vector2(h1.x + surfaceCurrent, (h1.y * mu1) / mu2);
  return {
    h2,
    b1: h1.timesScalar(mu1),
    b2: h2.timesScalar(mu2),
  };
}

/**
 * Reflect a medium-2 physics vector (Et, En) across the interface into the lower
 * half-plane as (Et, -En). Used only by component-axis overlays that project
 * component magnitudes onto the t/n axes on each side of the boundary.
 *
 * NOT used for field arrows or field lines: those anchor medium-2 vectors with
 * their tip at the interface so the field reads as continuous (pointing toward
 * +n̂), matching medium 1 — see BoundaryVectorsNode / FieldLinesNode.
 */
export function medium2DisplayVector(physics: Vector2): Vector2 {
  return new Vector2(physics.x, -physics.y);
}
