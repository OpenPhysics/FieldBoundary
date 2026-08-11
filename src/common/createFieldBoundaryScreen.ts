/**
 * createFieldBoundaryScreen.ts
 *
 * Shared Screen wiring for Electric / Magnetic: model/view factories, icons,
 * background color, and keyboard help.
 */
import type { TModel } from "scenerystack/joist";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenIcon, ScreenOptions, ScreenView, ScreenViewOptions } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import FieldBoundaryColors from "../FieldBoundaryColors.js";
import { FieldBoundaryKeyboardHelpContent } from "./view/FieldBoundaryKeyboardHelpContent.js";

export type FieldBoundaryScreenOptions = ScreenOptions & { tandem: Tandem };

export type FieldBoundaryScreenFactories<M extends TModel, V extends ScreenView> = {
  modelConstructor: new () => M;
  viewConstructor: new (model: M, options?: ScreenViewOptions) => V;
  createIcon: () => ScreenIcon;
};

/**
 * Arguments for `super(...)` on a Field Boundary screen subclass.
 */
export function fieldBoundaryScreenSuperArgs<M extends TModel, V extends ScreenView>(
  options: FieldBoundaryScreenOptions,
  factories: FieldBoundaryScreenFactories<M, V>,
): [() => M, (model: M) => V, ScreenOptions] {
  return [
    () => new factories.modelConstructor(),
    (model) =>
      new factories.viewConstructor(model, {
        tandem: options.tandem.createTandem("view"),
      }),
    optionize<FieldBoundaryScreenOptions, EmptySelfOptions, ScreenOptions>()(
      {
        backgroundColorProperty: FieldBoundaryColors.backgroundColorProperty,
        createKeyboardHelpNode: () => new FieldBoundaryKeyboardHelpContent(),
        homeScreenIcon: factories.createIcon(),
        navigationBarIcon: factories.createIcon(),
      },
      options,
    ),
  ];
}
