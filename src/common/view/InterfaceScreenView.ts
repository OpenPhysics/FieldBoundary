/**
 * InterfaceScreenView.ts
 *
 * Shared play-area + control-column layout for Electric / Magnetic screens.
 * Screen-specific views map their model onto InterfaceScreenViewConfig.
 */
import type { BooleanProperty, Property, TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, type Range, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { type Color, Node, Rectangle, RichDragListener, Text } from "scenerystack/scenery";
import { PhetFont, ProtractorNode, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  MODEL_HALF_HEIGHT,
  MODEL_HALF_WIDTH,
  PLAY_AREA_RIGHT_GUTTER,
  SCREEN_VIEW_MARGIN,
} from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../FieldBoundaryButtonOptions.js";
import type { MaterialPresetId } from "../model/MaterialPresets.js";
import type { SharedModel } from "../model/SharedModel.js";
import { AngleReadoutNode, createParameterRatioProperty } from "./AngleReadoutNode.js";
import { BoundaryVectorsNode } from "./BoundaryVectorsNode.js";
import { BoundPolarizationNode } from "./BoundPolarizationNode.js";
import type { ComponentOverlayMode } from "./ComponentOverlayNode.js";
import { ComponentOverlayNode } from "./ComponentOverlayNode.js";
import { EquationStripNode } from "./EquationStripNode.js";
import type { FieldBoundaryA11ySummaryStrings } from "./FieldBoundaryScreenSummaryContent.js";
import { FieldBoundaryScreenSummaryContent } from "./FieldBoundaryScreenSummaryContent.js";
import { FieldLinesNode } from "./FieldLinesNode.js";
import { FreeSourceControlPanel } from "./FreeSourceControlPanel.js";
import { FreeSourceOverlayNode } from "./FreeSourceOverlayNode.js";
import { InterfaceBackgroundNode } from "./InterfaceBackgroundNode.js";
import { MagnitudeControlPanel } from "./MagnitudeControlPanel.js";
import { MediaControlPanel } from "./MediaControlPanel.js";
import { ToolsControlPanel } from "./ToolsControlPanel.js";

export type InterfaceScreenViewConfig = {
  mode: ComponentOverlayMode;
  shared: SharedModel;
  a11y: FieldBoundaryA11ySummaryStrings & {
    controls: {
      dragPrimaryStringProperty: TReadOnlyProperty<string>;
      preset1StringProperty: TReadOnlyProperty<string>;
      preset2StringProperty: TReadOnlyProperty<string>;
      param1StringProperty: TReadOnlyProperty<string>;
      param2StringProperty: TReadOnlyProperty<string>;
      magnitudeStringProperty: TReadOnlyProperty<string>;
      freeSourceStringProperty: TReadOnlyProperty<string>;
    };
  };

  primary1Property: TReadOnlyProperty<Vector2>;
  primary2Property: TReadOnlyProperty<Vector2>;
  companion1Property: TReadOnlyProperty<Vector2>;
  companion2Property: TReadOnlyProperty<Vector2>;
  primaryMagnitudeProperty: Property<number>;
  freeSourceProperty: Property<number>;
  freeSourceRange: Range;
  param1Property: Property<number>;
  param2Property: Property<number>;
  medium1PresetProperty: Property<MaterialPresetId>;
  medium2PresetProperty: Property<MaterialPresetId>;
  markCustom: (medium: 1 | 2) => void;
  onPrimaryTip: (tip: Vector2) => void;
  resetModel: () => void;

  primaryColorProperty: TReadOnlyProperty<Color>;
  companionColorProperty: TReadOnlyProperty<Color>;
  primary1Label: TReadOnlyProperty<string>;
  primary2Label: TReadOnlyProperty<string>;
  companion1Label: TReadOnlyProperty<string>;
  companion2Label: TReadOnlyProperty<string>;
  parameterLabel: TReadOnlyProperty<string>;
  magnitudeLabel: TReadOnlyProperty<string>;
  freeSourceTitle: TReadOnlyProperty<string>;
  freeSourceSymbol: TReadOnlyProperty<string>;
  tanRatioLabel: TReadOnlyProperty<string>;
  equationSourceFree: TReadOnlyProperty<string>;
  equationWithFree: TReadOnlyProperty<string>;

  boundPolarization?: {
    showProperty: BooleanProperty;
    p1Property: TReadOnlyProperty<Vector2>;
    p2Property: TReadOnlyProperty<Vector2>;
    boundChargeProperty: TReadOnlyProperty<number>;
    p1Label: TReadOnlyProperty<string>;
    p2Label: TReadOnlyProperty<string>;
    sigmaBLabel: TReadOnlyProperty<string>;
    toolsLabel: TReadOnlyProperty<string>;
  };
};

export type InterfaceScreenViewOptions = ScreenViewOptions;

export class InterfaceScreenView extends ScreenView {
  public constructor(config: InterfaceScreenViewConfig, providedOptions?: InterfaceScreenViewOptions) {
    const options = optionize<InterfaceScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new FieldBoundaryScreenSummaryContent(config.a11y),
      },
      providedOptions,
    );
    super(options);

    const ui = StringManager.getInstance().getUiStrings();
    const a11y = config.a11y;

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

    playLayer.addChild(new InterfaceBackgroundNode(modelViewTransform, config.shared.showAnglesProperty));

    playLayer.addChild(
      new FieldLinesNode(
        modelViewTransform,
        config.shared.showFieldLinesProperty,
        config.primary1Property,
        config.primary2Property,
        playBounds,
      ),
    );

    playLayer.addChild(
      new ComponentOverlayNode(
        modelViewTransform,
        config.shared.showComponentsProperty,
        config.mode,
        config.primary1Property,
        config.primary2Property,
        config.companion1Property,
        config.companion2Property,
        config.freeSourceProperty,
      ),
    );

    // Above field lines / dashed interface so free-source glyphs stay readable.
    playLayer.addChild(
      new FreeSourceOverlayNode(modelViewTransform, config.mode, config.freeSourceProperty, config.freeSourceRange.max),
    );

    if (config.boundPolarization) {
      const bp = config.boundPolarization;
      playLayer.addChild(
        new BoundPolarizationNode(
          modelViewTransform,
          bp.showProperty,
          bp.p1Property,
          bp.p2Property,
          bp.boundChargeProperty,
          config.primary1Property,
          config.primary2Property,
          bp.p1Label,
          bp.p2Label,
          bp.sigmaBLabel,
        ),
      );
    }

    const vectors = new BoundaryVectorsNode(modelViewTransform, {
      primaryProperty: config.primary1Property,
      companionProperty: config.companion1Property,
      transmittedPrimaryProperty: config.primary2Property,
      transmittedCompanionProperty: config.companion2Property,
      primaryColorProperty: config.primaryColorProperty,
      companionColorProperty: config.companionColorProperty,
      primary1Label: config.primary1Label,
      primary2Label: config.primary2Label,
      companion1Label: config.companion1Label,
      companion2Label: config.companion2Label,
      dragAccessibleName: a11y.controls.dragPrimaryStringProperty,
      onPrimaryTip: config.onPrimaryTip,
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
      visibleProperty: config.shared.showProtractorProperty,
    });
    protractor.center = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    protractor.addInputListener(new RichDragListener({ translateNode: true }));
    playLayer.addChild(protractor);

    const angleReadout = new AngleReadoutNode(
      config.shared.showAnglesProperty,
      config.primary1Property,
      config.primary2Property,
      config.tanRatioLabel,
      createParameterRatioProperty(config.param1Property, config.param2Property),
    );
    angleReadout.left = playBounds.minX + 8;
    angleReadout.top = playBounds.minY + 36;
    playLayer.addChild(angleReadout);

    const equationStrip = new EquationStripNode(
      config.mode,
      config.shared.showComponentsProperty,
      config.equationSourceFree,
      config.equationWithFree,
      config.freeSourceProperty,
    );
    equationStrip.centerX = playBounds.centerX;
    equationStrip.top = SCREEN_VIEW_MARGIN;
    this.addChild(equationStrip);

    const listParent = new Node();
    this.addChild(listParent);

    // Medium panels live inside their respective media (upper-right / lower-right
    // of the play area), so the right-hand column keeps room for the other controls.
    const mediaStringsBase = {
      parameter: config.parameterLabel,
      vacuum: ui.vacuumStringProperty,
      water: ui.waterStringProperty,
      glass: ui.glassStringProperty,
      highK: ui.highKStringProperty,
      custom: ui.customStringProperty,
    };

    const medium1Panel = new MediaControlPanel(
      config.param1Property,
      config.medium1PresetProperty,
      () => config.markCustom(1),
      {
        ...mediaStringsBase,
        title: ui.medium1StringProperty,
        accessibleName: a11y.controls.preset1StringProperty,
        sliderAccessibleName: a11y.controls.param1StringProperty,
      },
      listParent,
      { fill: FieldBoundaryColors.translucentPanelBackgroundColorProperty },
    );
    medium1Panel.right = playRight - 8;
    medium1Panel.top = playBounds.minY + 8;
    this.addChild(medium1Panel);

    const medium2Panel = new MediaControlPanel(
      config.param2Property,
      config.medium2PresetProperty,
      () => config.markCustom(2),
      {
        ...mediaStringsBase,
        title: ui.medium2StringProperty,
        accessibleName: a11y.controls.preset2StringProperty,
        sliderAccessibleName: a11y.controls.param2StringProperty,
      },
      listParent,
      { fill: FieldBoundaryColors.translucentPanelBackgroundColorProperty },
    );
    medium2Panel.right = playRight - 8;
    medium2Panel.bottom = playBounds.maxY - 8;
    this.addChild(medium2Panel);

    const controlsLeft = playRight + 12;
    const magnitudePanel = new MagnitudeControlPanel(
      config.primaryMagnitudeProperty,
      config.magnitudeLabel,
      a11y.controls.magnitudeStringProperty,
    );
    magnitudePanel.left = controlsLeft;
    magnitudePanel.top = SCREEN_VIEW_MARGIN;
    this.addChild(magnitudePanel);

    const freeSourcePanel = new FreeSourceControlPanel(
      config.freeSourceProperty,
      config.freeSourceRange,
      config.freeSourceTitle,
      config.freeSourceSymbol,
      a11y.controls.freeSourceStringProperty,
    );
    freeSourcePanel.left = controlsLeft;
    freeSourcePanel.top = magnitudePanel.bottom + 10;
    this.addChild(freeSourcePanel);

    const toolsStrings = {
      title: ui.toolsStringProperty,
      components: ui.componentsStringProperty,
      fieldLines: ui.fieldLinesStringProperty,
      protractor: ui.protractorStringProperty,
      angles: ui.anglesStringProperty,
      ...(config.boundPolarization ? { boundCharge: config.boundPolarization.toolsLabel } : {}),
    };
    const toolsPanel = new ToolsControlPanel(config.shared, toolsStrings, config.boundPolarization?.showProperty);
    toolsPanel.left = controlsLeft;
    toolsPanel.top = freeSourcePanel.bottom + 10;
    this.addChild(toolsPanel);

    // Combo lists above panels
    listParent.moveToFront();

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        config.resetModel();
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
