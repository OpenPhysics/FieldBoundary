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
| Intro | \(\vec{E}\) | \(\vec{D}=\varepsilon_r\vec{E}\) | \(\varepsilon_r\) |
| Magnetics | \(\vec{H}\) | \(\vec{B}=\mu_r\vec{H}\) | \(\mu_r\) |

## Key files

| Area | Location |
|---|---|
| Shared BC math | `src/common/model/interfaceFields.ts` |
| Tool toggles | `src/common/model/SharedModel.ts` |
| Intro model / view | `src/intro/model/IntroModel.ts`, `src/intro/view/IntroScreenView.ts` |
| Magnetics model / view | `src/magnetics/model/MagneticsModel.ts`, `src/magnetics/view/MagneticsScreenView.ts` |
| Play-area nodes | `src/common/view/` (`InterfaceBackgroundNode`, `BoundaryVectorsNode`, `ComponentOverlayNode`, `FieldLinesNode`, …) |
| Colors / strings | `FieldBoundaryColors.ts`, `src/i18n/StringManager.ts` |

## Model conventions

- \(\varepsilon_0=\mu_0=1\) in sim units; UI exposes relative \(\varepsilon_r\), \(\mu_r\).
- \(\hat{n}=+\hat{y}\) from medium 2 into medium 1; tangential = \(x\).
- Angle \(\theta\) of the primary field is from the normal: \(\tan\theta=E_t/E_n\).
- Medium-2 arrows are drawn with a flipped normal (`medium2DisplayVector`) so tips lie in the lower half-plane while physics components stay \((E_t,E_n)\).
- No free surface charge/current in v1 (\(\sigma_f=0\), \(K_f=0\)).

### Boundary conditions (v1)

```
E₂ₜ = E₁ₜ
E₂ₙ = (ε₁ / ε₂) E₁ₙ
Dᵢ = εᵢ Eᵢ

H₂ₜ = H₁ₜ
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

Optical rays / Fresnel / TIR; free \(\sigma_f\)/\(K_f\); curved interfaces; time-harmonic waves.
