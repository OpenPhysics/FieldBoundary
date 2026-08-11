/**
 * ElectricScreenView.ts
 *
 * Maps ElectricModel onto the shared InterfaceScreenView layout.
 */
import { DerivedProperty } from "scenerystack/axon";
import type { ScreenViewOptions } from "scenerystack/sim";
import type { MaterialPresetId } from "../../common/model/MaterialPresets.js";
import { ELECTRIC_PRESETS } from "../../common/model/MaterialPresets.js";
import { createElectricDetailsProperty, isNormalReversed } from "../../common/view/currentDetails.js";
import { InterfaceScreenView } from "../../common/view/InterfaceScreenView.js";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { ELECTRIC_PARAMETER_RANGE, SURFACE_CHARGE_RANGE } from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectricModel } from "../model/ElectricModel.js";

export type ElectricScreenViewOptions = ScreenViewOptions;

export class ElectricScreenView extends InterfaceScreenView {
  public constructor(model: ElectricModel, providedOptions?: ElectricScreenViewOptions) {
    const ui = StringManager.getInstance().getUiStrings();
    const a11y = StringManager.getInstance().getElectricA11yStrings();

    const presetLabels = new Map<MaterialPresetId, (typeof ui)["vacuumStringProperty"]>([
      ["vacuum", ui.vacuumStringProperty],
      ["glass", ui.glassStringProperty],
      ["water", ui.waterStringProperty],
      ["conductor", ui.conductorLikeStringProperty],
    ]);

    super(
      {
        mode: "electric",
        shared: model.shared,
        a11y: {
          screenSummary: a11y.screenSummary,
          currentDetailsProperty: createElectricDetailsProperty(
            model.e1Property,
            model.e2Property,
            model.eps1Property,
            model.eps2Property,
            model.surfaceChargeProperty,
            model.boundChargeProperty,
            {
              angles: a11y.details.anglesStringProperty,
              materials: a11y.details.materialsStringProperty,
              tangentialContinuous: a11y.details.tangentialContinuousStringProperty,
              normalCompanionContinuous: a11y.details.normalCompanionContinuousStringProperty,
              normalCompanionJump: a11y.details.normalCompanionJumpStringProperty,
              normalRatio: a11y.details.normalRatioStringProperty,
              normalReversed: a11y.details.normalReversedStringProperty,
              boundCharge: a11y.details.boundChargeStringProperty,
            },
          ),
          controls: {
            dragPrimaryStringProperty: a11y.controls.dragE1StringProperty,
            preset1StringProperty: a11y.controls.preset1StringProperty,
            preset2StringProperty: a11y.controls.preset2StringProperty,
            param1StringProperty: a11y.controls.eps1StringProperty,
            param2StringProperty: a11y.controls.eps2StringProperty,
            paramHelpStringProperty: a11y.controls.paramHelpStringProperty,
            magnitudeStringProperty: a11y.controls.magnitudeStringProperty,
            magnitudeHelpStringProperty: a11y.controls.magnitudeHelpStringProperty,
            magnitudeValueStringProperty: a11y.controls.magnitudeValueStringProperty,
            freeSourceStringProperty: a11y.controls.surfaceChargeStringProperty,
            freeSourceHelpStringProperty: a11y.controls.surfaceChargeHelpStringProperty,
            freeSourceValueStringProperty: a11y.controls.surfaceChargeValueStringProperty,
            toolsHeadingStringProperty: a11y.controls.toolsHeadingStringProperty,
            fluxBoxStringProperty: a11y.controls.fluxBoxStringProperty,
            fluxBoxHeightStringProperty: a11y.controls.fluxBoxHeightStringProperty,
            showPrimaryStringProperty: a11y.controls.showPrimaryStringProperty,
            showCompanionStringProperty: a11y.controls.showCompanionStringProperty,
          },
          reversal: {
            reversedProperty: new DerivedProperty([model.e2Property], isNormalReversed),
            onStringProperty: a11y.alerts.reversedStringProperty,
            offStringProperty: a11y.alerts.restoredStringProperty,
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
        parameterRange: ELECTRIC_PARAMETER_RANGE,
        presets: ELECTRIC_PRESETS,
        presetLabels,
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
        primarySymbol: ui.symbolEStringProperty,
        companionSymbol: ui.symbolDStringProperty,
        boundSymbol: ui.symbolPStringProperty,
        parameterLabel: ui.epsrStringProperty,
        magnitudeLabel: ui.magnitudeEStringProperty,
        freeSourceTitle: ui.surfaceChargeTitleStringProperty,
        freeSourceSymbol: ui.sigmaFStringProperty,
        angleReadout: {
          ratioLabel: ui.tanRatioStringProperty,
          predictedPattern: ui.predictedElectricStringProperty,
          sourcedNote: ui.ratioSourcedElectricStringProperty,
          accessiblePattern: a11y.angleReadoutStringProperty,
        },
        equationStrip: {
          sourceFreeTitle: ui.equations.electricTitleStringProperty,
          sourcedTitle: ui.equations.electricTitleSourcedStringProperty,
          continuousTerm: ui.equations.eTangentialStringProperty,
          conditionalTerm: ui.equations.dNormalStringProperty,
          conditionalJumpTerm: ui.equations.dNormalJumpStringProperty,
          discontinuousTerm1: ui.equations.eNormalStringProperty,
          discontinuousTerm2: ui.equations.dTangentialStringProperty,
          duality: ui.equations.dualityStringProperty,
        },
        limitingCase: {
          medium2Dominant: ui.callout.electricMedium2StringProperty,
          medium1Dominant: ui.callout.electricMedium1StringProperty,
          matched: ui.callout.electricMatchedStringProperty,
        },
        fluxTally: {
          title: ui.flux.electricTitleStringProperty,
          medium1Face: ui.flux.electricTopStringProperty,
          medium2Face: ui.flux.electricBottomStringProperty,
          sides: ui.flux.sidesStringProperty,
          total: ui.flux.electricTotalStringProperty,
          enclosed: ui.flux.electricEnclosedStringProperty,
          hint: ui.flux.electricHintStringProperty,
          accessiblePattern: a11y.fluxTallyStringProperty,
        },
        fluxBoxToolLabel: ui.pillboxStringProperty,
        boundSourceToolLabel: ui.boundChargeStringProperty,
        boundSource: {
          showProperty: model.showBoundChargeProperty,
          bound1Property: model.p1Property,
          bound2Property: model.p2Property,
          boundSourceProperty: model.boundChargeProperty,
          label1: ui.labelP1StringProperty,
          label2: ui.labelP2StringProperty,
          sourceLabel: ui.sigmaBStringProperty,
        },
      },
      providedOptions,
    );
  }
}
