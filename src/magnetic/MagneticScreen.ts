/**
 * MagneticScreen.ts
 *
 * Top-level Magnetic Screen — thin wrapper around shared Field Boundary wiring.
 */
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { fieldBoundaryScreenSuperArgs } from "../common/createFieldBoundaryScreen.js";
import { createMagneticIcon } from "../common/FieldBoundaryScreenIcons.js";
import { MagneticModel } from "./model/MagneticModel.js";
import { MagneticScreenView } from "./view/MagneticScreenView.js";

type MagneticScreenOptions = ScreenOptions & { tandem: Tandem };

export class MagneticScreen extends Screen<MagneticModel, MagneticScreenView> {
  public constructor(options: MagneticScreenOptions) {
    super(
      ...fieldBoundaryScreenSuperArgs(options, {
        modelConstructor: MagneticModel,
        viewConstructor: MagneticScreenView,
        createIcon: createMagneticIcon,
      }),
    );
  }
}
