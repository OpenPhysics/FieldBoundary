/**
 * vectorLanes.test.ts
 *
 * The lane offset exists to separate E, D and P visually. It must not become a
 * way to distort them: it may move an arrow sideways, never lengthen or rotate
 * it, or the drawn angles stop agreeing with the θ readout and the protractor —
 * the same invariant `transform.test.ts` guards for the transform itself.
 */
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  BOUND_LANE,
  COMPANION_LANE,
  laneOffset,
  PRIMARY_LANE,
  projectionCorners,
} from "../../../src/common/view/vectorLanes.js";
import { VECTOR_LANE_SPACING } from "../../../src/FieldBoundaryConstants.js";

describe("vector lanes", () => {
  it("leaves the primary on the true anchor", () => {
    expect(laneOffset(new Vector2(3, -4), PRIMARY_LANE).magnitude).toBe(0);
  });

  it("offsets by exactly one lane spacing, perpendicular to the arrow", () => {
    for (const delta of [new Vector2(3, -4), new Vector2(-10, 0), new Vector2(0, 7), new Vector2(1.5, 2.5)]) {
      for (const lane of [COMPANION_LANE, BOUND_LANE]) {
        const offset = laneOffset(delta, lane);
        expect(offset.magnitude).toBeCloseTo(VECTOR_LANE_SPACING, 9);
        expect(offset.dot(delta)).toBeCloseTo(0, 9);
      }
    }
  });

  it("puts the companion and bound lanes on opposite sides", () => {
    const delta = new Vector2(3, -4);
    const companion = laneOffset(delta, COMPANION_LANE);
    const bound = laneOffset(delta, BOUND_LANE);
    expect(companion.plus(bound).magnitude).toBeCloseTo(0, 9);
  });

  it("shifts an arrow without changing its length or angle", () => {
    const tail = new Vector2(100, 200);
    const tip = new Vector2(160, 120);
    const shift = laneOffset(tip.minus(tail), COMPANION_LANE);
    const shifted = tip.plus(shift).minus(tail.plus(shift));
    expect(shifted.magnitude).toBeCloseTo(tip.minus(tail).magnitude, 9);
    expect(shifted.angle).toBeCloseTo(tip.minus(tail).angle, 9);
  });

  it("keeps a given lane on one side of the ray for both media", () => {
    // Medium 1 draws origin → tip; medium 2 draws tail → origin with the arrow
    // pointing the same way. Passing each arrow's own tail→tip vector must put
    // them on the same side, or D would jump across E at the interface.
    const field = new Vector2(60, -80);
    const medium1 = laneOffset(field, COMPANION_LANE);
    const medium2 = laneOffset(field, COMPANION_LANE);
    expect(medium1.equals(medium2)).toBe(true);
  });

  it("does not offset a degenerate arrow", () => {
    expect(laneOffset(new Vector2(0, 0), COMPANION_LANE).magnitude).toBe(0);
  });
});

describe("projection rectangle", () => {
  const origin = new Vector2(400, 350);

  it("spans the component magnitudes whatever lane the arrow is in", () => {
    // The edge spans ARE the Eₜ / Eₙ readings a student takes off the screen.
    // Shifting `far` onto a lane without shifting `corner` with it would stretch
    // or shrink them by up to one lane spacing — a silent measurement error.
    const far = new Vector2(520, 210);
    const expectedTangential = Math.abs(far.x - origin.x);
    const expectedNormal = Math.abs(far.y - origin.y);

    for (const lane of [PRIMARY_LANE, COMPANION_LANE, BOUND_LANE]) {
      const rect = projectionCorners(far, origin, far.minus(origin), lane);
      expect(Math.abs(rect.far.x - rect.corner.x)).toBeCloseTo(expectedTangential, 9);
      expect(Math.abs(rect.far.y - rect.corner.y)).toBeCloseTo(expectedNormal, 9);
    }
  });

  it("gives medium 1 and medium 2 equal spans for a continuous component", () => {
    // E₁ₜ = E₂ₜ must draw as two segments of the same length. Medium 2's arrow
    // runs tail→origin, so its far end is the negated field.
    const tangential = 130;
    const normal1 = 96;
    const normal2 = 41;
    const far1 = origin.plusXY(tangential, -normal1);
    const far2 = origin.plusXY(-tangential, normal2);

    const rect1 = projectionCorners(far1, origin, far1.minus(origin), COMPANION_LANE);
    const rect2 = projectionCorners(far2, origin, origin.minus(far2), COMPANION_LANE);

    expect(Math.abs(rect1.far.x - rect1.corner.x)).toBeCloseTo(Math.abs(rect2.far.x - rect2.corner.x), 9);
    expect(Math.abs(rect1.far.y - rect1.corner.y)).toBeCloseTo(normal1, 9);
    expect(Math.abs(rect2.far.y - rect2.corner.y)).toBeCloseTo(normal2, 9);
  });

  it("leaves the primary rectangle cornered exactly on the origin", () => {
    const far = new Vector2(520, 210);
    const rect = projectionCorners(far, origin, far.minus(origin), PRIMARY_LANE);
    expect(rect.corner.equals(origin)).toBe(true);
    expect(rect.far.equals(far)).toBe(true);
  });
});
