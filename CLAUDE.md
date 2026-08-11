# CLAUDE.md — Field Boundary

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Original SceneryStack simulation of **Maxwell planar interface boundary conditions**
(electrostatic and magnetostatic). Students drag a primary field tip and adjust
relative permittivity / permeability to see which components stay continuous.

**Not** geometric optics / Snell’s law (see OpticsLab / PhET Bending Light). The
UI borrows a two-media layout, material presets, protractor, and field-line
toggle from that style of sim, but the physics is interface BCs.

Physics notes: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Screens

| Screen | Primary | Companion | Material param |
|---|---|---|---|
| Electric | \(\vec{E}\) | \(\vec{D}=\varepsilon_r\vec{E}\) | \(\varepsilon_r\) |
| Magnetic | \(\vec{H}\) | \(\vec{B}=\mu_r\vec{H}\) | \(\mu_r\) |

## Key files

| Area | Location |
|---|---|
| Shared BC math | `src/common/model/interfaceFields.ts` |
| Shared model skeleton | `src/common/model/DualMediaInterfaceModel.ts` |
| Tool toggles | `src/common/model/SharedModel.ts` |
| Shared screen view | `src/common/view/InterfaceScreenView.ts` |
| Screen factory | `src/common/createFieldBoundaryScreen.ts` |
| Electric model / view | `src/electric/model/ElectricModel.ts`, `src/electric/view/ElectricScreenView.ts` |
| Magnetic model / view | `src/magnetic/model/MagneticModel.ts`, `src/magnetic/view/MagneticScreenView.ts` |
| Play-area nodes | `src/common/view/` (`InterfaceBackgroundNode`, `BoundaryVectorsNode`, `ComponentOverlayNode`, `FieldLinesNode`, `FreeSourceOverlayNode`, `BoundPolarizationNode`, `FreeSourceControlPanel`, …) |
| Colors / strings | `FieldBoundaryColors.ts`, `src/i18n/StringManager.ts` |

## Model conventions

- \(\varepsilon_0=\mu_0=1\) in sim units; UI exposes relative \(\varepsilon_r\), \(\mu_r\).
- \(\hat{n}=+\hat{y}\) from medium 2 into medium 1; tangential = \(x\).
- Angle \(\theta\) of the primary field is from the normal: \(\tan\theta=E_t/E_n\).
- Medium-2 fields are continuous with medium 1 (point toward \(+\hat{n}\)); drawn in the lower half-plane by anchoring the arrow tip at the interface and the tail at \((-E_t,-E_n)\). For equal media the two arrows are parallel. `medium2DisplayVector` is used only by component-axis overlays.
- Free surface charge \(\sigma_f\) (Electric) and free surface current \(K_f\) (Magnetic, along \(+\hat{z}\)) are adjustable on the interface and default to 0. With \(\sigma_f\ne 0\): \(D_{1n}-D_{2n}=\sigma_f\) (Dₙ discontinuous). With \(K_f\ne 0\): \(H_{2t}-H_{1t}=K_f\) (Hₜ discontinuous). The equation strip and component-overlay highlighting switch to reflect the sourced BC.
- Bound charge (Electric, toggle): \(\vec{P}=(\varepsilon_r-1)\vec{E}\), \(\sigma_b=P_{1n}-P_{2n}\). Explains \(E_{1n}-E_{2n}=\sigma_f-\sigma_b\). Hollow glyphs + \(\vec{P}\) arrows via `BoundPolarizationNode`.

### Boundary conditions

```
E₂ₜ = E₁ₜ
ε₁E₁ₙ − ε₂E₂ₙ = σ_f        (σ_f = 0 ⇒ E₂ₙ = (ε₁/ε₂) E₁ₙ)
Dᵢ = εᵢ Eᵢ

H₂ₜ = H₁ₜ + K_f             (K_f along +ẑ; K_f = 0 ⇒ H₂ₜ = H₁ₜ)
H₂ₙ = (μ₁ / μ₂) H₁ₙ
Bᵢ = μᵢ Hᵢ
```

## Accessibility

Follows [Baton/ACCESSIBILITY.md](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
Screen summaries live in `*ScreenSummaryContent.ts`; a11y strings under `a11y` in locale JSON.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

## Non-goals (v1)

Optical rays / Fresnel / TIR; curved interfaces; time-harmonic waves.
