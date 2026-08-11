/**
 * BoundaryVectorsNode.ts
 *
 * Primary + companion field arrows in each medium. The primary tip in medium 1
 * is draggable (angle only; magnitude comes from the model slider).
 *
 * The companion (D / B) is a scaled copy of the primary, so it is drawn one
 * lane to the side and as a hollow outline rather than a solid arrow — see
 * `vectorLanes.ts`. Without both, the two arrows are one indistinguishable
 * stack on a single ray.
 */
import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { Color } from "scenerystack/scenery";
import { Circle, Node, RichDragListener, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  ARROW_HEAD_HEIGHT,
  ARROW_HEAD_WIDTH,
  ARROW_TAIL_WIDTH,
  COMPANION_ARROW_TAIL_WIDTH,
  COMPANION_SCALE_HEADROOM,
} from "../../FieldBoundaryConstants.js";
import { displayScale, formatScaleBadge } from "./displayScale.js";
import { COMPANION_LANE, laneOffset, PRIMARY_LANE } from "./vectorLanes.js";

export type BoundaryVectorsNodeOptions = {
  primaryProperty: TReadOnlyProperty<Vector2>;
  companionProperty: TReadOnlyProperty<Vector2>;
  transmittedPrimaryProperty: TReadOnlyProperty<Vector2>;
  transmittedCompanionProperty: TReadOnlyProperty<Vector2>;
  showPrimaryProperty: TReadOnlyProperty<boolean>;
  showCompanionProperty: TReadOnlyProperty<boolean>;
  primaryColorProperty: TReadOnlyProperty<Color>;
  companionColorProperty: TReadOnlyProperty<Color>;
  primary1Label: TReadOnlyProperty<string>;
  primary2Label: TReadOnlyProperty<string>;
  companion1Label: TReadOnlyProperty<string>;
  companion2Label: TReadOnlyProperty<string>;
  dragAccessibleName: TReadOnlyProperty<string>;
  onPrimaryTip: (tipModel: Vector2) => void;
};

export class BoundaryVectorsNode extends Node {
  public readonly dragHandle: Node;

  public constructor(modelViewTransform: ModelViewTransform2, options: BoundaryVectorsNodeOptions) {
    super();

    const originView = modelViewTransform.modelToViewPosition(new Vector2(0, 0));

    // Solid = the field you drag. Hollow outline = the quantity derived from it.
    // The fill/outline contrast is what still separates D from E when a student
    // is looking at the arrowheads rather than the tails.
    const primaryArrowOptions = {
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT,
      tailWidth: ARROW_TAIL_WIDTH,
      stroke: null,
      fill: options.primaryColorProperty,
    };
    const companionArrowOptions = {
      headWidth: ARROW_HEAD_WIDTH - 2,
      headHeight: ARROW_HEAD_HEIGHT - 2,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: options.companionColorProperty,
      lineWidth: 1.8,
      fill: null,
    };
    const primary1 = new ArrowNode(0, 0, 0, 0, primaryArrowOptions);
    const companion1 = new ArrowNode(0, 0, 0, 0, companionArrowOptions);
    const primary2 = new ArrowNode(0, 0, 0, 0, primaryArrowOptions);
    const companion2 = new ArrowNode(0, 0, 0, 0, companionArrowOptions);

    const labelFont = new PhetFont({ size: 16, weight: "bold" });
    const p1Label = new Text(options.primary1Label, {
      font: labelFont,
      fill: options.primaryColorProperty,
    });
    const c1Label = new Text(options.companion1Label, {
      font: labelFont,
      fill: options.companionColorProperty,
    });
    const p2Label = new Text(options.primary2Label, {
      font: labelFont,
      fill: options.primaryColorProperty,
    });
    const c2Label = new Text(options.companion2Label, {
      font: labelFont,
      fill: options.companionColorProperty,
    });

    // The companion arrows are shrunk to stay on screen at large εᵣ / μᵣ. Say so
    // on screen — otherwise the drawn lengths invite a false |D| : |E| reading.
    const badgeFont = new PhetFont(11);
    const c1ScaleBadge = new Text("", { font: badgeFont, fill: options.companionColorProperty });
    const c2ScaleBadge = new Text("", { font: badgeFont, fill: options.companionColorProperty });

    const knob = new Circle(10, {
      cursor: "pointer",
      fill: options.primaryColorProperty,
      stroke: FieldBoundaryColors.dragKnobStrokeProperty,
      lineWidth: 1,
      tagName: "div",
      focusable: true,
      accessibleName: options.dragAccessibleName,
    });

    this.dragHandle = knob;
    // Only the knob takes input. This layer is drawn ABOVE the medium panels so
    // the tip stays grabbable at large magnitude (it otherwise lands under the
    // upper-right panel around θ ≈ 40–65°), and non-pickable arrows and labels
    // mean crossing a panel does not steal that panel's clicks.
    for (const decoration of [primary1, primary2, companion1, companion2]) {
      decoration.pickable = false;
    }
    for (const label of [p1Label, p2Label, c1Label, c2Label, c1ScaleBadge, c2ScaleBadge]) {
      label.pickable = false;
    }

    // Grouped into per-quantity layers so a toggle flips one Node rather than
    // each member: `update` below still writes `.visible` on the scale badges,
    // and writing that on a node whose own visibleProperty is bound to a shared
    // toggle would flip the toggle itself.
    const companionLayer = new Node({
      visibleProperty: options.showCompanionProperty,
      children: [companion1, companion2, c1Label, c2Label, c1ScaleBadge, c2ScaleBadge],
    });
    const primaryLayer = new Node({
      visibleProperty: options.showPrimaryProperty,
      children: [primary1, primary2, p1Label, p2Label],
    });
    // Knob last and always visible: it is the only way to change the field
    // angle, so hiding the primary arrow must not take the control away with it.
    this.children = [companionLayer, primaryLayer, knob];

    // `lane` shifts the whole arrow sideways so collinear quantities do not
    // stack; it never changes the arrow's length or angle. Lane 0 keeps the
    // primary on the true anchor, where the drag knob and the component
    // projections expect it.
    const setArrow = (arrow: ArrowNode, physicsTip: Vector2, lane: number): Vector2 => {
      const tipView = modelViewTransform.modelToViewPosition(physicsTip);
      const shift = laneOffset(tipView.minus(originView), lane);
      const tail = originView.plus(shift);
      const tip = tipView.plus(shift);
      arrow.setTailAndTip(tail.x, tail.y, tip.x, tip.y);
      return tip;
    };

    // Medium-2 fields physically point toward +n̂ (up, into medium 1) so the field
    // is continuous across the boundary. To draw them in the lower half-plane we
    // anchor the tip at the interface and put the tail at the negated physics
    // vector; the arrow then points along the field, matching medium 1. For equal
    // media the two arrows are parallel, forming one continuous field line.
    const setArrowMedium2 = (arrow: ArrowNode, physics: Vector2, lane: number): Vector2 => {
      const tailView = modelViewTransform.modelToViewPosition(physics.timesScalar(-1));
      // Offset from the arrow's own tail→tip direction, which points the same way
      // as its medium-1 partner — so a given lane stays on one side of the ray
      // across the whole picture.
      const shift = laneOffset(originView.minus(tailView), lane);
      const tail = tailView.plus(shift);
      const tip = originView.plus(shift);
      arrow.setTailAndTip(tail.x, tail.y, tip.x, tip.y);
      return tail;
    };

    const update = (): void => {
      const p1 = options.primaryProperty.value;
      const c1 = options.companionProperty.value;
      const p2 = options.transmittedPrimaryProperty.value;
      const c2 = options.transmittedCompanionProperty.value;
      const scale = displayScale([c1, c2], [p1, p2], COMPANION_SCALE_HEADROOM);

      const tipP1 = setArrow(primary1, p1, PRIMARY_LANE);
      const tipC1 = setArrow(companion1, c1.timesScalar(scale), COMPANION_LANE);
      const tailP2 = setArrowMedium2(primary2, p2, PRIMARY_LANE);
      const tailC2 = setArrowMedium2(companion2, c2.timesScalar(scale), COMPANION_LANE);

      knob.center = tipP1;
      p1Label.leftBottom = tipP1.plusXY(12, -4);
      c1Label.leftTop = tipC1.plusXY(12, 4);
      p2Label.leftTop = tailP2.plusXY(12, 4);
      c2Label.leftBottom = tailC2.plusXY(12, -4);

      const badge = formatScaleBadge(scale);
      c1ScaleBadge.string = badge;
      c2ScaleBadge.string = badge;
      c1ScaleBadge.visible = badge.length > 0;
      c2ScaleBadge.visible = badge.length > 0;
      c1ScaleBadge.leftTop = c1Label.leftBottom.plusXY(0, 1);
      c2ScaleBadge.leftBottom = c2Label.leftTop.plusXY(0, -1);
    };

    Multilink.multilink(
      [
        options.primaryProperty,
        options.companionProperty,
        options.transmittedPrimaryProperty,
        options.transmittedCompanionProperty,
      ],
      update,
    );

    const applyDrag = (viewPoint: Vector2): void => {
      const modelTip = modelViewTransform.viewToModelPosition(viewPoint);
      options.onPrimaryTip(modelTip);
    };

    knob.addInputListener(
      new RichDragListener({
        dragListenerOptions: {
          drag: (event) => {
            applyDrag(knob.globalToParentPoint(event.pointer.point));
          },
        },
        keyboardDragListenerOptions: {
          dragSpeed: 80,
          shiftDragSpeed: 30,
          drag: (_event, listener) => {
            applyDrag(knob.center.plus(listener.modelDelta));
          },
        },
      }),
    );
  }
}
