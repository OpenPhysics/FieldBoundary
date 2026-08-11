/**
 * MagneticScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createMagneticIcon() in src/common/FieldBoundaryScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createMagneticIcon } from "../common/FieldBoundaryScreenIcons.js";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import { MagneticModel } from "./model/MagneticModel.js";
import { MagneticKeyboardHelpContent } from "./view/MagneticKeyboardHelpContent.js";
import { MagneticScreenView } from "./view/MagneticScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MagneticScreenOptions = ScreenOptions & { tandem: Tandem };

export class MagneticScreen extends Screen<MagneticModel, MagneticScreenView> {
  public constructor(options: MagneticScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MagneticModel(),
      // View factory — receives the model instance
      (model) =>
        new MagneticScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<MagneticScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: FieldBoundaryColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new MagneticKeyboardHelpContent(),
          homeScreenIcon: createMagneticIcon(),
          navigationBarIcon: createMagneticIcon(),
        },
        options,
      ),
    );
  }
}
