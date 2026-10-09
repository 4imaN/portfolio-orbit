# Verification

Checked on 2026-10-09 against the Next.js 16.4 production build.

- `npm run typecheck`: strict TypeScript passes.
- `npm run build`: App Router compilation, prerendering, and type validation pass.
- Package installation reports zero known vulnerabilities.
- `/` and the compatibility URL `/portfolio-orbit.html` load the new application.
- Desktop layout reviewed at 1440 × 1000; mobile reviewed at 390 × 844.
- Textured planets, scene labels, project index, and detail panels render correctly.
- Planet selection approaches its world; the detail panel does not obscure the selected world on desktop.
- Next-world navigation changes project details and selected planet.
- Escape dismisses the dialog, releases scroll lock, and restores focus to the trigger.
- Reduced-motion preference starts the orbit paused and bypasses camera interpolation.
- Mobile has no horizontal overflow and exactly one canvas with four planet labels.
- Verified a hidden-tab initialization case: hero opacity remains 1, the initial scene draws synchronously, and Gaz opens Gaz rather than an overlapping unpositioned label.
- Simulated context loss activates fallback while retaining all four project controls and visible content.
- No browser page errors observed during the normal production flows.

Rendering resources, DOM labels, observers, and event listeners have explicit disposal on React unmount. Continuous rendering suspends offscreen and in hidden tabs; initial and resize draws still produce a usable static frame.

Physical-device performance, automated accessibility audits, and screen-reader behavior have not been tested. External fonts use local fallbacks. The 3D code is loaded separately; no generated video assets or external media services are needed.
