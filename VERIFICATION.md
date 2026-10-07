# Verification

Checked on 2026-10-07 against the Vite production build.

- Production build succeeds; both `index.html` and `portfolio-orbit.html` are generated.
- Dependency installation reported zero known vulnerabilities.
- Visually reviewed desktop (1440 × 1000) and mobile (390 × 844) layouts.
- No horizontal overflow at the tested mobile width.
- Project dialogs open from orbital labels and the project list.
- Repository links point to the corresponding 4imaN project.
- Escape dismisses the native dialog.
- Reduced-motion preference starts the orbit paused.
- Copy-email control reports a successful clipboard copy.
- Simulated WebGL context loss activates the static fallback while all four projects remain accessible.
- No browser page errors observed during normal use.

The Three.js chunk is approximately 553 kB minified (137 kB gzip), loaded separately from the interface. Vite reports its default 500 kB chunk-size advisory. External fonts have local fallbacks. Physical-device performance and screen-reader behavior have not been tested.
