# Learning goals — Field Boundary

What a student should be able to do after using this sim. Everything in the UI
should serve one of these; anything that serves none of them is decoration.

## Primary goals

A student who has used both screens should be able to:

1. **State which field components are continuous across a planar interface, and
   which are not** — Eₜ and Dₙ (electric), Hₜ and Bₙ (magnetic) — and say what
   the discontinuity in the others *is*.
2. **Predict the direction of the field in medium 2** given the field in medium 1
   and the material parameters, at least qualitatively (does it bend toward or
   away from the normal?).
3. **Explain the jump in terms of surface sources rather than as a rule.** The
   normal-E jump is surface charge; the tangential-B jump is surface current.
   With no free source, the jump is entirely *bound* — polarization or
   magnetization of the material itself.
4. **Derive a boundary condition from an integral law** by collapsing a Gaussian
   pillbox or an Amperian loop onto the interface and watching the side terms
   vanish.
5. **Recognize the E↔H duality**: the two screens are the same physics with
   Eₜ ↔ Hₜ, Dₙ ↔ Bₙ, σ_f ↔ K_f, P ↔ M.

## Secondary goals

6. Read the limiting cases: matched media (no kink at all), εᵣ₂ ≫ εᵣ₁ (E₂ turns
   almost parallel to the interface), μᵣ₂ ≫ μᵣ₁ (flux funnelling — the basis of
   magnetic shielding).
7. Distinguish a *free* surface source, which the student sets, from a *bound*
   one, which the material produces in response to the field.

## Explicit non-goals

- Snell's law, Fresnel coefficients, total internal reflection. The picture
  resembles refraction and students already conflate the two; this sim is about
  boundary conditions and deliberately does not blur that line.
- Time-harmonic waves, curved interfaces, anisotropic or nonlinear media.
- Numerical accuracy in SI units. Sim units set ε₀ = μ₀ = 1 and field magnitudes
  are arbitrary; only ratios are meaningful.

## Consequences for the UI

These goals are why the sim is built the way it is:

| Goal | What serves it |
|---|---|
| 1 | Component overlay highlighting, equation strip, dynamic screen-summary description |
| 2 | Draggable field tip with **angle only** (magnitude on a slider), θ readout, predicted-vs-measured ratio |
| 3 | Bound-source layer: P / σ_b on Electric, M / K_b on Magnetic |
| 4 | Gaussian pillbox / Amperian loop with a live per-face tally and a collapse handle |
| 5 | Duality line in the equation strip; identical default configuration on both screens |
| 6 | Material presets that reach the limits, log parameter sliders, transient limiting-case callouts |
| 7 | Free-source slider defaults to 0; bound glyphs are hollow and offset from free glyphs |

## Known gap

There is still no point at which the sim **asks the student to commit to a
prediction** before revealing the answer. A "Predict mode" — hide the medium-2
arrows, let the student place a ghost vector, then reveal with component-wise
feedback — is the natural next step and needs no new model math. It is
deliberately out of scope for this pass.
