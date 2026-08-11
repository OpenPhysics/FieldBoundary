/**
 * ElectricScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createElectricIcon() in src/common/FieldBoundaryScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createElectricIcon } from "../common/FieldBoundaryScreenIcons.js";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import { ElectricModel } from "./model/ElectricModel.js";
import { ElectricKeyboardHelpContent } from "./view/ElectricKeyboardHelpContent.js";
import { ElectricScreenView } from "./view/ElectricScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ElectricScreenOptions = ScreenOptions & { tandem: Tandem };

export class ElectricScreen extends Screen<ElectricModel, ElectricScreenView> {
  public constructor(options: ElectricScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ElectricModel(),
      // View factory — receives the model instance
      (model) =>
        new ElectricScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ElectricScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: FieldBoundaryColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ElectricKeyboardHelpContent(),
          homeScreenIcon: createElectricIcon(),
          navigationBarIcon: createElectricIcon(),
        },
        options,
      ),
    );
  }
}
