# CLAUDE.md — Field Boundary

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Original SceneryStack simulation of **Maxwell planar interface boundary conditions**
(electrostatic and magnetostatic). Students drag a primary field tip and adjust
relative permittivity / permeability to see which components stay continuous.

**Not** geometric optics / Snell’s law (see OpticsLab / PhET Bending Light). The
UI borrows a two-media layout, material presets, protractor, and field-line
toggle from that style of sim, but the physics is interface BCs.

Learning goals: `doc/learning-goals.md` — read this before adding features.
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
| Pillbox / loop tool | `src/common/model/FluxBoxModel.ts`, `src/common/view/FluxBoxNode.ts`, `FluxTallyPanel.ts`, `fluxTally.ts` |
| Play-area nodes | `src/common/view/` (`InterfaceBackgroundNode`, `BoundaryVectorsNode`, `ComponentOverlayNode`, `FieldLinesNode`, `FreeSourceOverlayNode`, `BoundSourceNode`, `LimitingCaseCalloutNode`, `FreeSourceControlPanel`, …) |
| Shared helpers | `displayScale.ts` (secondary-arrow scaling + badge), `interfaceMarkers.ts` (charge / current glyphs), `currentDetails.ts` (live a11y description) |
| Colors / strings | `FieldBoundaryColors.ts`, `src/i18n/StringManager.ts` |
| Preferences | `src/preferences/` (Model, Node, QueryParameters) |

## Model conventions

- \(\varepsilon_0=\mu_0=1\) in sim units; UI exposes relative \(\varepsilon_r\), \(\mu_r\).
- \(\hat{n}=+\hat{y}\) from medium 2 into medium 1; tangential = \(x\).
- Angle \(\theta\) of the primary field is from the normal: \(\tan\theta=E_t/E_n\).
- Medium-2 fields are continuous with medium 1 (point toward \(+\hat{n}\)); drawn in the lower half-plane by anchoring the arrow tip at the interface and the tail at \((-E_t,-E_n)\). For equal media the two arrows are parallel. `medium2DisplayVector` is used only by component-axis overlays.
- Free surface charge \(\sigma_f\) (Electric) and free surface current \(K_f\) (Magnetic, along \(+\hat{z}\)) are adjustable on the interface and default to 0. With \(\sigma_f\ne 0\): \(D_{1n}-D_{2n}=\sigma_f\) (Dₙ discontinuous). With \(K_f\ne 0\): \(H_{2t}-H_{1t}=K_f\) (Hₜ discontinuous). The equation strip and component-overlay highlighting switch to reflect the sourced BC.
- Bound sources (toggle on each screen, default off) via `BoundSourceNode`, hollow dashed glyphs offset from the free markers:
  - Electric: \(\vec{P}=(\varepsilon_r-1)\vec{E}\), \(\sigma_b=P_{1n}-P_{2n}\); explains \(E_{1n}-E_{2n}=\sigma_f-\sigma_b\).
  - Magnetic (dual): \(\vec{M}=(\mu_r-1)\vec{H}\), \(K_b=M_{2t}-M_{1t}\); explains \(B_{2t}-B_{1t}=K_f+K_b\).
- The model-view transform must stay **isotropic**: `MODEL_HALF_HEIGHT` is derived from the play-area aspect ratio, never hard-coded. Anisotropy makes drawn angles disagree with the \(\theta\) readout and the protractor (guarded by `tests/common/view/transform.test.ts`).
- \(\varepsilon_r\) / \(\mu_r\) sliders are logarithmic with per-screen ranges and per-screen presets (`ELECTRIC_PRESETS` / `MAGNETIC_PRESETS`); D/B and P/M arrows are scaled to fit and show the factor as a `×0.46` badge.
- Gaussian pillbox (Electric) / Amperian loop (Magnetic): draggable along the interface and collapsible in height, with a live per-face tally. Collapsing it turns \(\oint\vec{D}\cdot d\vec{A}=Q_{f,\mathrm{enc}}\) into the boundary condition in front of the student.

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
The "current details" region is a live `DerivedProperty` built in `currentDetails.ts` —
keep it dynamic, or a non-visual student hears nothing about the fields themselves.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

`npm run release` intentionally skips `npm test` in some sims — append `&& npm test` before the version bump so a release cannot ship a failing suite.

## Compliance carve-outs

- **Hardcoded colors:** `rgba(255, 224, 130, 0.07)` fill on the flux-box outline in
  `src/common/view/FluxBoxNode.ts` — a near-transparent highlight wash over the themed stroke so the
  selected region reads in both profiles. Not a UI chrome token; theming it would invite a projector
  value that either vanishes or paints a solid tint over the field.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. LightPropagation keeps a higher `three` pin — do not force 0.125 there. |
| `brace-expansion` | `~5.0.9` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895). |

## Non-goals (v1)

Optical rays / Fresnel / TIR; curved interfaces; time-harmonic waves.

Not yet built: a **Predict mode** (hide the medium-2 arrows, let the student place a
ghost vector, reveal with component-wise feedback). Nothing in the UI currently asks
the student to commit to a prediction — see `doc/learning-goals.md`.
