# Implementation notes — Field Boundary

## Architecture

Two screens share:

- BC helpers in `src/common/model/interfaceFields.ts` (refraction, bound sources,
  and the pillbox / loop tallies)
- Model skeleton in `src/common/model/DualMediaInterfaceModel.ts`
  (`ElectricModel` / `MagneticModel` keep public `e*` / `h*` aliases)
- Play-area layout in `src/common/view/InterfaceScreenView.ts`
  (thin screen views map model → config)
- Screen wiring via `fieldBoundaryScreenSuperArgs` in
  `src/common/createFieldBoundaryScreen.ts`
- Shared a11y: `FieldBoundaryKeyboardHelpContent`,
  `FieldBoundaryScreenSummaryContent`, `currentDetails.ts`
- View widgets under `src/common/view/` and tool toggles on `SharedModel`

Each screen owns a `SharedModel` (components / field lines / protractor / angles /
surface normal / pillbox-loop state). The bound-source visibility Property lives
on the screen model: `showBoundChargeProperty` on `ElectricModel`,
`showBoundCurrentProperty` on `MagneticModel`.

State flow (Electric):

1. User sets `e1AngleProperty` / `e1MagnitudeProperty` (drag tip or magnitude slider)
   and optional `surfaceChargeProperty` (σ_f).
2. `Multilink` writes `e1`, `e2`, `d1`, `d2`, `p1`, `p2`, `boundCharge`
   `Property`s via `refractElectric`.
3. View nodes multilink those Properties onto `ArrowNode`s, dashed components, a
   `CanvasNode` field-line lattice, `FreeSourceOverlayNode` charge glyphs, and
   `BoundSourceNode` polarization arrows + hollow σ_b glyphs.
   `EquationStripNode` / `ComponentOverlayNode` switch highlighting when σ_f ≠ 0.

Magnetic mirrors the same pattern with `refractMagnetic`, `surfaceCurrentProperty`
(K_f), and the dual bound-source layer (M, K_b).

## Transform — must stay isotropic

`ModelViewTransform2.createRectangleInvertedYMapping` fits a model rectangle to
the play-area rectangle using **independent** x and y scales. `MODEL_HALF_HEIGHT`
is therefore *derived* from `PLAY_AREA_WIDTH / PLAY_AREA_HEIGHT` rather than
hard-coded, and `InterfaceScreenView` builds `playBounds` from the same
constants, so px/unit is identical in both axes.

This is not cosmetic: an anisotropic mapping draws every angle as
θ_drawn = arctan(s · tan θ_model), so the arrows disagree with the θ readout and
with the (isotropic) protractor — in a sim whose thesis is *measure what happens
to the angle at a boundary*. `tests/common/view/transform.test.ts` guards it.

## Interaction

- Drag handle on \(\vec{E}_1\) / \(\vec{H}_1\) tip changes **angle only**; magnitude is a slider (reduces degrees of freedom).
- Material presets are per screen (`ELECTRIC_PRESETS` / `MAGNETIC_PRESETS`): a
  shared list is degenerate on Magnetic, where every ordinary dielectric has
  μᵣ ≈ 1. Moving the slider marks the medium **Custom** (guarded so preset applies
  do not flip the combo).
- The εᵣ / μᵣ sliders are **logarithmic** (`MappedProperty` over log₁₀ with decade
  ticks): real materials span four decades while the interesting behavior is at
  ratios of order 1–10.
- Free-source sliders (`FreeSourceControlPanel`) default to 0 so the source-free
  BC is the first impression; nonzero values draw interface glyphs and rewrite the
  equation strip jump term.
- The protractor has drag bounds and is restored by `InterfaceScreenView.reset()`
  (position and rotation are view-only state).

## Secondary-arrow scaling

D/B companion arrows and P/M arrows are shrunk to stay on screen at large
εᵣ / μᵣ. One implementation (`displayScale.ts`) serves all three layers, and the
factor is rendered as a `×0.46`-style badge next to the label — comparing arrow
lengths is the most natural thing a student does with two arrows, so a silent
rescale rewards a false inference.

## Gaussian pillbox / Amperian loop

`FluxBoxModel` (on `SharedModel`) holds the box position and half-height;
`createFluxTallyProperty` derives the per-face tally from the pure functions
`pillboxFlux` / `amperianCirculation`; `FluxBoxNode` draws the box with each
contribution on its edge, and `FluxTallyPanel` shows the full ledger. Collapsing
the box is the point — the side terms shrink to zero and the total meets the
enclosed free source.

## Accessibility

- `currentDetails.ts` builds the screen-summary "current details" region as a
  `DerivedProperty` over model state (angles, materials, which component is
  continuous, the free source, the bound source, and reversal). A static string
  here means a non-visual student learns nothing about the fields.
- The equation strip, angle readout, and flux tally panel carry
  `accessibleParagraph`; sliders carry `accessibleHelpText` and
  `pdomCreateAriaValueText` so a value is announced with its quantity and unit.
- A component in medium 2 reversing direction fires an `addAccessibleResponse`.

## Testing

- `tests/common/model/interfaceFields.test.ts` — continuity, scaling, the
  tanθ identity, σ_f / K_f jumps, bound charge and bound current identities, and
  the pillbox / loop integral laws.
- `tests/common/view/transform.test.ts` — model-view isotropy.
- `tests/memory-leak.test.ts` — `ElectricModel` / `MagneticModel` are collected
  after `dispose()`; the field `Multilink` is registered on the parameter
  Properties, so failing to dispose it keeps the whole model alive.
