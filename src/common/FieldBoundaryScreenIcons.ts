/**
 * FieldBoundaryScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen.
 * Drawn on the standard PhET 548 × 373 canvas using FieldBoundaryColors.
 *
 * Motifs mirror the play area: two media half-planes, a dashed interface, and
 * primary + companion field arrows using the same tip-at-interface convention
 * as BoundaryVectorsNode (medium-2 tip on the boundary, continuous with +n̂).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { Color } from "scenerystack/scenery";
import { Line, Node, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import {
  DEFAULT_EPS1,
  DEFAULT_EPS2,
  DEFAULT_FIELD_ANGLE,
  DEFAULT_FIELD_MAGNITUDE,
  DEFAULT_MU1,
  DEFAULT_MU2,
} from "../FieldBoundaryConstants.js";
import { fieldFromPolar, refractElectric, refractMagnetic } from "./model/interfaceFields.js";

const W = 548;
const H = 373;

/** Interface origin in icon pixels. */
const OX = W / 2;
const OY = H / 2;

/** Pixels per model field unit — keeps default arrows readable at navbar size. */
const FIELD_SCALE = 95;

const PRIMARY_HEAD_WIDTH = 36;
const PRIMARY_HEAD_HEIGHT = 32;
const PRIMARY_TAIL_WIDTH = 14;
const COMPANION_HEAD_WIDTH = 28;
const COMPANION_HEAD_HEIGHT = 24;
const COMPANION_TAIL_WIDTH = 9;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: FieldBoundaryColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: FieldBoundaryColors.backgroundColorProperty,
  });
}

/** Two media fills + dashed interface — same palette as InterfaceBackgroundNode. */
function interfaceBackdrop(): Node {
  const medium1 = new Rectangle(0, 0, W, OY, {
    fill: FieldBoundaryColors.medium1FillProperty,
  });
  const medium2 = new Rectangle(0, OY, W, H - OY, {
    fill: FieldBoundaryColors.medium2FillProperty,
  });
  const interfaceLine = new Line(40, OY, W - 40, OY, {
    stroke: FieldBoundaryColors.interfaceStrokeProperty,
    lineWidth: 6,
    lineDash: [18, 14],
  });
  return new Node({ children: [medium1, medium2, interfaceLine] });
}

/**
 * Scale companions so the longest stays comparable to the primary — same idea as
 * BoundaryVectorsNode.companionScale.
 */
function companionScale(primary1: Vector2, primary2: Vector2, companion1: Vector2, companion2: Vector2): number {
  const primaryMax = Math.max(primary1.magnitude, primary2.magnitude, 1e-6);
  const companionMax = Math.max(companion1.magnitude, companion2.magnitude, 1e-6);
  return Math.min(1, (primaryMax * 1.15) / companionMax);
}

/** Medium-1 arrow: tail at the interface, tip at the physics vector (view Y up). */
function arrowMedium1(field: Vector2, fill: TReadOnlyProperty<Color>, companion: boolean): ArrowNode {
  return new ArrowNode(OX, OY, OX + FIELD_SCALE * field.x, OY - FIELD_SCALE * field.y, {
    headWidth: companion ? COMPANION_HEAD_WIDTH : PRIMARY_HEAD_WIDTH,
    headHeight: companion ? COMPANION_HEAD_HEIGHT : PRIMARY_HEAD_HEIGHT,
    tailWidth: companion ? COMPANION_TAIL_WIDTH : PRIMARY_TAIL_WIDTH,
    stroke: null,
    fill,
    opacity: companion ? 0.85 : 1,
  });
}

/**
 * Medium-2 arrow: tip at the interface, tail at −physics so the shaft continues
 * the medium-1 field through the boundary (see BoundaryVectorsNode).
 */
function arrowMedium2(field: Vector2, fill: TReadOnlyProperty<Color>, companion: boolean): ArrowNode {
  return new ArrowNode(OX - FIELD_SCALE * field.x, OY + FIELD_SCALE * field.y, OX, OY, {
    headWidth: companion ? COMPANION_HEAD_WIDTH : PRIMARY_HEAD_WIDTH,
    headHeight: companion ? COMPANION_HEAD_HEIGHT : PRIMARY_HEAD_HEIGHT,
    tailWidth: companion ? COMPANION_TAIL_WIDTH : PRIMARY_TAIL_WIDTH,
    stroke: null,
    fill,
    opacity: companion ? 0.85 : 1,
  });
}

function fieldPair(
  primary1: Vector2,
  primary2: Vector2,
  companion1: Vector2,
  companion2: Vector2,
  primaryFill: TReadOnlyProperty<Color>,
  companionFill: TReadOnlyProperty<Color>,
): Node {
  const scale = companionScale(primary1, primary2, companion1, companion2);
  const c1 = companion1.timesScalar(scale);
  const c2 = companion2.timesScalar(scale);
  return new Node({
    children: [
      arrowMedium1(c1, companionFill, true),
      arrowMedium2(c2, companionFill, true),
      arrowMedium1(primary1, primaryFill, false),
      arrowMedium2(primary2, primaryFill, false),
    ],
  });
}

/** Electric: E (orange) + D (green) refracted at ε₂/ε₁ = 4. */
export function createElectricIcon(): ScreenIcon {
  const e1 = fieldFromPolar(DEFAULT_FIELD_MAGNITUDE, DEFAULT_FIELD_ANGLE);
  const { e2, d1, d2 } = refractElectric(e1, DEFAULT_EPS1, DEFAULT_EPS2);
  return iconFrom(
    new Node({
      children: [
        background(),
        interfaceBackdrop(),
        fieldPair(e1, e2, d1, d2, FieldBoundaryColors.eFieldColorProperty, FieldBoundaryColors.dFieldColorProperty),
      ],
    }),
  );
}

/** Magnetic: H (blue) + B (purple) refracted at μ₂/μ₁ = 4. */
export function createMagneticIcon(): ScreenIcon {
  const h1 = fieldFromPolar(DEFAULT_FIELD_MAGNITUDE, DEFAULT_FIELD_ANGLE);
  const { h2, b1, b2 } = refractMagnetic(h1, DEFAULT_MU1, DEFAULT_MU2);
  return iconFrom(
    new Node({
      children: [
        background(),
        interfaceBackdrop(),
        fieldPair(h1, h2, b1, b2, FieldBoundaryColors.hFieldColorProperty, FieldBoundaryColors.bFieldColorProperty),
      ],
    }),
  );
}
