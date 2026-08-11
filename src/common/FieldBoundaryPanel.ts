/**
 * FieldBoundaryPanel.ts
 *
 * A pre-themed Panel that automatically uses FieldBoundaryColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { FieldBoundaryPanel } from "../../common/FieldBoundaryPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new FieldBoundaryPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new FieldBoundaryPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new FieldBoundaryPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import { PANEL_CORNER_RADIUS } from "../FieldBoundaryConstants.js";

export type FieldBoundaryPanelOptions = PanelOptions;

export class FieldBoundaryPanel extends Panel {
  public constructor(content: Node, providedOptions?: FieldBoundaryPanelOptions) {
    const options = optionize<FieldBoundaryPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: FieldBoundaryColors.panelBackgroundColorProperty,
        stroke: FieldBoundaryColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
