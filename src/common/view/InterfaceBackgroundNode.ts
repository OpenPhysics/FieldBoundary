/**
 * InterfaceBackgroundNode.ts
 *
 * Two half-plane media with a dashed interface and a surface-normal guide.
 */
import type { Property } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Line, Node, Rectangle } from "scenerystack/scenery";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { MODEL_HALF_HEIGHT, MODEL_HALF_WIDTH } from "../../FieldBoundaryConstants.js";

export class InterfaceBackgroundNode extends Node {
  public constructor(modelViewTransform: ModelViewTransform2, showNormalProperty: Property<boolean>) {
    super();

    const topLeft = modelViewTransform.modelToViewPosition(new Vector2(-MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT));
    const topRight = modelViewTransform.modelToViewPosition(new Vector2(MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT));
    const origin = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    const bottomLeft = modelViewTransform.modelToViewPosition(new Vector2(-MODEL_HALF_WIDTH, -MODEL_HALF_HEIGHT));
    const bottomRight = modelViewTransform.modelToViewPosition(new Vector2(MODEL_HALF_WIDTH, -MODEL_HALF_HEIGHT));

    // Inverted-Y mapping: larger model y is smaller view y.
    const medium1 = new Rectangle(
      Math.min(topLeft.x, bottomLeft.x),
      Math.min(topLeft.y, origin.y),
      Math.abs(topRight.x - topLeft.x),
      Math.abs(origin.y - topLeft.y),
      { fill: FieldBoundaryColors.medium1FillProperty },
    );
    const medium2 = new Rectangle(
      Math.min(bottomLeft.x, topLeft.x),
      Math.min(origin.y, bottomLeft.y),
      Math.abs(bottomRight.x - bottomLeft.x),
      Math.abs(bottomLeft.y - origin.y),
      { fill: FieldBoundaryColors.medium2FillProperty },
    );

    const interfaceLine = new Line(
      Math.min(topLeft.x, topRight.x),
      origin.y,
      Math.max(topLeft.x, topRight.x),
      origin.y,
      {
        stroke: FieldBoundaryColors.interfaceStrokeProperty,
        lineWidth: 3,
        lineDash: [10, 8],
      },
    );

    const normalTop = modelViewTransform.modelToViewPosition(new Vector2(0, MODEL_HALF_HEIGHT * 0.85));
    const normalBottom = modelViewTransform.modelToViewPosition(new Vector2(0, -MODEL_HALF_HEIGHT * 0.85));
    const normalLine = new Line(normalTop.x, normalTop.y, normalBottom.x, normalBottom.y, {
      stroke: FieldBoundaryColors.normalStrokeProperty,
      lineWidth: 1.5,
      lineDash: [6, 5],
      visibleProperty: showNormalProperty,
    });

    this.children = [medium1, medium2, interfaceLine, normalLine];
  }
}
