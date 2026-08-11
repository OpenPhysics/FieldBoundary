# Implementation notes — Field Boundary

## Architecture

Two screens share view widgets under `src/common/view/` and pure BC helpers in
`src/common/model/interfaceFields.ts`. Each screen owns a `SharedModel` instance
for tool toggles (components, field lines, protractor, angles).

State flow (Electric):

1. User sets `e1AngleProperty` / `e1MagnitudeProperty` (drag tip or magnitude slider)
   and optional `surfaceChargeProperty` (σ_f).
2. `Multilink` writes `e1`, `e2`, `d1`, `d2` `Vector2Property`s via `refractElectric`.
3. View nodes multilink those properties onto `ArrowNode`s, dashed components, a
   `CanvasNode` field-line lattice, and `FreeSourceOverlayNode` charge glyphs.
   `EquationStripNode` / `ComponentOverlayNode` switch highlighting when σ_f ≠ 0.

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
