/**
 * vectorLanes.ts
 *
 * E, D and P (dually H, B and M) are collinear by construction —
 * D = εᵣE and P = (εᵣ − 1)E are scaled copies of E — so drawing all three from
 * the same anchor puts them on one ray: the shortest vanishes under the longest
 * and only the tips and labels tell them apart.
 *
 * Each quantity is therefore drawn in its own *lane*: the same ray shifted
 * sideways by a fixed number of view pixels perpendicular to the field
 * direction. Primary sits on lane 0 (the true anchor, so the drag knob and the
 * component projections still meet the origin), companion on +1, bound on −1.
 *
 * The shift is cosmetic and magnitude-independent: it moves whole arrows, never
 * their length or angle, so protractor and θ readout stay honest.
 */
import { Vector2 } from "scenerystack/dot";
import { VECTOR_LANE_SPACING } from "../../FieldBoundaryConstants.js";

/** Lane index for each drawn quantity. */
export const PRIMARY_LANE = 0;
export const COMPANION_LANE = 1;
export const BOUND_LANE = -1;

/**
 * View-space offset that moves an arrow onto `lane`.
 *
 * `viewDelta` is the arrow's own tail→tip vector in view coordinates, so
 * medium-1 and medium-2 arrows — which point the same way — land on the same
 * side of the ray. A degenerate (zero-length) arrow gets no offset.
 */
export function laneOffset(viewDelta: Vector2, lane: number): Vector2 {
  if (lane === 0 || viewDelta.magnitude < 1e-6) {
    return Vector2.ZERO;
  }
  return viewDelta.perpendicular.normalized().timesScalar(lane * VECTOR_LANE_SPACING);
}

/**
 * The two opposite corners of a field's projection rectangle in view space:
 * `far` is the far end of its arrow (the tip in medium 1, the tail in medium 2)
 * and `corner` is the origin end. The rectangle's edges — drawn as the dashed
 * Eₜ / Eₙ projections — run between them.
 *
 * Both corners move onto the lane *together*. That is the whole contract: the
 * edge spans, which a student reads as the component magnitudes, must not
 * depend on which lane the arrow happens to be drawn in.
 */
export function projectionCorners(
  farView: Vector2,
  originView: Vector2,
  arrowDirection: Vector2,
  lane: number,
): { far: Vector2; corner: Vector2 } {
  const shift = laneOffset(arrowDirection, lane);
  return { far: farView.plus(shift), corner: originView.plus(shift) };
}
