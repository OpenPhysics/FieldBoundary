/**
 * AngleArcsNode.ts
 *
 * θ₁ / θ₂ arcs from the surface normal to each primary field, drawn when the
 * Angles tool is on. The readout already reports the numbers; the arcs make
 * the "from the vertical" convention visible in the play area itself.
 *
 * Medium 1: arc in the upper half between +n̂ (up) and E₁ / H₁.
 * Medium 2: arc in the lower half between −n̂ (down) and the drawn field line
 * (tip at the interface). Both span the same |θ| the readout shows.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { Color } from "scenerystack/scenery";
import { Node, Path, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { angleFromNormal } from "../model/interfaceFields.js";

/** View-pixel radius of each θ arc. */
const ARC_RADIUS = 52;

/** Below this |θ| the wedge is invisible — hide the arc rather than a speck. */
const MIN_ARC_ANGLE = (2 * Math.PI) / 180;

/**
 * Canvas / view angle of the medium-1 field ray (0 = +x, +angle toward +y,
 * which is down on screen). Equals θ − π/2, so θ = 0 sits on the upward normal.
 */
export function medium1ViewAngle(theta: number): number {
  return theta - Math.PI / 2;
}

/**
 * Canvas / view angle of the medium-2 field body leaving the origin into
 * medium 2 (along −field). Equals π/2 + θ, so θ = 0 sits on the downward normal.
 */
export function medium2ViewAngle(theta: number): number {
  return Math.PI / 2 + theta;
}

/**
 * `Shape.arc` anticlockwise flag for the *short* wedge from the normal to the
 * field. Canvas angles increase clockwise, so θ > 0 (field angle greater than
 * the normal's) uses the clockwise arc.
 */
export function shortArcAnticlockwise(theta: number): boolean {
  return theta < 0;
}

export type AngleArcsNodeOptions = {
  visibleProperty: Property<boolean>;
  primary1Property: TReadOnlyProperty<Vector2>;
  primary2Property: TReadOnlyProperty<Vector2>;
  colorProperty: TReadOnlyProperty<Color>;
};

export class AngleArcsNode extends Node {
  public constructor(modelViewTransform: ModelViewTransform2, options: AngleArcsNodeOptions) {
    super({ visibleProperty: options.visibleProperty, pickable: false });

    const origin = modelViewTransform.modelToViewPosition(new Vector2(0, 0));

    const arcOptions = {
      stroke: options.colorProperty,
      lineWidth: 1.5,
      pickable: false,
    };
    const arc1 = new Path(null, arcOptions);
    const arc2 = new Path(null, arcOptions);

    const labelFont = new PhetFont({ size: 14, weight: "bold" });
    const label1 = new Text("θ₁", { font: labelFont, fill: options.colorProperty, pickable: false });
    const label2 = new Text("θ₂", { font: labelFont, fill: options.colorProperty, pickable: false });

    this.children = [arc1, arc2, label1, label2];

    const setArc = (
      path: Path,
      label: Text,
      /** Canvas angle of the normal ray in this medium (up or down). */
      normalViewAngle: number,
      /** Canvas angle of the field ray in this medium. */
      fieldViewAngle: number,
      theta: number,
    ): void => {
      const show = Math.abs(theta) >= MIN_ARC_ANGLE;
      path.visible = show;
      label.visible = show;
      if (!show) {
        return;
      }

      // Canvas angles increase clockwise (y down). For θ > 0, fieldViewAngle >
      // normalViewAngle, so the short wedge is the clockwise arc — anticlockwise
      // false. The opposite flag draws the long way around (nearly a full circle).
      path.shape = new Shape()
        .moveTo(origin.x + ARC_RADIUS * Math.cos(normalViewAngle), origin.y + ARC_RADIUS * Math.sin(normalViewAngle))
        .arc(origin.x, origin.y, ARC_RADIUS, normalViewAngle, fieldViewAngle, shortArcAnticlockwise(theta));

      const mid = 0.5 * (normalViewAngle + fieldViewAngle);
      const labelR = ARC_RADIUS + 16;
      label.center = new Vector2(origin.x + labelR * Math.cos(mid), origin.y + labelR * Math.sin(mid));
    };

    Multilink.multilink([options.primary1Property, options.primary2Property], (p1, p2) => {
      const t1 = angleFromNormal(p1);
      const t2 = angleFromNormal(p2);
      setArc(arc1, label1, medium1ViewAngle(0), medium1ViewAngle(t1), t1);
      setArc(arc2, label2, medium2ViewAngle(0), medium2ViewAngle(t2), t2);
    });
  }
}
