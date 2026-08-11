/**
 * MagneticScreenView.ts
 *
 * Maps MagneticModel onto the shared InterfaceScreenView layout.
 */
import { DerivedProperty } from "scenerystack/axon";
import type { ScreenViewOptions } from "scenerystack/sim";
import type { MaterialPresetId } from "../../common/model/MaterialPresets.js";
import { MAGNETIC_PRESETS } from "../../common/model/MaterialPresets.js";
import { createMagneticDetailsProperty, isTangentialReversed } from "../../common/view/currentDetails.js";
import { InterfaceScreenView } from "../../common/view/InterfaceScreenView.js";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import { MAGNETIC_PARAMETER_RANGE, SURFACE_CURRENT_RANGE } from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MagneticModel } from "../model/MagneticModel.js";

export type MagneticScreenViewOptions = ScreenViewOptions;

export class MagneticScreenView extends InterfaceScreenView {
  public constructor(model: MagneticModel, providedOptions?: MagneticScreenViewOptions) {
    const ui = StringManager.getInstance().getUiStrings();
    const a11y = StringManager.getInstance().getMagneticA11yStrings();

    const presetLabels = new Map<MaterialPresetId, (typeof ui)["airStringProperty"]>([
      ["air", ui.airStringProperty],
      ["ferrite", ui.ferriteStringProperty],
      ["iron", ui.ironStringProperty],
      ["muMetal", ui.muMetalStringProperty],
    ]);

    super(
      {
        mode: "magnetic",
        shared: model.shared,
        a11y: {
          screenSummary: a11y.screenSummary,
          currentDetailsProperty: createMagneticDetailsProperty(
            model.h1Property,
            model.h2Property,
            model.mu1Property,
            model.mu2Property,
            model.surfaceCurrentProperty,
            model.boundCurrentProperty,
            {
              angles: a11y.details.anglesStringProperty,
              materials: a11y.details.materialsStringProperty,
              tangentialContinuous: a11y.details.tangentialContinuousStringProperty,
              tangentialJump: a11y.details.tangentialJumpStringProperty,
              normalCompanionContinuous: a11y.details.normalCompanionContinuousStringProperty,
              normalRatio: a11y.details.normalRatioStringProperty,
              tangentialReversed: a11y.details.tangentialReversedStringProperty,
              boundCurrent: a11y.details.boundCurrentStringProperty,
            },
          ),
          controls: {
            dragPrimaryStringProperty: a11y.controls.dragH1StringProperty,
            preset1StringProperty: a11y.controls.preset1StringProperty,
            preset2StringProperty: a11y.controls.preset2StringProperty,
            param1StringProperty: a11y.controls.mu1StringProperty,
            param2StringProperty: a11y.controls.mu2StringProperty,
            paramHelpStringProperty: a11y.controls.paramHelpStringProperty,
            magnitudeStringProperty: a11y.controls.magnitudeStringProperty,
            magnitudeHelpStringProperty: a11y.controls.magnitudeHelpStringProperty,
            magnitudeValueStringProperty: a11y.controls.magnitudeValueStringProperty,
            freeSourceStringProperty: a11y.controls.surfaceCurrentStringProperty,
            freeSourceHelpStringProperty: a11y.controls.surfaceCurrentHelpStringProperty,
            freeSourceValueStringProperty: a11y.controls.surfaceCurrentValueStringProperty,
            toolsHeadingStringProperty: a11y.controls.toolsHeadingStringProperty,
            fluxBoxStringProperty: a11y.controls.fluxBoxStringProperty,
            fluxBoxHeightStringProperty: a11y.controls.fluxBoxHeightStringProperty,
            showPrimaryStringProperty: a11y.controls.showPrimaryStringProperty,
            showCompanionStringProperty: a11y.controls.showCompanionStringProperty,
          },
          reversal: {
            reversedProperty: new DerivedProperty([model.h1Property, model.h2Property], isTangentialReversed),
            onStringProperty: a11y.alerts.reversedStringProperty,
            offStringProperty: a11y.alerts.restoredStringProperty,
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
        parameterRange: MAGNETIC_PARAMETER_RANGE,
        presets: MAGNETIC_PRESETS,
        presetLabels,
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
        primarySymbol: ui.symbolHStringProperty,
        companionSymbol: ui.symbolBStringProperty,
        boundSymbol: ui.symbolMStringProperty,
        parameterLabel: ui.murStringProperty,
        magnitudeLabel: ui.magnitudeHStringProperty,
        freeSourceTitle: ui.surfaceCurrentTitleStringProperty,
        freeSourceSymbol: ui.kFStringProperty,
        angleReadout: {
          ratioLabel: ui.tanRatioStringProperty,
          predictedPattern: ui.predictedMagneticStringProperty,
          sourcedNote: ui.ratioSourcedMagneticStringProperty,
          accessiblePattern: a11y.angleReadoutStringProperty,
        },
        equationStrip: {
          sourceFreeTitle: ui.equations.magneticTitleStringProperty,
          sourcedTitle: ui.equations.magneticTitleSourcedStringProperty,
          continuousTerm: ui.equations.bNormalStringProperty,
          conditionalTerm: ui.equations.hTangentialStringProperty,
          conditionalJumpTerm: ui.equations.hTangentialJumpStringProperty,
          discontinuousTerm1: ui.equations.hNormalStringProperty,
          discontinuousTerm2: ui.equations.bTangentialStringProperty,
          duality: ui.equations.dualityStringProperty,
        },
        limitingCase: {
          medium2Dominant: ui.callout.magneticMedium2StringProperty,
          medium1Dominant: ui.callout.magneticMedium1StringProperty,
          matched: ui.callout.magneticMatchedStringProperty,
        },
        fluxTally: {
          title: ui.flux.magneticTitleStringProperty,
          medium1Face: ui.flux.magneticTopStringProperty,
          medium2Face: ui.flux.magneticBottomStringProperty,
          sides: ui.flux.sidesStringProperty,
          total: ui.flux.magneticTotalStringProperty,
          enclosed: ui.flux.magneticEnclosedStringProperty,
          hint: ui.flux.magneticHintStringProperty,
          accessiblePattern: a11y.fluxTallyStringProperty,
        },
        fluxBoxToolLabel: ui.amperianLoopStringProperty,
        boundSourceToolLabel: ui.magnetizationStringProperty,
        boundSource: {
          showProperty: model.showBoundCurrentProperty,
          bound1Property: model.m1Property,
          bound2Property: model.m2Property,
          boundSourceProperty: model.boundCurrentProperty,
          label1: ui.labelM1StringProperty,
          label2: ui.labelM2StringProperty,
          sourceLabel: ui.kBStringProperty,
        },
      },
      providedOptions,
    );
  }
}
