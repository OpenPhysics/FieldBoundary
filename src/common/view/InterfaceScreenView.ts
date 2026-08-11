/**
 * InterfaceScreenView.ts
 *
 * Shared play-area + control-column layout for Electric / Magnetic screens.
 * Screen-specific views map their model onto InterfaceScreenViewConfig.
 */
import { type BooleanProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, type Range, Vector2, Vector2Property } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { type Color, Node, Rectangle, RichDragListener, Text } from "scenerystack/scenery";
import { PhetFont, ProtractorNode, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import FieldBoundaryColors from "../../FieldBoundaryColors.js";
import {
  MODEL_HALF_HEIGHT,
  MODEL_HALF_WIDTH,
  PLAY_AREA_HEIGHT,
  PLAY_AREA_RIGHT_GUTTER,
  PLAY_AREA_TOP_INSET,
  PLAY_AREA_WIDTH,
  SCREEN_VIEW_MARGIN,
} from "../../FieldBoundaryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../FieldBoundaryButtonOptions.js";
import type { MaterialPreset, MaterialPresetId } from "../model/MaterialPresets.js";
import type { SharedModel } from "../model/SharedModel.js";
import { AngleArcsNode } from "./AngleArcsNode.js";
import { AngleReadoutNode, type AngleReadoutStrings, createParameterRatioProperty } from "./AngleReadoutNode.js";
import { BoundaryVectorsNode } from "./BoundaryVectorsNode.js";
import { BoundSourceNode } from "./BoundSourceNode.js";
import type { ComponentOverlayMode } from "./ComponentOverlayNode.js";
import { ComponentOverlayNode } from "./ComponentOverlayNode.js";
import { EquationStripNode, type EquationStripStrings } from "./EquationStripNode.js";
import type { FieldBoundaryA11ySummaryStrings } from "./FieldBoundaryScreenSummaryContent.js";
import { FieldBoundaryScreenSummaryContent } from "./FieldBoundaryScreenSummaryContent.js";
import { FieldLinesNode } from "./FieldLinesNode.js";
import { FluxBoxNode } from "./FluxBoxNode.js";
import { FluxTallyPanel, type FluxTallyPanelStrings } from "./FluxTallyPanel.js";
import { FreeSourceControlPanel } from "./FreeSourceControlPanel.js";
import { FreeSourceOverlayNode } from "./FreeSourceOverlayNode.js";
import { createFluxTallyProperty } from "./fluxTally.js";
import { InterfaceBackgroundNode } from "./InterfaceBackgroundNode.js";
import { LimitingCaseCalloutNode, type LimitingCaseCalloutStrings } from "./LimitingCaseCalloutNode.js";
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
      paramHelpStringProperty: TReadOnlyProperty<string>;
      magnitudeStringProperty: TReadOnlyProperty<string>;
      magnitudeHelpStringProperty: TReadOnlyProperty<string>;
      magnitudeValueStringProperty: TReadOnlyProperty<string>;
      freeSourceStringProperty: TReadOnlyProperty<string>;
      freeSourceHelpStringProperty: TReadOnlyProperty<string>;
      freeSourceValueStringProperty: TReadOnlyProperty<string>;
      toolsHeadingStringProperty: TReadOnlyProperty<string>;
      fluxBoxStringProperty: TReadOnlyProperty<string>;
      fluxBoxHeightStringProperty: TReadOnlyProperty<string>;
      showPrimaryStringProperty: TReadOnlyProperty<string>;
      showCompanionStringProperty: TReadOnlyProperty<string>;
    };
    /** Announced when a component in medium 2 reverses direction. */
    reversal: {
      reversedProperty: TReadOnlyProperty<boolean>;
      onStringProperty: TReadOnlyProperty<string>;
      offStringProperty: TReadOnlyProperty<string>;
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
  parameterRange: Range;
  presets: readonly MaterialPreset[];
  presetLabels: ReadonlyMap<MaterialPresetId, TReadOnlyProperty<string>>;
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
  /** Bare symbols for the Tools "Vectors" checkboxes: E/D/P or H/B/M. */
  primarySymbol: TReadOnlyProperty<string>;
  companionSymbol: TReadOnlyProperty<string>;
  boundSymbol: TReadOnlyProperty<string>;
  parameterLabel: TReadOnlyProperty<string>;
  magnitudeLabel: TReadOnlyProperty<string>;
  freeSourceTitle: TReadOnlyProperty<string>;
  freeSourceSymbol: TReadOnlyProperty<string>;
  angleReadout: AngleReadoutStrings;
  equationStrip: EquationStripStrings;
  limitingCase: LimitingCaseCalloutStrings;
  fluxTally: FluxTallyPanelStrings;
  /** Tools-panel labels that differ per screen. */
  fluxBoxToolLabel: TReadOnlyProperty<string>;
  boundSourceToolLabel: TReadOnlyProperty<string>;

  /** Polarization P / magnetization M explanation layer (both screens). */
  boundSource: {
    showProperty: BooleanProperty;
    bound1Property: TReadOnlyProperty<Vector2>;
    bound2Property: TReadOnlyProperty<Vector2>;
    boundSourceProperty: TReadOnlyProperty<number>;
    label1: TReadOnlyProperty<string>;
    label2: TReadOnlyProperty<string>;
    sourceLabel: TReadOnlyProperty<string>;
  };
};

export type InterfaceScreenViewOptions = ScreenViewOptions;

export class InterfaceScreenView extends ScreenView {
  private readonly protractorPositionProperty: Vector2Property;
  private readonly protractor: ProtractorNode;

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

    // Built from the same PLAY_AREA_* constants that MODEL_HALF_HEIGHT is
    // derived from, so the transform below is isotropic by construction rather
    // than by coincidence. (These reduce to the old layoutBounds arithmetic:
    // right edge = maxX − PLAY_AREA_RIGHT_GUTTER, bottom = maxY − margin.)
    const playRight = SCREEN_VIEW_MARGIN + PLAY_AREA_WIDTH;
    const playBounds = new Bounds2(
      SCREEN_VIEW_MARGIN,
      SCREEN_VIEW_MARGIN + PLAY_AREA_TOP_INSET,
      playRight,
      SCREEN_VIEW_MARGIN + PLAY_AREA_TOP_INSET + PLAY_AREA_HEIGHT,
    );

    // Isotropic by construction: the model rectangle has the same aspect ratio
    // as playBounds, so px/unit is identical in x and y and drawn angles equal
    // the angles the readout and protractor report.
    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2(-MODEL_HALF_WIDTH, -MODEL_HALF_HEIGHT, MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT),
      playBounds,
    );

    const playLayer = new Node();
    this.addChild(playLayer);

    playLayer.addChild(new InterfaceBackgroundNode(modelViewTransform, config.shared.showNormalProperty));

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
        config.shared.showPrimaryVectorProperty,
        config.shared.showCompanionVectorProperty,
      ),
    );

    // Above field lines / dashed interface so free-source glyphs stay readable.
    playLayer.addChild(
      new FreeSourceOverlayNode(modelViewTransform, config.mode, config.freeSourceProperty, config.freeSourceRange.max),
    );

    playLayer.addChild(
      new BoundSourceNode(modelViewTransform, {
        mode: config.mode,
        visibleProperty: config.boundSource.showProperty,
        bound1Property: config.boundSource.bound1Property,
        bound2Property: config.boundSource.bound2Property,
        boundSourceProperty: config.boundSource.boundSourceProperty,
        primary1Property: config.primary1Property,
        primary2Property: config.primary2Property,
        label1Property: config.boundSource.label1,
        label2Property: config.boundSource.label2,
        sourceLabelProperty: config.boundSource.sourceLabel,
      }),
    );

    const vectors = new BoundaryVectorsNode(modelViewTransform, {
      primaryProperty: config.primary1Property,
      companionProperty: config.companion1Property,
      transmittedPrimaryProperty: config.primary2Property,
      transmittedCompanionProperty: config.companion2Property,
      showPrimaryProperty: config.shared.showPrimaryVectorProperty,
      showCompanionProperty: config.shared.showCompanionVectorProperty,
      primaryColorProperty: config.primaryColorProperty,
      companionColorProperty: config.companionColorProperty,
      primary1Label: config.primary1Label,
      primary2Label: config.primary2Label,
      companion1Label: config.companion1Label,
      companion2Label: config.companion2Label,
      dragAccessibleName: a11y.controls.dragPrimaryStringProperty,
      onPrimaryTip: config.onPrimaryTip,
    });
    // Deliberately NOT added here: the vectors go into the scene after the
    // medium panels, below, so the draggable tip stays on top of them.

    // ── Gaussian pillbox / Amperian loop ──────────────────────────────────────
    // Electric integrates D over the pillbox faces; magnetic integrates H along
    // the loop legs.
    const tallyProperty = createFluxTallyProperty(
      config.mode,
      config.mode === "electric" ? config.companion1Property : config.primary1Property,
      config.mode === "electric" ? config.companion2Property : config.primary2Property,
      config.freeSourceProperty,
      config.shared.fluxBox.halfHeightProperty,
      config.shared.fluxBox.width,
    );
    const fluxBoxNode = new FluxBoxNode(modelViewTransform, config.shared.fluxBox, tallyProperty, {
      boxAccessibleName: a11y.controls.fluxBoxStringProperty,
      heightAccessibleName: a11y.controls.fluxBoxHeightStringProperty,
    });
    playLayer.addChild(fluxBoxNode);

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

    // ── Protractor ────────────────────────────────────────────────────────────
    // Constrained so it cannot be lost under the control panels, and restored by
    // Reset All (view.reset()).
    this.protractor = new ProtractorNode({
      rotatable: true,
      scale: 0.55,
      cursor: "pointer",
      visibleProperty: config.shared.showProtractorProperty,
    });
    const protractorHome = modelViewTransform.modelToViewPosition(new Vector2(0, 0));
    this.protractorPositionProperty = new Vector2Property(protractorHome);
    this.protractorPositionProperty.link((position) => {
      this.protractor.center = position;
    });
    // Without drag bounds the protractor can be pushed under the control panels
    // or off the screen edge, with no way back.
    const protractorDragBounds = playBounds.erodedXY(
      Math.min(this.protractor.width / 2, playBounds.width / 3),
      Math.min(this.protractor.height / 2, playBounds.height / 3),
    );
    this.protractor.addInputListener(
      new RichDragListener({
        positionProperty: this.protractorPositionProperty,
        dragBoundsProperty: new Property<Bounds2 | null>(protractorDragBounds),
        // positionProperty drives center, not translation — without this the
        // pointer-to-origin offset jumps the protractor on press.
        dragListenerOptions: {
          useParentOffset: true,
        },
      }),
    );
    playLayer.addChild(this.protractor);

    // Arcs at the interface make "θ from the normal" explicit; the readout
    // below is the numeric companion. Both share showAnglesProperty.
    playLayer.addChild(
      new AngleArcsNode(modelViewTransform, {
        visibleProperty: config.shared.showAnglesProperty,
        primary1Property: config.primary1Property,
        primary2Property: config.primary2Property,
        colorProperty: config.primaryColorProperty,
      }),
    );

    const angleReadout = new AngleReadoutNode(
      config.shared.showAnglesProperty,
      config.primary1Property,
      config.primary2Property,
      createParameterRatioProperty(config.param1Property, config.param2Property),
      config.freeSourceProperty,
      config.angleReadout,
    );
    angleReadout.left = playBounds.minX + 8;
    angleReadout.top = playBounds.minY + 36;
    playLayer.addChild(angleReadout);

    const limitingCallout = new LimitingCaseCalloutNode(
      new Vector2(playBounds.centerX, modelViewTransform.modelToViewY(0) - 92),
      config.param1Property,
      config.param2Property,
      config.limitingCase,
    );
    playLayer.addChild(limitingCallout);

    const equationStrip = new EquationStripNode(
      config.mode,
      config.shared.showComponentsProperty,
      config.freeSourceProperty,
      config.equationStrip,
    );
    equationStrip.centerX = playBounds.centerX;
    equationStrip.top = SCREEN_VIEW_MARGIN;
    this.addChild(equationStrip);

    const fluxTallyPanel = new FluxTallyPanel(tallyProperty, config.shared.fluxBox.showProperty, config.fluxTally);
    fluxTallyPanel.left = playBounds.minX + 8;
    fluxTallyPanel.bottom = medium2Tag.top - 8;
    this.addChild(fluxTallyPanel);

    const listParent = new Node();
    this.addChild(listParent);

    // Medium panels live inside their respective media (upper-right / lower-right
    // of the play area), so the right-hand column keeps room for the other controls.
    const medium1Panel = new MediaControlPanel(
      config.param1Property,
      config.parameterRange,
      config.presets,
      config.medium1PresetProperty,
      () => config.markCustom(1),
      {
        title: ui.medium1StringProperty,
        parameter: config.parameterLabel,
        custom: ui.customStringProperty,
        presetLabels: config.presetLabels,
        accessibleName: a11y.controls.preset1StringProperty,
        sliderAccessibleName: a11y.controls.param1StringProperty,
        sliderHelpText: a11y.controls.paramHelpStringProperty,
      },
      listParent,
      { fill: FieldBoundaryColors.translucentPanelBackgroundColorProperty },
    );
    medium1Panel.right = playRight - 8;
    medium1Panel.top = playBounds.minY + 8;
    this.addChild(medium1Panel);

    const medium2Panel = new MediaControlPanel(
      config.param2Property,
      config.parameterRange,
      config.presets,
      config.medium2PresetProperty,
      () => config.markCustom(2),
      {
        title: ui.medium2StringProperty,
        parameter: config.parameterLabel,
        custom: ui.customStringProperty,
        presetLabels: config.presetLabels,
        accessibleName: a11y.controls.preset2StringProperty,
        sliderAccessibleName: a11y.controls.param2StringProperty,
        sliderHelpText: a11y.controls.paramHelpStringProperty,
      },
      listParent,
      { fill: FieldBoundaryColors.translucentPanelBackgroundColorProperty },
    );
    medium2Panel.right = playRight - 8;
    medium2Panel.bottom = playBounds.maxY - 8;
    this.addChild(medium2Panel);

    // Above the medium panels: at large magnitude the field tip reaches into the
    // upper-right of the play area, and a knob under a panel cannot be grabbed.
    // Everything in this node except the knob is non-pickable, so the panels
    // underneath keep their own clicks.
    this.addChild(vectors);

    const controlsLeft = playRight + 12;
    const magnitudePanel = new MagnitudeControlPanel(
      config.primaryMagnitudeProperty,
      config.magnitudeLabel,
      a11y.controls.magnitudeStringProperty,
      a11y.controls.magnitudeHelpStringProperty,
      a11y.controls.magnitudeValueStringProperty,
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
      a11y.controls.freeSourceHelpStringProperty,
      a11y.controls.freeSourceValueStringProperty,
    );
    freeSourcePanel.left = controlsLeft;
    freeSourcePanel.top = magnitudePanel.bottom + 10;
    this.addChild(freeSourcePanel);

    const toolsPanel = new ToolsControlPanel(
      config.shared,
      {
        title: ui.toolsStringProperty,
        components: ui.componentsStringProperty,
        fieldLines: ui.fieldLinesStringProperty,
        protractor: ui.protractorStringProperty,
        angles: ui.anglesStringProperty,
        surfaceNormal: ui.surfaceNormalStringProperty,
        fluxBox: config.fluxBoxToolLabel,
        boundSource: config.boundSourceToolLabel,
        vectors: ui.vectorsStringProperty,
        primarySymbol: config.primarySymbol,
        companionSymbol: config.companionSymbol,
        boundSymbol: config.boundSymbol,
        showPrimary: a11y.controls.showPrimaryStringProperty,
        showCompanion: a11y.controls.showCompanionStringProperty,
        primaryColor: config.primaryColorProperty,
        companionColor: config.companionColorProperty,
      },
      config.boundSource.showProperty,
      a11y.controls.toolsHeadingStringProperty,
    );
    toolsPanel.left = controlsLeft;
    toolsPanel.top = freeSourcePanel.bottom + 10;
    this.addChild(toolsPanel);

    // The unit convention is otherwise only in doc/model.md, which students do
    // not read; every slider and readout would be a bare number.
    const unitsNote = new Text(ui.unitsNoteStringProperty, {
      font: new PhetFont(11),
      fill: FieldBoundaryColors.freeComponentColorProperty,
      maxWidth: PLAY_AREA_RIGHT_GUTTER - 32,
    });
    unitsNote.left = controlsLeft;
    unitsNote.top = toolsPanel.bottom + 10;
    this.addChild(unitsNote);

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

    // A component in medium 2 flipping direction is a striking, teachable
    // moment that would otherwise pass in silence for description users.
    a11y.reversal.reversedProperty.lazyLink((reversed) => {
      this.addAccessibleResponse(
        reversed ? a11y.reversal.onStringProperty.value : a11y.reversal.offStringProperty.value,
      );
    });

    this.addChild(
      new Node({
        pdomOrder: [
          vectors.dragHandle,
          ...fluxBoxNode.focusTargets,
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
    // Reset All must be able to recover the protractor: it is draggable and
    // rotatable, and both are view-only state.
    this.protractorPositionProperty.reset();
    this.protractor.reset();
  }
}
