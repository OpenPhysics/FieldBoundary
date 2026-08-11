/**
 * BoundaryVectorsNode.ts
 *
 * Primary + companion field arrows in each medium. The primary tip in medium 1
 * is draggable (angle only; magnitude comes from the model slider).
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
} from "../../FieldBoundaryConstants.js";

export type BoundaryVectorsNodeOptions = {
  primaryProperty: TReadOnlyProperty<Vector2>;
  companionProperty: TReadOnlyProperty<Vector2>;
  transmittedPrimaryProperty: TReadOnlyProperty<Vector2>;
  transmittedCompanionProperty: TReadOnlyProperty<Vector2>;
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

    const primary1 = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT,
      tailWidth: ARROW_TAIL_WIDTH,
      stroke: null,
      fill: options.primaryColorProperty,
    });
    const companion1 = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH - 2,
      headHeight: ARROW_HEAD_HEIGHT - 2,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: null,
      fill: options.companionColorProperty,
      opacity: 0.85,
    });
    const primary2 = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT,
      tailWidth: ARROW_TAIL_WIDTH,
      stroke: null,
      fill: options.primaryColorProperty,
    });
    const companion2 = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH - 2,
      headHeight: ARROW_HEAD_HEIGHT - 2,
      tailWidth: COMPANION_ARROW_TAIL_WIDTH,
      stroke: null,
      fill: options.companionColorProperty,
      opacity: 0.85,
    });

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
    this.children = [companion1, companion2, primary1, primary2, p1Label, c1Label, p2Label, c2Label, knob];

    const companionScale = (c1: Vector2, c2: Vector2): number => {
      const maxLen = Math.max(c1.magnitude, c2.magnitude, 1e-6);
      const primaryMax = Math.max(
        options.primaryProperty.value.magnitude,
        options.transmittedPrimaryProperty.value.magnitude,
        1e-6,
      );
      return Math.min(1, (primaryMax * 1.15) / maxLen);
    };

    const setArrow = (arrow: ArrowNode, physicsTip: Vector2): Vector2 => {
      const tipView = modelViewTransform.modelToViewPosition(physicsTip);
      arrow.setTailAndTip(originView.x, originView.y, tipView.x, tipView.y);
      return tipView;
    };

    // Medium-2 fields physically point toward +n̂ (up, into medium 1) so the field
    // is continuous across the boundary. To draw them in the lower half-plane we
    // anchor the tip at the interface and put the tail at the negated physics
    // vector; the arrow then points along the field, matching medium 1. For equal
    // media the two arrows are parallel, forming one continuous field line.
    const setArrowMedium2 = (arrow: ArrowNode, physics: Vector2): Vector2 => {
      const tailView = modelViewTransform.modelToViewPosition(physics.timesScalar(-1));
      arrow.setTailAndTip(tailView.x, tailView.y, originView.x, originView.y);
      return tailView;
    };

    const update = (): void => {
      const p1 = options.primaryProperty.value;
      const c1 = options.companionProperty.value;
      const p2 = options.transmittedPrimaryProperty.value;
      const c2 = options.transmittedCompanionProperty.value;
      const scale = companionScale(c1, c2);

      const tipP1 = setArrow(primary1, p1);
      const tipC1 = setArrow(companion1, c1.timesScalar(scale));
      const tailP2 = setArrowMedium2(primary2, p2);
      const tailC2 = setArrowMedium2(companion2, c2.timesScalar(scale));

      knob.center = tipP1;
      p1Label.leftBottom = tipP1.plusXY(12, -4);
      c1Label.leftTop = tipC1.plusXY(12, 4);
      p2Label.leftTop = tailP2.plusXY(12, 4);
      c2Label.leftBottom = tailC2.plusXY(12, -4);
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
