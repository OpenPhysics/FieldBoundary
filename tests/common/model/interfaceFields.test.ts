/**
 * interfaceFields.test.ts
 */
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  angleFromNormal,
  fieldFromPolar,
  medium2DisplayVector,
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
});
