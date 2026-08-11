# Implementation notes — Field Boundary

## Architecture

Two screens share:

- BC helpers in `src/common/model/interfaceFields.ts`
- Model skeleton in `src/common/model/DualMediaInterfaceModel.ts`
  (`ElectricModel` / `MagneticModel` keep public `e*` / `h*` aliases)
- Play-area layout in `src/common/view/InterfaceScreenView.ts`
  (thin screen views map model → config)
- Screen wiring via `fieldBoundaryScreenSuperArgs` in
  `src/common/createFieldBoundaryScreen.ts`
- Shared a11y: `FieldBoundaryKeyboardHelpContent`,
  `FieldBoundaryScreenSummaryContent`
- View widgets under `src/common/view/` and tool toggles on `SharedModel`

Each screen owns a `SharedModel` for components / field lines / protractor /
angles. Bound-charge visibility (`showBoundChargeProperty`) lives on
`ElectricModel` only.

State flow (Electric):

1. User sets `e1AngleProperty` / `e1MagnitudeProperty` (drag tip or magnitude slider)
   and optional `surfaceChargeProperty` (σ_f).
2. `Multilink` writes `e1`, `e2`, `d1`, `d2` `Vector2Property`s via `refractElectric`.
3. View nodes multilink those properties onto `ArrowNode`s, dashed components, a
   `CanvasNode` field-line lattice, and `FreeSourceOverlayNode` charge glyphs.
   `EquationStripNode` / `ComponentOverlayNode` switch highlighting when σ_f ≠ 0.
   Optional `BoundPolarizationNode` shows \(\vec{P}\) and hollow σ_b glyphs
   (toggle: `showBoundChargeProperty` on `ElectricModel`).

Magnetic mirrors the same pattern with `refractMagnetic` and `surfaceCurrentProperty` (K_f).

## Interaction

- Drag handle on \(\vec{E}_1\) / \(\vec{H}_1\) tip changes **angle only**; magnitude is a slider (reduces degrees of freedom).
- Material presets set \(\varepsilon_r\) or \(\mu_r\); moving the slider marks the medium **Custom** (guarded so preset applies do not flip the combo).
- Free-source sliders (`FreeSourceControlPanel`) default to 0 so the source-free BC is the first impression; nonzero values draw interface glyphs and rewrite the equation strip jump term.

## Transform

`ModelViewTransform2.createRectangleInvertedYMapping` maps model \(+y\) (into medium 1) to screen-up.

## Testing

`tests/common/model/interfaceFields.test.ts` covers continuity, scaling, the
\(\tan\theta\) identity, and nonzero \(\sigma_f\) / \(K_f\) jump conditions.
