/**
 * ElectricScreenView.ts
 *
 * Electric interface play area + media/tools controls.
 */
import { Bounds2, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Rectangle, RichDragListener, Text } from "scenerystack/scenery";
import { PhetFont, ProtractorNode, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/FieldBoundaryButtonOptions.js";
import { AngleReadoutNode, createParameterRatioProperty } from "../../common/view/AngleReadoutNode.js";
import { BoundaryVectorsNode } from "../../common/view/BoundaryVectorsNode.js";
import { ComponentOverlayNode } from "../../common/view/ComponentOverlayNode.js";
import { EquationStripNode } from "../../common/view/EquationStripNode.js";
import { FieldLinesNode } from "../../common/view/FieldLinesNode.js";
import { FreeSourceControlPanel } from "../../common/view/FreeSourceControlPanel.js";
import { FreeSourceOverlayNode } from "../../common/view/FreeSourceOverlayNode.js";
import { InterfaceBackgroundNode } from "../../common/view/InterfaceBackgroundNode.js";
import { MagnitudeControlPanel } from "../../common/view/MagnitudeControlPanel.js";
import { MediaControlPanel } from "../../common/view/MediaControlPanel.js";
import { ToolsControlPanel } from "../../common/view/ToolsControlPanel.js";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  MODEL_HALF_HEIGHT,
  MODEL_HALF_WIDTH,
  PLAY_AREA_RIGHT_GUTTER,
  SCREEN_VIEW_MARGIN,
  SURFACE_CHARGE_RANGE,
} from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectricModel } from "../model/ElectricModel.js";
import { ElectricScreenSummaryContent } from "./ElectricScreenSummaryContent.js";

export type ElectricScreenViewOptions = ScreenViewOptions;

export class ElectricScreenView extends ScreenView {
  public constructor(model: ElectricModel, providedOptions?: ElectricScreenViewOptions) {
    const options = optionize<ElectricScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new ElectricScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const ui = StringManager.getInstance().getUiStrings();
    const a11y = StringManager.getInstance().getElectricA11yStrings();

    const backgroundRect = new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: FieldBoundaryColors.backgroundColorProperty,
    });
    this.addChild(backgroundRect);

    const playRight = this.layoutBounds.maxX - PLAY_AREA_RIGHT_GUTTER;
    const playBounds = new Bounds2(
      SCREEN_VIEW_MARGIN,
      SCREEN_VIEW_MARGIN + 48,
      playRight,
      this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    );

    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2(-MODEL_HALF_WIDTH, -MODEL_HALF_HEIGHT, MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT),
      playBounds,
    );

    const playLayer = new Node();
    this.addChild(playLayer);

    playLayer.addChild(new InterfaceBackgroundNode(modelViewTransform, model.shared.showAnglesProperty));

    const fieldLines = new FieldLinesNode(
      modelViewTransform,
      model.shared.showFieldLinesProperty,
      model.e1Property,
      model.e2Property,
      playBounds,
    );
    playLayer.addChild(fieldLines);

    playLayer.addChild(
      new ComponentOverlayNode(
        modelViewTransform,
        model.shared.showComponentsProperty,
        "electric",
        model.e1Property,
        model.e2Property,
        model.d1Property,
        model.d2Property,
        model.surfaceChargeProperty,
      ),
    );

    // Above field lines / dashed interface so +/− glyphs stay readable.
    playLayer.addChild(
      new FreeSourceOverlayNode(modelViewTransform, "electric", model.surfaceChargeProperty, SURFACE_CHARGE_RANGE.max),
    );

    const vectors = new BoundaryVectorsNode(modelViewTransform, {
      primaryProperty: model.e1Property,
      companionProperty: model.d1Property,
      transmittedPrimaryProperty: model.e2Property,
      transmittedCompanionProperty: model.d2Property,
      primaryColorProperty: FieldBoundaryColors.eFieldColorProperty,
      companionColorProperty: FieldBoundaryColors.dFieldColorProperty,
      primary1Label: ui.labelE1StringProperty,
      primary2Label: ui.labelE2StringProperty,
      companion1Label: ui.labelD1StringProperty,
      companion2Label: ui.labelD2StringProperty,
      dragAccessibleName: a11y.controls.dragE1StringProperty,
      onPrimaryTip: (tip) => model.setE1FromTip(tip),
    });
    playLayer.addChild(vectors);

    const medium1Tag = new Text(ui.medium1StringProperty, {
      font: new PhetFont({ size: 14, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
      left: playBounds.minX + 8,
      top: playBounds.minY + 8,
    });
    const medium2Tag = new Text(ui.medium2StringProperty, {
      font: new PhetFont({ size: 14, weight: "bold" }),
      fill: FieldBoundaryColors.textColorProperty,
      left: playBounds.minX + 8,
      bottom: playBounds.maxY - 8,
    });
    playLayer.addChild(medium1Tag);
    playLayer.addChild(medium2Tag);

    const protractor = new ProtractorNode({
      rotatable: true,
      scale: 0.55,
      cursor: "pointer",
      visibleProperty: model.shared.showProtractorProperty,
    });
    protractor.center = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    protractor.addInputListener(new RichDragListener({ translateNode: true }));
    playLayer.addChild(protractor);

    const angleReadout = new AngleReadoutNode(
      model.shared.showAnglesProperty,
      model.e1Property,
      model.e2Property,
      ui.tanRatioElectricStringProperty,
      createParameterRatioProperty(model.eps1Property, model.eps2Property),
    );
    angleReadout.left = playBounds.minX + 8;
    angleReadout.top = playBounds.minY + 36;
    playLayer.addChild(angleReadout);

    const equationStrip = new EquationStripNode(
      "electric",
      model.shared.showComponentsProperty,
      ui.equationElectricStringProperty,
      ui.equationElectricFreeStringProperty,
      model.surfaceChargeProperty,
    );
    equationStrip.centerX = playBounds.centerX;
    equationStrip.top = SCREEN_VIEW_MARGIN;
    this.addChild(equationStrip);

    const listParent = new Node();
    this.addChild(listParent);

    const controlsLeft = playRight + 12;
    const medium1Panel = new MediaControlPanel(
      model.eps1Property,
      model.medium1PresetProperty,
      () => model.markCustom(1),
      {
        title: ui.medium1StringProperty,
        parameter: ui.epsrStringProperty,
        vacuum: ui.vacuumStringProperty,
        water: ui.waterStringProperty,
        glass: ui.glassStringProperty,
        highK: ui.highKStringProperty,
        custom: ui.customStringProperty,
        accessibleName: a11y.controls.preset1StringProperty,
        sliderAccessibleName: a11y.controls.eps1StringProperty,
      },
      listParent,
    );
    medium1Panel.left = controlsLeft;
    medium1Panel.top = SCREEN_VIEW_MARGIN;
    this.addChild(medium1Panel);

    const medium2Panel = new MediaControlPanel(
      model.eps2Property,
      model.medium2PresetProperty,
      () => model.markCustom(2),
      {
        title: ui.medium2StringProperty,
        parameter: ui.epsrStringProperty,
        vacuum: ui.vacuumStringProperty,
        water: ui.waterStringProperty,
        glass: ui.glassStringProperty,
        highK: ui.highKStringProperty,
        custom: ui.customStringProperty,
        accessibleName: a11y.controls.preset2StringProperty,
        sliderAccessibleName: a11y.controls.eps2StringProperty,
      },
      listParent,
    );
    medium2Panel.left = controlsLeft;
    medium2Panel.top = medium1Panel.bottom + 10;
    this.addChild(medium2Panel);

    const magnitudePanel = new MagnitudeControlPanel(
      model.e1MagnitudeProperty,
      ui.magnitudeEStringProperty,
      a11y.controls.magnitudeStringProperty,
    );
    magnitudePanel.left = controlsLeft;
    magnitudePanel.top = medium2Panel.bottom + 10;
    this.addChild(magnitudePanel);

    const freeSourcePanel = new FreeSourceControlPanel(
      model.surfaceChargeProperty,
      SURFACE_CHARGE_RANGE,
      ui.surfaceChargeTitleStringProperty,
      ui.sigmaFStringProperty,
      a11y.controls.surfaceChargeStringProperty,
    );
    freeSourcePanel.left = controlsLeft;
    freeSourcePanel.top = magnitudePanel.bottom + 10;
    this.addChild(freeSourcePanel);

    const toolsPanel = new ToolsControlPanel(model.shared, {
      title: ui.toolsStringProperty,
      components: ui.componentsStringProperty,
      fieldLines: ui.fieldLinesStringProperty,
      protractor: ui.protractorStringProperty,
      angles: ui.anglesStringProperty,
    });
    toolsPanel.left = controlsLeft;
    toolsPanel.top = freeSourcePanel.bottom + 10;
    this.addChild(toolsPanel);

    // Combo lists above panels
    listParent.moveToFront();

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    this.addChild(
      new Node({
        pdomOrder: [
          vectors.dragHandle,
          medium1Panel,
          medium2Panel,
          magnitudePanel,
          freeSourcePanel,
          toolsPanel,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    // View has no independent mutable state beyond model-driven Properties.
  }
}
