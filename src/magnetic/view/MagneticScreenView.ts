/**
 * MagneticScreenView.ts
 *
 * Maps MagneticModel onto the shared InterfaceScreenView layout.
 */
import type { ScreenViewOptions } from "scenerystack/sim";
import { InterfaceScreenView } from "../../common/view/InterfaceScreenView.js";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { SURFACE_CURRENT_RANGE } from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MagneticModel } from "../model/MagneticModel.js";

export type MagneticScreenViewOptions = ScreenViewOptions;

export class MagneticScreenView extends InterfaceScreenView {
  public constructor(model: MagneticModel, providedOptions?: MagneticScreenViewOptions) {
    const ui = StringManager.getInstance().getUiStrings();
    const a11y = StringManager.getInstance().getMagneticA11yStrings();

    super(
      {
        mode: "magnetic",
        shared: model.shared,
        a11y: {
          screenSummary: a11y.screenSummary,
          currentDetailsStringProperty: a11y.currentDetailsStringProperty,
          controls: {
            dragPrimaryStringProperty: a11y.controls.dragH1StringProperty,
            preset1StringProperty: a11y.controls.preset1StringProperty,
            preset2StringProperty: a11y.controls.preset2StringProperty,
            param1StringProperty: a11y.controls.mu1StringProperty,
            param2StringProperty: a11y.controls.mu2StringProperty,
            magnitudeStringProperty: a11y.controls.magnitudeStringProperty,
            freeSourceStringProperty: a11y.controls.surfaceCurrentStringProperty,
          },
        },
        primary1Property: model.h1Property,
        primary2Property: model.h2Property,
        companion1Property: model.b1Property,
        companion2Property: model.b2Property,
        primaryMagnitudeProperty: model.h1MagnitudeProperty,
        freeSourceProperty: model.surfaceCurrentProperty,
        freeSourceRange: SURFACE_CURRENT_RANGE,
        param1Property: model.mu1Property,
        param2Property: model.mu2Property,
        medium1PresetProperty: model.medium1PresetProperty,
        medium2PresetProperty: model.medium2PresetProperty,
        markCustom: (medium) => model.markCustom(medium),
        onPrimaryTip: (tip) => model.setH1FromTip(tip),
        resetModel: () => model.reset(),
        primaryColorProperty: FieldBoundaryColors.hFieldColorProperty,
        companionColorProperty: FieldBoundaryColors.bFieldColorProperty,
        primary1Label: ui.labelH1StringProperty,
        primary2Label: ui.labelH2StringProperty,
        companion1Label: ui.labelB1StringProperty,
        companion2Label: ui.labelB2StringProperty,
        parameterLabel: ui.murStringProperty,
        magnitudeLabel: ui.magnitudeHStringProperty,
        freeSourceTitle: ui.surfaceCurrentTitleStringProperty,
        freeSourceSymbol: ui.kFStringProperty,
        tanRatioLabel: ui.tanRatioMagneticStringProperty,
        equationSourceFree: ui.equationMagneticStringProperty,
        equationWithFree: ui.equationMagneticFreeStringProperty,
      },
      providedOptions,
    );
  }
}
