/**
 * ComponentOverlayNode.ts
 *
 * Dashed Et / En projections for the primary and companion fields in both media.
 * Continuous components are highlighted; free components stay muted.
 *
 * Which components stay continuous depends on the free source:
 *   Electric (σ_f): Eₜ always continuous; Dₙ continuous only when σ_f = 0.
 *   Magnetic (K_f): Bₙ always continuous; Hₜ continuous only when K_f = 0.
 *
 * ── Where the projections are drawn ───────────────────────────────────────────
 * Each field's components are the two edges of its projection rectangle that
 * meet at the *far end of its own arrow* — the tip in medium 1, the tail in
 * medium 2 — not the two edges lying on the t and n axes through the origin.
 * Both choices give identical lengths (opposite sides of a rectangle), but the
 * axis version piles eight segments for four fields onto two lines through the
 * origin, where they overlap each other, the arrows, the interface and the
 * surface-normal guide. Hanging them off each tip separates them the same way
 * the lane offsets separate the arrows themselves.
 *
 * The trade-off is that E₁ₜ and E₂ₜ no longer lie on the same axis, so their
 * equality reads as "two horizontal segments of equal length" (point-symmetric
 * about the origin) rather than as literal overlap — which was invisible
 * anyway, since two exactly-equal segments from the origin draw on top of
 * each other.
 */
import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { COMPANION_SCALE_HEADROOM } from "../../FieldBoundaryConstants.js";
import { displayScale } from "./displayScale.js";
import { COMPANION_LANE, PRIMARY_LANE, projectionCorners } from "./vectorLanes.js";

export type ComponentOverlayMode = "electric" | "magnetic";

/** The two dashed edges of one field's projection rectangle. */
type ProjectionRectangle = {
  tangential: Line;
  normal: Line;
};

export class ComponentOverlayNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: Property<boolean>,
    mode: ComponentOverlayMode,
    primary1Property: TReadOnlyProperty<Vector2>,
    primary2Property: TReadOnlyProperty<Vector2>,
    companion1Property: TReadOnlyProperty<Vector2>,
    companion2Property: TReadOnlyProperty<Vector2>,
    freeSourceProperty: TReadOnlyProperty<number>,
    showPrimaryProperty: TReadOnlyProperty<boolean>,
    showCompanionProperty: TReadOnlyProperty<boolean>,
  ) {
    super({ visibleProperty });

    const originView = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    const font = new PhetFont(13);

    const makeLine = (): Line =>
      new Line(0, 0, 0, 0, {
        stroke: FieldBoundaryColors.freeComponentColorProperty,
        lineWidth: 1.5,
        lineDash: [7, 5],
      });

    const makeRectangle = (): ProjectionRectangle => ({ tangential: makeLine(), normal: makeLine() });

    const primary1Rect = makeRectangle();
    const primary2Rect = makeRectangle();
    const companion1Rect = makeRectangle();
    const companion2Rect = makeRectangle();

    const etLabel = new Text(mode === "electric" ? "Eₜ" : "Hₜ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });
    const dnLabel = new Text(mode === "electric" ? "Dₙ" : "Bₙ", {
      font,
      fill: FieldBoundaryColors.continuousComponentColorProperty,
    });

    // Each layer follows its own arrow: a projection rectangle with no arrow at
    // its corner is just a stray dashed box.
    this.children = [
      new Node({
        visibleProperty: showCompanionProperty,
        children: [
          companion1Rect.tangential,
          companion1Rect.normal,
          companion2Rect.tangential,
          companion2Rect.normal,
          dnLabel,
        ],
      }),
      new Node({
        visibleProperty: showPrimaryProperty,
        children: [primary1Rect.tangential, primary1Rect.normal, primary2Rect.tangential, primary2Rect.normal, etLabel],
      }),
    ];

    const applyHighlight = (line: Line, highlight: boolean): void => {
      line.stroke = highlight
        ? FieldBoundaryColors.continuousComponentColorProperty
        : FieldBoundaryColors.freeComponentColorProperty;
      line.lineWidth = highlight ? 2.5 : 1.5;
    };

    /**
     * Lay out one field's projection rectangle and return the midpoints of its
     * two edges (where a label belongs). `medium2` fields are drawn tail-down in
     * the lower half-plane, so their arrow's far end is the tail at −physics.
     */
    const setRectangle = (
      rectangle: ProjectionRectangle,
      physics: Vector2,
      medium2: boolean,
      lane: number,
    ): { tangentialMid: Vector2; normalAnchor: Vector2 } => {
      const farModel = medium2 ? physics.timesScalar(-1) : physics;
      const farView = modelViewTransform.modelToViewPosition(farModel);
      // Match the lane its arrow is drawn in, so the rectangle stays glued to
      // the arrowhead instead of hovering beside it.
      const direction = medium2 ? originView.minus(farView) : farView.minus(originView);
      const { far, corner } = projectionCorners(farView, originView, direction, lane);

      // Tangential edge: horizontal, spanning |Eₜ|. Normal edge: vertical, |Eₙ|.
      rectangle.tangential.setPoint1(far.x, far.y);
      rectangle.tangential.setPoint2(corner.x, far.y);
      rectangle.normal.setPoint1(far.x, far.y);
      rectangle.normal.setPoint2(far.x, corner.y);

      // Label anchors. The tangential label takes the edge midpoint, but the
      // normal one sits 70% of the way toward the interface: its own end of the
      // edge is the arrow tip, already crowded by the D/B label and its ×scale
      // badge.
      return {
        tangentialMid: new Vector2((far.x + corner.x) / 2, far.y),
        normalAnchor: new Vector2(far.x, far.y + 0.7 * (corner.y - far.y)),
      };
    };

    Multilink.multilink(
      [primary1Property, primary2Property, companion1Property, companion2Property, freeSourceProperty],
      (p1, p2, c1, c2, freeSource) => {
        const eMode = mode === "electric";
        const sourced = Math.abs(freeSource) >= 1e-9;
        const tangentialContinuous = eMode || !sourced;
        const normalCompanionContinuous = !(eMode && sourced);

        const scale = displayScale([c1, c2], [p1, p2], COMPANION_SCALE_HEADROOM);

        const p1Mids = setRectangle(primary1Rect, p1, false, PRIMARY_LANE);
        setRectangle(primary2Rect, p2, true, PRIMARY_LANE);
        const c1Mids = setRectangle(companion1Rect, c1.timesScalar(scale), false, COMPANION_LANE);
        setRectangle(companion2Rect, c2.timesScalar(scale), true, COMPANION_LANE);

        applyHighlight(primary1Rect.tangential, tangentialContinuous);
        applyHighlight(primary2Rect.tangential, tangentialContinuous);
        applyHighlight(primary1Rect.normal, false);
        applyHighlight(primary2Rect.normal, false);
        applyHighlight(companion1Rect.normal, normalCompanionContinuous);
        applyHighlight(companion2Rect.normal, normalCompanionContinuous);
        applyHighlight(companion1Rect.tangential, false);
        applyHighlight(companion2Rect.tangential, false);

        etLabel.fill = tangentialContinuous
          ? FieldBoundaryColors.continuousComponentColorProperty
          : FieldBoundaryColors.freeComponentColorProperty;
        dnLabel.fill = normalCompanionContinuous
          ? FieldBoundaryColors.continuousComponentColorProperty
          : FieldBoundaryColors.freeComponentColorProperty;

        // Labels ride the medium-1 edges they name, on the outside of the
        // rectangle so they clear the arrow running through its diagonal.
        etLabel.centerBottom = p1Mids.tangentialMid.plusXY(0, -5);
        dnLabel.leftCenter = c1Mids.normalAnchor.plusXY(7, 0);
      },
    );
  }
}
