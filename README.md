# Field Boundary

Interactive Maxwell **planar interface** boundary conditions for \(\vec{E}/\vec{D}\) and \(\vec{H}/\vec{B}\). Drag the incident field, change \(\varepsilon_r\) or \(\mu_r\), and watch which components stay continuous — not Snell’s-law ray optics (see OpticsLab).

## Features

- Electric screen: dielectric interface with \(\vec{E}\) and \(\vec{D}\), \(\varepsilon_r\) presets/sliders, adjustable free surface charge \(\sigma_f\), component overlay, field lines, protractor, and angle readouts
- Magnetic screen: same interaction grammar for \(\vec{H}\) and \(\vec{B}\) with \(\mu_r\) and free surface current \(K_f\)
- Equation strip highlighting continuous BC terms (\(E_t\), \(D_n\) or \(H_t\), \(B_n\)), switching to jump conditions when \(\sigma_f\) or \(K_f\) is nonzero
- Interface glyphs for free surface charge (\(+\)/\(-\)) and surface current (⊙/⊗)
- English, Spanish, and French localization via `StringManager`
- Default and projector color profiles
- Progressive Web App (installable, offline-capable)
- Shared GitHub Actions CI via `OpenPhysics/Baton`

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke (`?fuzz`, default 15s) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run rename` | Sim-level fork/rename (`--id`, `--name`) |
| `npm run scaffold-screens` | Emit N fleet-named screen packages from `intro/` (`--shared-model` optional) |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenPhysics org license](https://github.com/OpenPhysics/.github/blob/main/LICENSE).

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
