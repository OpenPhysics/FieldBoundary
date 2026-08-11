/**
 * ElectricScreenView.ts
 *
 * Maps ElectricModel onto the shared InterfaceScreenView layout.
 */
import type { ScreenViewOptions } from "scenerystack/sim";
import { InterfaceScreenView } from "../../common/view/InterfaceScreenView.js";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { SURFACE_CHARGE_RANGE } from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectricModel } from "../model/ElectricModel.js";

export type ElectricScreenViewOptions = ScreenViewOptions;

export class ElectricScreenView extends InterfaceScreenView {
  public constructor(model: ElectricModel, providedOptions?: ElectricScreenViewOptions) {
    const ui = StringManager.getInstance().getUiStrings();
    const a11y = StringManager.getInstance().getElectricA11yStrings();

    super(
      {
        mode: "electric",
        shared: model.shared,
        a11y: {
          screenSummary: a11y.screenSummary,
          currentDetailsStringProperty: a11y.currentDetailsStringProperty,
          controls: {
            dragPrimaryStringProperty: a11y.controls.dragE1StringProperty,
            preset1StringProperty: a11y.controls.preset1StringProperty,
            preset2StringProperty: a11y.controls.preset2StringProperty,
            param1StringProperty: a11y.controls.eps1StringProperty,
            param2StringProperty: a11y.controls.eps2StringProperty,
            magnitudeStringProperty: a11y.controls.magnitudeStringProperty,
            freeSourceStringProperty: a11y.controls.surfaceChargeStringProperty,
          },
        },
        primary1Property: model.e1Property,
        primary2Property: model.e2Property,
        companion1Property: model.d1Property,
        companion2Property: model.d2Property,
        primaryMagnitudeProperty: model.e1MagnitudeProperty,
        freeSourceProperty: model.surfaceChargeProperty,
        freeSourceRange: SURFACE_CHARGE_RANGE,
        param1Property: model.eps1Property,
        param2Property: model.eps2Property,
        medium1PresetProperty: model.medium1PresetProperty,
        medium2PresetProperty: model.medium2PresetProperty,
        markCustom: (medium) => model.markCustom(medium),
        onPrimaryTip: (tip) => model.setE1FromTip(tip),
        resetModel: () => model.reset(),
        primaryColorProperty: FieldBoundaryColors.eFieldColorProperty,
        companionColorProperty: FieldBoundaryColors.dFieldColorProperty,
        primary1Label: ui.labelE1StringProperty,
        primary2Label: ui.labelE2StringProperty,
        companion1Label: ui.labelD1StringProperty,
        companion2Label: ui.labelD2StringProperty,
        parameterLabel: ui.epsrStringProperty,
        magnitudeLabel: ui.magnitudeEStringProperty,
        freeSourceTitle: ui.surfaceChargeTitleStringProperty,
        freeSourceSymbol: ui.sigmaFStringProperty,
        tanRatioLabel: ui.tanRatioElectricStringProperty,
        equationSourceFree: ui.equationElectricStringProperty,
        equationWithFree: ui.equationElectricFreeStringProperty,
        boundPolarization: {
          showProperty: model.showBoundChargeProperty,
          p1Property: model.p1Property,
          p2Property: model.p2Property,
          boundChargeProperty: model.boundChargeProperty,
          p1Label: ui.labelP1StringProperty,
          p2Label: ui.labelP2StringProperty,
          sigmaBLabel: ui.sigmaBStringProperty,
          toolsLabel: ui.boundChargeStringProperty,
        },
      },
      providedOptions,
    );
  }
}
