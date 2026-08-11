/**
 * interfaceFields.test.ts
 */
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  angleFromNormal,
  boundSurfaceCharge,
  fieldFromPolar,
  medium2DisplayVector,
  polarization,
  refractElectric,
  refractMagnetic,
} from "../../../src/common/model/interfaceFields.js";

describe("interfaceFields", () => {
  it("refractElectric keeps Et continuous and scales En by ε₁/ε₂", () => {
    const e1 = new Vector2(1.2, 2.4);
    const { e2, d1, d2 } = refractElectric(e1, 1, 4);
    expect(e2.x).toBeCloseTo(1.2);
    expect(e2.y).toBeCloseTo(0.6);
    expect(d1.y).toBeCloseTo(d2.y);
    expect(d1.x).toBeCloseTo(1.2);
    expect(d2.x).toBeCloseTo(4.8); // ε₂ E₂ₜ = 4 × 1.2
  });

  it("refractMagnetic keeps Ht continuous and scales Hn by μ₁/μ₂", () => {
    const h1 = new Vector2(0.8, 1.6);
    const { h2, b1, b2 } = refractMagnetic(h1, 2, 8);
    expect(h2.x).toBeCloseTo(0.8);
    expect(h2.y).toBeCloseTo(0.4);
    expect(b1.y).toBeCloseTo(b2.y);
  });

  it("fieldFromPolar uses angle from the normal", () => {
    const field = fieldFromPolar(2, 0);
    expect(field.x).toBeCloseTo(0);
    expect(field.y).toBeCloseTo(2);
    expect(angleFromNormal(field)).toBeCloseTo(0);
  });

  it("medium2DisplayVector flips the normal for drawing", () => {
    const display = medium2DisplayVector(new Vector2(1, 2));
    expect(display.x).toBeCloseTo(1);
    expect(display.y).toBeCloseTo(-2);
  });

  it("satisfies tanθ₂/tanθ₁ = ε₂/ε₁ for E field lines", () => {
    const e1 = fieldFromPolar(2, Math.PI / 5);
    const { e2 } = refractElectric(e1, 1, 4);
    const tanRatio = Math.tan(angleFromNormal(e2)) / Math.tan(angleFromNormal(e1));
    expect(tanRatio).toBeCloseTo(4, 5);
  });

  it("keeps E and D continuous (same direction) across the boundary when ε₁=ε₂", () => {
    const e1 = fieldFromPolar(2, Math.PI / 5);
    const { e2, d1, d2 } = refractElectric(e1, 3, 3);
    expect(e2.equals(e1)).toBe(true);
    expect(d2.equals(d1)).toBe(true);
  });

  it("keeps H and B continuous (same direction) across the boundary when μ₁=μ₂", () => {
    const h1 = fieldFromPolar(2, Math.PI / 5);
    const { h2, b1, b2 } = refractMagnetic(h1, 5, 5);
    expect(h2.equals(h1)).toBe(true);
    expect(b2.equals(b1)).toBe(true);
  });

  it("refractElectric with σ_f keeps Eₜ continuous and jumps Dₙ by σ_f", () => {
    const e1 = new Vector2(1.2, 2.4);
    const sigmaF = 1.5;
    const { e2, d1, d2 } = refractElectric(e1, 1, 4, sigmaF);
    // Tangential E continuous.
    expect(e2.x).toBeCloseTo(1.2);
    // E₂ₙ = (ε₁E₁ₙ − σ_f)/ε₂ = (2.4 − 1.5)/4.
    expect(e2.y).toBeCloseTo((2.4 - sigmaF) / 4);
    // Dₙ jump: ε₁E₁ₙ − ε₂E₂ₙ = σ_f.
    expect(d1.y - d2.y).toBeCloseTo(sigmaF);
    // Tangential D still scales with ε; D₂ₜ = ε₂ E₂ₜ.
    expect(d2.x).toBeCloseTo(4 * 1.2);
  });

  it("positive σ_f can reverse E₂ₙ (field points away from medium 1)", () => {
    const e1 = new Vector2(0, 1);
    const { e2 } = refractElectric(e1, 1, 2, 3);
    expect(e2.y).toBeLessThan(0);
    expect(e2.y).toBeCloseTo((1 - 3) / 2);
  });

  it("refractElectric with σ_f = 0 matches the source-free BC", () => {
    const e1 = new Vector2(1.2, 2.4);
    const sourced = refractElectric(e1, 1, 4, 0);
    const free = refractElectric(e1, 1, 4);
    expect(sourced.e2.equals(free.e2)).toBe(true);
    expect(sourced.d2.equals(free.d2)).toBe(true);
  });

  it("refractMagnetic with K_f keeps Bₙ continuous and jumps Hₜ by K_f", () => {
    const h1 = new Vector2(0.8, 1.6);
    const kf = 0.5;
    const { h2, b1, b2 } = refractMagnetic(h1, 2, 8, kf);
    // H₂ₜ = H₁ₜ + K_f.
    expect(h2.x).toBeCloseTo(0.8 + kf);
    // H₂ₙ still scales by μ₁/μ₂.
    expect(h2.y).toBeCloseTo(1.6 * (2 / 8));
    // Normal B continuous.
    expect(b1.y).toBeCloseTo(b2.y);
    // Tangential H jump present.
    expect(h2.x - h1.x).toBeCloseTo(kf);
  });

  it("refractMagnetic with K_f = 0 matches the source-free BC", () => {
    const h1 = new Vector2(0.8, 1.6);
    const sourced = refractMagnetic(h1, 2, 8, 0);
    const free = refractMagnetic(h1, 2, 8);
    expect(sourced.h2.equals(free.h2)).toBe(true);
    expect(sourced.b2.equals(free.b2)).toBe(true);
  });

  it("polarization is (ε − 1)E and vanishes in vacuum", () => {
    const e = new Vector2(1, 2);
    expect(polarization(e, 1).equals(new Vector2(0, 0))).toBe(true);
    expect(polarization(e, 4).x).toBeCloseTo(3);
    expect(polarization(e, 4).y).toBeCloseTo(6);
  });

  it("bound σ_b explains the Eₙ jump: E₁ₙ − E₂ₙ = σ_f − σ_b", () => {
    const e1 = new Vector2(1.2, 2.4);
    const sigmaF = 0.75;
    const { e2, p1, p2, sigmaB } = refractElectric(e1, 1, 4, sigmaF);
    expect(sigmaB).toBeCloseTo(boundSurfaceCharge(p1, p2));
    expect(e1.y - e2.y).toBeCloseTo(sigmaF - sigmaB);
  });

  it("with σ_f = 0, Eₙ jump equals −σ_b and Dₙ stays continuous", () => {
    const e1 = fieldFromPolar(2, Math.PI / 5);
    const { e2, d1, d2, sigmaB } = refractElectric(e1, 1, 4, 0);
    expect(d1.y).toBeCloseTo(d2.y);
    expect(e1.y - e2.y).toBeCloseTo(-sigmaB);
  });

  it("equal dielectrics have zero bound charge when σ_f = 0", () => {
    const e1 = fieldFromPolar(2, Math.PI / 5);
    const { sigmaB, p1, p2 } = refractElectric(e1, 3, 3, 0);
    expect(sigmaB).toBeCloseTo(0);
    expect(p1.equals(p2)).toBe(true);
  });
});
