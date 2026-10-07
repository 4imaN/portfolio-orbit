# Portfolio Orbit

Aiman Mengesha’s personal portfolio: an interactive Three.js solar system, a browsable project index, and a responsive editorial layout.

## Run

Requires Node.js 20.19+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

Both `/` and `/portfolio-orbit.html` serve the portfolio. Deploy the generated `dist/` directory to a static host. GitHub repository publication does not automatically deploy the website.

## Edit

- `src/projects.js`: project descriptions, repository links, colors, and orbit settings.
- `src/orbit.js`: procedural Three.js geometry, lighting, interaction, and animation.
- `src/style.css`: layout, typography, responsive design, and motion preferences.
- `index.html`: biography, navigation, and contact details.

The production build copies the main entry to `portfolio-orbit.html`. Edit only `index.html`.

## Accessibility and resilience

The project list works independently of WebGL. Native dialogs support keyboard focus management and Escape. Animation respects reduced-motion preferences and can be paused. Rendering suspends when the scene is offscreen or the tab is hidden. Fonts load from Fontshare with local fallbacks; JavaScript dependencies are bundled locally.

## Design provenance

Reworked from the user-provided Claude Design export `Prsenal portfolio.zip`, particularly `portfolio-orbit.html`. Preserves the orbit metaphor, geometric satellites, green accent, and dark atmosphere. Replaces sample projects, unverified career claims, and placeholder links with the owner’s actual GitHub projects. The original ZIP is left untouched.

The 3D scene is procedural Three.js; no Blender or Higgsfield assets are required or represented as having been used.
