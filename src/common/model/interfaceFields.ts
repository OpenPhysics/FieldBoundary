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
): { h2: Vector2; b1: Vector2; b2: Vector2; m1: Vector2; m2: Vector2; boundCurrent: number } {
  const h2 = new Vector2(h1.x + surfaceCurrent, (h1.y * mu1) / mu2);
  const m1 = magnetization(h1, mu1);
  const m2 = magnetization(h2, mu2);
  return {
    h2,
    b1: h1.timesScalar(mu1),
    b2: h2.timesScalar(mu2),
    m1,
    m2,
    boundCurrent: boundSurfaceCurrent(m1, m2),
  };
}

/**
 * Magnetization in a linear magnetic medium: M = (μᵣ − 1) H  (μ₀ = 1).
 * Vacuum / air (μᵣ = 1) has M = 0. Dual of `polarization`.
 */
export function magnetization(h: Vector2, mu: number): Vector2 {
  return h.timesScalar(mu - 1);
}

/**
 * Bound surface current on the interface (scalar along +ẑ), with n̂ from
 * medium 2 → 1:
 *   K_b = (M₂ − M₁) × n̂ · ẑ = M₂ₜ − M₁ₜ
 *
 * Dual of σ_b = P₁ₙ − P₂ₙ. Related identity: B₂ₜ − B₁ₜ = K_f + K_b, i.e. the
 * tangential B jump is the total (free + bound) surface current, exactly as the
 * normal E jump is the total (free + bound) surface charge.
 */
export function boundSurfaceCurrent(m1: Vector2, m2: Vector2): number {
  return m2.x - m1.x;
}

/**
 * Outward D-flux through a Gaussian pillbox of width `width` and half-height
 * `halfHeight` straddling the interface, plus the free charge it encloses.
 * Gauss's law for D: ∮ D·dA = Q_f,enc.
 */
export function pillboxFlux(
  d1: Vector2,
  d2: Vector2,
  sigmaF: number,
  width: number,
  halfHeight: number,
): InterfaceBoxTally {
  // Top face: outward n̂ = +ŷ, in medium 1. Bottom face: outward −ŷ, in medium 2.
  const top = d1.y * width;
  const bottom = -d2.y * width;
  // Side faces run through both media; outward ±x̂. They are equal and opposite
  // for uniform fields, and each vanishes as the box collapses (halfHeight → 0).
  const right = (d1.x + d2.x) * halfHeight;
  return tally(top, bottom, right, sigmaF * width);
}

/**
 * Circulation of H counterclockwise (with ẑ out of the page) around an Amperian
 * loop of width `width` and half-height `halfHeight` straddling the interface,
 * plus the free current it encloses. Ampère's law for H: ∮ H·dl = I_f,enc.
 */
export function amperianCirculation(
  h1: Vector2,
  h2: Vector2,
  surfaceCurrent: number,
  width: number,
  halfHeight: number,
): InterfaceBoxTally {
  // Counterclockwise: bottom leg along +x̂ in medium 2, top leg along −x̂ in
  // medium 1, right leg along +ŷ, left leg along −ŷ.
  const top = -h1.x * width;
  const bottom = h2.x * width;
  const right = (h1.y + h2.y) * halfHeight;
  return tally(top, bottom, right, surfaceCurrent * width);
}

/**
 * Per-face (pillbox) or per-leg (loop) contributions. `sides` is identically
 * zero for uniform fields; `right` and `left` are reported separately because
 * watching each one shrink as the box collapses is the point of the tool.
 */
export type InterfaceBoxTally = {
  top: number;
  bottom: number;
  right: number;
  left: number;
  sides: number;
  total: number;
  enclosedFree: number;
};

function tally(top: number, bottom: number, right: number, enclosedFree: number): InterfaceBoxTally {
  const left = -right;
  return {
    top,
    bottom,
    right,
    left,
    sides: right + left,
    total: top + bottom + right + left,
    enclosedFree,
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
