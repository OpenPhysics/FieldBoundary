/**
 * FieldBoundaryColors.ts
 *
 * ProfileColorProperty theme for default and projector modes.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import FieldBoundaryNamespace from "./FieldBoundaryNamespace.js";

const FieldBoundaryColors = {
  backgroundColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  accentColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  panelBackgroundColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  panelBorderColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "panelBorder", {
    default: "#3a6ea5",
    projector: "#999999",
  }),

  textColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  controlSurfaceColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  controlSurfaceDisabledColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  controlSurfaceTextColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  /** Medium 1 (upper) fill. */
  medium1FillProperty: new ProfileColorProperty(FieldBoundaryNamespace, "medium1Fill", {
    default: "#1e3a5f",
    projector: "#d6e8f8",
  }),

  /** Medium 2 (lower) fill. */
  medium2FillProperty: new ProfileColorProperty(FieldBoundaryNamespace, "medium2Fill", {
    default: "#3a322c",
    projector: "#e8e8e8",
  }),

  /** Dashed interface line. */
  interfaceStrokeProperty: new ProfileColorProperty(FieldBoundaryNamespace, "interfaceStroke", {
    default: "#f0c040",
    projector: "#8a6a00",
  }),

  /** Surface-normal guide. */
  normalStrokeProperty: new ProfileColorProperty(FieldBoundaryNamespace, "normalStroke", {
    default: "#90a4ae",
    projector: "#546e7a",
  }),

  /** Primary electric field E. */
  eFieldColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "eField", {
    default: "#ff7043",
    projector: "#c62828",
  }),

  /** Displacement field D (companion). */
  dFieldColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "dField", {
    default: "#66bb6a",
    projector: "#2e7d32",
  }),

  /** Magnetic field H (primary on Magnetics). */
  hFieldColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "hField", {
    default: "#42a5f5",
    projector: "#1565c0",
  }),

  /** Magnetic induction B (companion). */
  bFieldColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "bField", {
    default: "#d4a8e8",
    projector: "#6a1b9a",
  }),

  /** Continuous-component highlight. */
  continuousComponentColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "continuousComponent", {
    default: "#ffe082",
    projector: "#f9a825",
  }),

  /** Discontinuous / free component stroke. */
  freeComponentColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "freeComponent", {
    default: "#b0bec5",
    projector: "#78909c",
  }),

  /** Field-line lattice stroke. */
  fieldLineColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "fieldLine", {
    default: "#80cbc4",
    projector: "#00796b",
  }),

  equationHighlightColorProperty: new ProfileColorProperty(FieldBoundaryNamespace, "equationHighlight", {
    default: "#ffe082",
    projector: "#f57f17",
  }),

  /** Semi-transparent knob outline on vector tips. */
  dragKnobStrokeProperty: new ProfileColorProperty(FieldBoundaryNamespace, "dragKnobStroke", {
    default: "rgba(0,0,0,0.53)",
    projector: "rgba(0,0,0,0.53)",
  }),
};

export default FieldBoundaryColors;
