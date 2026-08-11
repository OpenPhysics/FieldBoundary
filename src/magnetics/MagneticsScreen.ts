/**
 * MagneticsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createMagneticsIcon() in src/common/FieldBoundaryScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createMagneticsIcon } from "../common/FieldBoundaryScreenIcons.js";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import { MagneticsModel } from "./model/MagneticsModel.js";
import { MagneticsKeyboardHelpContent } from "./view/MagneticsKeyboardHelpContent.js";
import { MagneticsScreenView } from "./view/MagneticsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MagneticsScreenOptions = ScreenOptions & { tandem: Tandem };

export class MagneticsScreen extends Screen<MagneticsModel, MagneticsScreenView> {
  public constructor(options: MagneticsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MagneticsModel(),
      // View factory — receives the model instance
      (model) =>
        new MagneticsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<MagneticsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: FieldBoundaryColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new MagneticsKeyboardHelpContent(),
          homeScreenIcon: createMagneticsIcon(),
          navigationBarIcon: createMagneticsIcon(),
        },
        options,
      ),
    );
  }
}
