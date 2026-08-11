/**
 * ElectricScreen.ts
 *
 * Top-level Electric Screen — thin wrapper around shared Field Boundary wiring.
 */
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { fieldBoundaryScreenSuperArgs } from "../common/createFieldBoundaryScreen.js";
import { createElectricIcon } from "../common/FieldBoundaryScreenIcons.js";
import { ElectricModel } from "./model/ElectricModel.js";
import { ElectricScreenView } from "./view/ElectricScreenView.js";

type ElectricScreenOptions = ScreenOptions & { tandem: Tandem };

export class ElectricScreen extends Screen<ElectricModel, ElectricScreenView> {
  public constructor(options: ElectricScreenOptions) {
    super(
      ...fieldBoundaryScreenSuperArgs(options, {
        modelConstructor: ElectricModel,
        viewConstructor: ElectricScreenView,
        createIcon: createElectricIcon,
      }),
    );
  }
}
