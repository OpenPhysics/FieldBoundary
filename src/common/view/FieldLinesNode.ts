/**
 * FieldLinesNode.ts
 *
 * Straight field-line segments in each half-plane that kink at the interface
 * (uniform fields ⇒ piecewise-linear lines).
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { CanvasNode } from "scenerystack/scenery";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { FIELD_LINE_COUNT, MODEL_HALF_HEIGHT, MODEL_HALF_WIDTH } from "../../FieldBoundaryConstants.js";

export class FieldLinesNode extends CanvasNode {
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly primary1Property: TReadOnlyProperty<Vector2>;
  private readonly primary2Property: TReadOnlyProperty<Vector2>;

  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: Property<boolean>,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    canvasBounds: Bounds2,
  ) {
    super({ canvasBounds, visibleProperty });
    this.modelViewTransform = modelViewTransform;
    this.primary1Property = primary1Property;
    this.primary2Property = primary2Property;

    const repaint = (): void => this.invalidatePaint();
    Multilink.multilink([primary1Property, primary2Property], repaint);
    FieldBoundaryColors.fieldLineColorProperty.link(repaint);
  }

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    const p1 = this.primary1Property.value;
    const p2 = this.primary2Property.value;
    if (p1.magnitude < 1e-6 || p2.magnitude < 1e-6) {
      return;
    }

    const dir1 = p1.normalized();
    // Medium-2 field lines share the physics direction (pointing toward +n̂), so
    // they are continuous with medium 1 across the interface (straight for equal
    // media, kinked when ε₁≠ε₂). clipRay handles drawing the segment into the
    // lower half-plane from this direction.
    const dir2 = p2.normalized();
    const mvt = this.modelViewTransform;

    context.strokeStyle = FieldBoundaryColors.fieldLineColorProperty.value.toCSS();
    context.lineWidth = 1.5;
    context.globalAlpha = 0.75;

    const xMin = -MODEL_HALF_WIDTH * 0.92;
    const xMax = MODEL_HALF_WIDTH * 0.92;
    for (let i = 0; i < FIELD_LINE_COUNT; i++) {
      const t = (i + 0.5) / FIELD_LINE_COUNT;
      const xBoundary = xMin + t * (xMax - xMin);

      const top = clipRay(new Vector2(xBoundary, 0), dir1, 0, MODEL_HALF_HEIGHT, true);
      const bottom = clipRay(new Vector2(xBoundary, 0), dir2, -MODEL_HALF_HEIGHT, 0, false);

      context.beginPath();
      if (top) {
        const a = mvt.modelToViewPosition(top.start);
        const b = mvt.modelToViewPosition(top.end);
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
      }
      if (bottom) {
        const a = mvt.modelToViewPosition(bottom.start);
        const b = mvt.modelToViewPosition(bottom.end);
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
      }
      context.stroke();
    }

    context.globalAlpha = 1;
  }
}

type Segment = { start: Vector2; end: Vector2 };

function clipRay(origin: Vector2, dir: Vector2, yMin: number, yMax: number, upward: boolean): Segment | null {
  const sense = upward ? (dir.y >= 0 ? 1 : -1) : dir.y <= 0 ? 1 : -1;
  const d = dir.timesScalar(sense);
  if (Math.abs(d.y) < 1e-9) {
    const y = upward ? Math.min(yMax, 0.4) : Math.max(yMin, -0.4);
    const start = new Vector2(origin.x, y);
    const end = new Vector2(origin.x + Math.sign(d.x || 1) * 0.8, y);
    return { start, end };
  }

  const targetY = upward ? yMax : yMin;
  const s = (targetY - origin.y) / d.y;
  let end = origin.plus(d.timesScalar(s));
  if (end.x > MODEL_HALF_WIDTH) {
    const sx = (MODEL_HALF_WIDTH - origin.x) / d.x;
    end = origin.plus(d.timesScalar(sx));
  } else if (end.x < -MODEL_HALF_WIDTH) {
    const sx = (-MODEL_HALF_WIDTH - origin.x) / d.x;
    end = origin.plus(d.timesScalar(sx));
  }
  return { start: origin.copy(), end };
}
