# Portfolio Orbit

Aiman Mengesha’s interactive portfolio, built with **Next.js App Router, React, strict TypeScript, Three.js, and Motion**.

Each planet represents a real project. Rotate the system, select a planet to approach it, and explore its details. The conventional project index remains available without WebGL.

## Run locally

Node.js 20.19+ and npm:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4174. The original `/portfolio-orbit.html` URL also works.

```sh
npm test
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build on port 4174. Stop an existing preview before using that port. Deploy this as a Next.js application; the old Vite `dist/` directory is no longer the build output.

## Structure

- `app/`: App Router entry, metadata, and responsive CSS.
- `components/Portfolio.tsx`: page content, transitions, and accessible native project dialogs.
- `components/Orbit.tsx`: lazy-loaded React wrapper and scene lifecycle.
- `lib/orbit-engine.ts`: typed Three.js scene, procedural planet textures, atmosphere shaders, camera travel, hover feedback, and rendering lifecycle.
- `lib/space-events.ts`: randomized comet and ship timelines, reusable geometry, and solar-refueling animation.
- `tests/space-events.test.ts`: visitor lifecycle and comet reuse checks.
- `lib/projects.ts`: project content, colors, repository links, and orbit settings.

## Motion and interaction

- Staged hero entrance and scroll-triggered section reveals.
- Textured, rotating planets with atmosphere rims and orbital trails.
- Hover/focus highlights; orbit selection approaches the chosen world.
- Detail navigation switches projects; Escape closes and returns to the previous camera view.
- Scroll-wheel and pinch zoom, full vertical/horizontal orbit rotation, and right-drag panning.
- Top (Y), Front (Z), and Side (X) camera presets, plus zoom buttons and reset.
- One-finger mobile page scrolling; two-finger scene rotation and pinch zoom.
- Random comet flybys and an alien saucer that approaches the sun, refuels with an energy beam, and departs. Pausing the scene freezes their timelines.
- Reduced motion bypasses camera interpolation and disables automatic orbit motion.
- Rendering pauses offscreen and in hidden tabs. All resources, observers, and listeners are disposed on unmount.

The contact address and repository links are configured in the source. No fake live demos or invented career milestones are included. Fonts use Fontshare with local fallbacks. No API keys or backend services are required.

## Design provenance

Reworked from the owner-supplied Claude Design export `Prsenal portfolio.zip`, particularly `portfolio-orbit.html`. The original archive is unchanged. The current artwork is procedural Three.js and CSS; no Blender or Higgsfield assets are represented as having been used.

## Planet sizes

Planet area is proportional to each project's tracked, nonblank source-line count: TI Oracle 8,304; Session Shelf 5,838; Gaz 2,367; WC26 1,844. Radius uses the square root of the count relative to the largest project. Project previews use the same proportions and detail panels show the counts.

`lib/source-lines.json` is a local snapshot, not a live GitHub counter. Counts include comments, tests, and source configuration; dependency folders, generated output, model/data artifacts, and generated Next.js declarations are excluded. Refresh from the original local repositories with:

```sh
python3 scripts/update-source-lines.py
```

Pass a Desktop directory as an optional argument if those repositories live elsewhere. Rebuild after refreshing.
