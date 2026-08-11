/**
 * angleArcs.test.ts
 *
 * The play-area θ arcs must span the same angle-from-normal the readout
 * reports. Guards the canvas-angle helpers AngleArcsNode uses: medium 1 from
 * straight up, medium 2 from straight down along the drawn body.
 */
import { describe, expect, it } from "vitest";
import { angleFromNormal, fieldFromPolar } from "../../../src/common/model/interfaceFields.js";
import { medium1ViewAngle, medium2ViewAngle, shortArcAnticlockwise } from "../../../src/common/view/AngleArcsNode.js";

describe("angle arc view angles", () => {
  it("puts normal incidence on the surface normal in each medium", () => {
    expect(medium1ViewAngle(0)).toBeCloseTo(-Math.PI / 2);
    expect(medium2ViewAngle(0)).toBeCloseTo(Math.PI / 2);
  });

  it("spans exactly θ between the normal and the field ray", () => {
    for (const theta of [-Math.PI / 3, -0.2, 0.4, Math.PI / 5]) {
      expect(medium1ViewAngle(theta) - medium1ViewAngle(0)).toBeCloseTo(theta);
      expect(medium2ViewAngle(theta) - medium2ViewAngle(0)).toBeCloseTo(theta);
    }
  });

  it("matches angleFromNormal on the physics vectors the arcs track", () => {
    for (const theta of [-0.7, 0, 0.5]) {
      const field = fieldFromPolar(2, theta);
      expect(angleFromNormal(field)).toBeCloseTo(theta);
    }
  });

  it("takes the short wedge, not the long way around the circle", () => {
    // Canvas angles increase clockwise: θ > 0 ⇒ clockwise arc (anticlockwise false).
    expect(shortArcAnticlockwise(0.5)).toBe(false);
    expect(shortArcAnticlockwise(-0.5)).toBe(true);
  });
});
