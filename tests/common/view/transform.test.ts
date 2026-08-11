/**
 * transform.test.ts
 *
 * Guards the isotropy of the model-view mapping. An anisotropic transform draws
 * every angle compressed toward the normal, so the arrows silently disagree
 * with the θ readout and with the protractor — in a sim whose whole thesis is
 * "measure what happens to the angle at a boundary".
 */
import { describe, expect, it } from "vitest";
import {
  LAYOUT_HEIGHT,
  LAYOUT_WIDTH,
  MODEL_HALF_HEIGHT,
  MODEL_HALF_WIDTH,
  PLAY_AREA_HEIGHT,
  PLAY_AREA_RIGHT_GUTTER,
  PLAY_AREA_TOP_INSET,
  PLAY_AREA_WIDTH,
  SCREEN_VIEW_MARGIN,
} from "../../../src/FieldBoundaryConstants.js";

describe("model-view transform", () => {
  it("play-area constants match the screen layout they are cut from", () => {
    expect(PLAY_AREA_WIDTH).toBe(LAYOUT_WIDTH - SCREEN_VIEW_MARGIN - PLAY_AREA_RIGHT_GUTTER);
    expect(PLAY_AREA_HEIGHT).toBe(LAYOUT_HEIGHT - 2 * SCREEN_VIEW_MARGIN - PLAY_AREA_TOP_INSET);
  });

  it("has equal pixels-per-unit in x and y", () => {
    const scaleX = PLAY_AREA_WIDTH / (2 * MODEL_HALF_WIDTH);
    const scaleY = PLAY_AREA_HEIGHT / (2 * MODEL_HALF_HEIGHT);
    expect(scaleX).toBeCloseTo(scaleY, 9);
  });

  it("draws every angle at the angle it reports", () => {
    const scaleX = PLAY_AREA_WIDTH / (2 * MODEL_HALF_WIDTH);
    const scaleY = PLAY_AREA_HEIGHT / (2 * MODEL_HALF_HEIGHT);
    for (const degrees of [5, 20, 36, 45, 60, 83]) {
      const theta = (degrees * Math.PI) / 180;
      // Drawn angle from the normal for a model vector at angle theta.
      const drawn = Math.atan2(Math.sin(theta) * scaleX, Math.cos(theta) * scaleY);
      expect((drawn * 180) / Math.PI).toBeCloseTo(degrees, 6);
    }
  });
});
