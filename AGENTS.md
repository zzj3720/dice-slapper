# AGENTS.md

## Cursor Cloud specific instructions

This is "Dice Slapper", a client-side-only 3D dice game built with React 19 + TypeScript + Vite 7 + Three.js. There are no backend services, databases, or Docker containers.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Vite Dev Server | `npm run dev` | 5173 | The only service. Add `-- --host 0.0.0.0` if you need network access from outside the container. |

### Common commands

All scripts are defined in `package.json`:

- **Dev server**: `npm run dev`
- **Lint**: `npm run lint` (ESLint)
- **Build**: `npm run build` (TypeScript check + Vite production build)
- **Preview**: `npm run preview` (serve the production build locally)

There are no automated tests configured yet.

### Caveats

- The app is still at M0 (scaffold stage). `src/App.tsx` contains the default Vite+React counter template. See `docs/PLAN.md` for the full game design.
- `package-lock.json` is present — use `npm` (not pnpm/yarn) as the package manager.
