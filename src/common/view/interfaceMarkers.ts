/**
 * interfaceMarkers.ts
 *
 * Glyphs drawn on the interface for surface sources.
 *
 *   charge   +  /  −     (electric)
 *   current  ⊙  /  ⊗     (magnetic; out of / into the page, ±ẑ)
 *
 * Free sources use a solid backdrop; bound sources use a hollow dashed disc, so
 * σ_f and σ_b (or K_f and K_b) stay distinguishable when both are present.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, type Color, Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";

export const MARKER_RADIUS = 11;

export type MarkerStyle = "free" | "bound";

function backdrop(style: MarkerStyle, colorProperty: TReadOnlyProperty<Color>): Circle {
  return style === "free"
    ? new Circle(MARKER_RADIUS, {
        fill: FieldBoundaryColors.panelBackgroundColorProperty,
        stroke: FieldBoundaryColors.panelBorderColorProperty,
        lineWidth: 1,
        pickable: false,
      })
    : new Circle(MARKER_RADIUS, {
        fill: FieldBoundaryColors.panelBackgroundColorProperty,
        stroke: colorProperty,
        lineWidth: 2.5,
        lineDash: [4, 3],
        pickable: false,
      });
}

/** "+" or "−" surface-charge glyph. */
export function createChargeMarker(
  positive: boolean,
  colorProperty: TReadOnlyProperty<Color>,
  style: MarkerStyle = "free",
): Node {
  const text = new Text(positive ? "+" : "−", {
    font: new PhetFont({ size: style === "free" ? 22 : 18, weight: "bold" }),
    fill: colorProperty,
    pickable: false,
  });
  text.center = Vector2.ZERO;
  return new Node({ children: [backdrop(style, colorProperty), text], pickable: false });
}

/**
 * ⊙ for current out of page (+ẑ): ring with a filled center dot.
 * ⊗ for current into page (−ẑ): ring with a cross.
 */
export function createCurrentMarker(
  positive: boolean,
  colorProperty: TReadOnlyProperty<Color>,
  style: MarkerStyle = "free",
): Node {
  const radius = MARKER_RADIUS - 2;
  const ring = new Circle(radius, {
    stroke: colorProperty,
    lineWidth: 2.5,
    ...(style === "bound" ? { lineDash: [4, 3] } : {}),
    pickable: false,
  });

  let inner: Node;
  if (positive) {
    inner = new Circle(2.6, { fill: colorProperty, pickable: false });
  } else {
    const d = radius * 0.55;
    inner = new Node({
      children: [
        new Line(-d, -d, d, d, { stroke: colorProperty, lineWidth: 2.5, pickable: false }),
        new Line(-d, d, d, -d, { stroke: colorProperty, lineWidth: 2.5, pickable: false }),
      ],
    });
  }

  return new Node({ children: [backdrop(style, colorProperty), ring, inner], pickable: false });
}
