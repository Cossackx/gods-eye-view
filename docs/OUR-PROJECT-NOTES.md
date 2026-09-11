# Cossackx God's Eye View — Project Notes

> **Fork-specific operational notes.** Keep this file for decisions, baseline observations, and maintenance instructions that belong to the Cossackx fork. Keep upstream runtime behavior documentation in `docs/CURRENT-STATE.md`; do not duplicate its implementation-level detail here.

**Last reviewed:** 2026-09-11  
**Local repository:** `C:/Users/aleks/Projects/gods-eye-view`  
**Fork:** <https://github.com/Cossackx/gods-eye-view>  
**Upstream:** <https://github.com/bilawalsidhu/gods-eye-view>

## Current product status — 2026-09-11

The confirmed direction is a World Monitor dashboard shell with God's Eye 2D and 3D in the same map pane. Both projects' catalogs are in scope, with paid, unavailable, restricted and unconfigured entries explicitly labelled rather than implied live. AGPL reuse is accepted in principle; preserve MIT and third-party notices and review source/data terms. The product remains private, standalone, no-AI, no-M365, zero-monthly-cost priority, with no promotional or hosted-account CTA. Personal saved notes and bookmarks are in scope, and implementation tasks should remain cheap and bounded.

Experimental code exists at `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`; it is not merged into this repository and is not deployed. Acceptance is blocked by unresolved 3D border/texture alignment and poor default UX. The higher-resolution Iran NaturalEarth50m candidate was tested by parent request interception only: promising in 2D, failed in 3D, and not deployed. Winding/global-fill and CSS opaque-black fixes are narrower experiments, not all-border success. Earlier test passes and prior Google/AIS/TomTom local checks are historical scoped evidence; they do not establish a whole-suite result or current credential validity. See [PROJECT-STATUS.md](../PROJECT-STATUS.md) and [README.md](../README.md) when created.

## 1. Repository relationship and update model

This repository is a GitHub fork of Bilawal Sidhu's open-source God's Eye View project.

```text
upstream official repository ── origin ──┐
                                         ├─ local main ── fork ──> Cossackx/gods-eye-view
Cossackx GitHub fork ────────────────────┘
```

The remote names are intentionally non-standard but unambiguous:

| Remote | URL | Purpose |
| --- | --- | --- |
| `origin` | `https://github.com/bilawalsidhu/gods-eye-view.git` | Read new official releases and fixes. Do not push custom work here. |
| `fork` | `https://github.com/Cossackx/gods-eye-view.git` | Publish Cossackx branches and `main`. |

### Safe upstream-sync procedure

Only sync while `git status` is clean:

```bash
git checkout main
git fetch origin
git merge --ff-only origin/main
git push fork main
```

`--ff-only` is deliberate: it refuses an unexpected merge commit. If it refuses, stop and inspect the divergence rather than forcing a merge.

### Safe customization procedure

Never make experiments directly on `main`.

```bash
git checkout main
git pull --ff-only fork main
git checkout -b tweak/short-description
# edit and test
git add <files>
git commit -m "tweak: short description"
git push -u fork tweak/short-description
```

Merge the branch into `Cossackx/gods-eye-view:main` through a pull request, then update the local checkout with `git checkout main && git pull --ff-only fork main`.

## 2. Historical verified baseline at the 2026-09-10 review

| Item | Result |
| --- | --- |
| Checked-out branch | `main` tracking `fork/main` |
| Working tree | Clean before this notes file was added |
| Fork and upstream divergence | `0 / 0` commits in either direction |
| Current upstream/fork commit | `759652207fd1279ece97f0f19af566feb9a82146` — `fix: improve mapped installations and map-source guidance (#183)` |
| Current package version | `0.1.1` |
| Node runtime used | `v24.19.0` (within the declared supported range) |
| Production build | Passed: Vite 6.4.3, 157 modules transformed, 2.81 s |
| Unit suite | **Not clean:** 2,704 passed, 1 failed, 2 skipped, 2,707 tests total; see §6 |
| Tracking regression | Not run; it requires the local dev server |
| Map-source tray QA | Not run |

The exact package engine policy recorded then was Node `>=24.14.0 <25 || >=26 <27`. This section is historical and must not be read as a current Git, build, test, or credential claim without a fresh check.

## 3. Provider inventory (values withheld)

The setup doctor was run on 2026-09-10. It confirms configuration state only; it does not prove an upstream key is valid, billed, unrestricted, or within quota.

| Capability | Variables | Current local state | Needed? |
| --- | --- | --- | --- |
| Direct Google photorealistic 3D and place search | `GOOGLE_MAPS_API_KEY` | Configured; doctor selects direct Google 3D | Optional; currently in use. Restrict by HTTP referrer and Google API restrictions. |
| Cesium ion map/terrain route | `CESIUM_ION_TOKEN` | Not configured | Optional alternative/addition to direct Google; use a public `assets:read` token with URL restrictions. |
| Voice, HUD summary, realtime token broker | `OPENAI_API_KEY` | Not configured | Optional; required only for voice/AI features. Model/voice settings are present but inert without this key. |
| Authenticated worldwide flights | `OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET` | Not configured while `OPENSKY_AUTH_MODE=oauth` | Optional but recommended for authenticated OpenSky access. Alternatively set `OPENSKY_AUTH_MODE=anon` for rate-limited anonymous access. |
| Live vessels | `AISSTREAM_API_KEY` | Configured | Optional; currently in use. |
| Live NASA FIRMS active fires | `FIRMS_MAP_KEY` | Not configured | Optional; required to populate the Fires layer. |
| Live TomTom traffic | `TOMTOM_API_KEY` | Not configured | Optional; without it the app uses built-in traffic simulation. |
| Higher Launch Library 2 allowance | `LL2_API_TOKEN` | Not configured | Optional; public access is available with a lower allowance. |
| Higher TfL JamCams allowance | `TFL_APP_KEY` | Not configured | Optional; the keyless public endpoint remains available. |

Do not record secret values here. The local `.env` is the terminal-run source of truth; the in-app **POWER UP → Provider Settings** panel is the simplest supported way to add or replace values. Under Pinokio, credentials instead belong in the ignored `pinokio/ENVIRONMENT` file.

## 4. What the application is

God's Eye View is a browser-based spatial-intelligence console built with vanilla ES modules, CesiumJS, and Vite. It presents a 3D globe and combines public, live or refreshed sources including flights, military flights, vessels, satellites, earthquakes, launches, traffic, CCTV, radio, and selected infrastructure datasets. Optional providers add Google photorealistic 3D/place search, Cesium ion capabilities, live fire data, traffic, AIS, and voice control.

The application starts in a useful keyless mode with Esri World Imagery and keyless terrain, falling back to OpenStreetMap when needed. Provider keys are optional upgrades and must remain local; `.env` and Pinokio credential files are ignored by Git.

## 4. Architecture map for custom work

| Area | Main location | Notes |
| --- | --- | --- |
| App panels, HUD, controls, application UI | `src/ui.js` | Largest source module (~456 KB); modify in small, well-tested increments. |
| Visual CSS | `style.css` | Best starting point for branding, color, spacing, and non-behavioral visual changes. |
| Data layers | `src/data/` | Layers follow a lifecycle interface: `init`, `enable`, `disable`, `update`, `destroy`, `getStats`; some also implement detection helpers. |
| Layer orchestration | `src/data/manager.js` | Coordinates layer lifecycle and user-visible state. |
| Flights / military / CCTV | `src/data/flights.js`, `src/data/militaryFlights.js`, `src/data/cctv.js` | Large, high-coupling modules; change cautiously. |
| Voice actions | `src/voice/gevActions.js` | Client-side execution of voice actions. |
| Voice tool definitions and server proxies | `vite.config.js` | Keep secrets and private-key calls on this server side. |
| Visual shader styles | `src/styles/` | GLSL/post-process appearance modes. |
| Runtime implementation contract | `docs/CURRENT-STATE.md` | Detailed authoritative upstream behavior record; update with any behavior change. |
| Known active defects | `docs/KNOWN-ISSUES.md` | Current issue list, but its last stated update is 2026-07-08. |
| Provider/data licensing and attributions | `DATA_SOURCES.md` | Update whenever adding/changing a data source; retain in-app credits. |

### Design constraints worth preserving

- Keep UI control logic separate from self-contained data-layer logic.
- Keep private credentials behind the Vite proxy. Do not put secrets in browser modules, committed files, screenshots, or project notes.
- The render governor must be notified by new per-frame animation and discrete scene mutations; see `docs/CURRENT-STATE.md`.
- Add tests beside behavior changes. The project has an extensive Node unit suite.
- Update `docs/CURRENT-STATE.md`, `CHANGELOG.md`, and `DATA_SOURCES.md` as applicable when changing runtime behavior or sources.

## 5. Local and cloud development

### Local run

```bash
cd C:/Users/aleks/Projects/gods-eye-view
npm ci
npm run doctor
npm run dev
```

Open <http://localhost:4173>. Stop the server with `Ctrl+C`.

### Standard checks

```bash
npm run build
npm test
# with npm run dev still running in another terminal:
npm run test:track
npm run qa:map-source-tray
```

### Cloud-only option

GitHub Codespaces can run the same workflow in a browser. Create the Codespace from the Cossackx fork, run the commands above in its terminal, and test through the private forwarded port 4173 URL. Treat a Codespace as a cloud computer: do not place long-lived secrets in committed files.

## 6. Current quality and risk register

### Unit-test baseline failure

A direct run on 2026-09-10 produced one failure:

```text
src/cameraHandoff.test.mjs:83
voice Cockpit entry reaches the camera only through stamping seams
AssertionError: Cockpit entry transaction is missing
```

The same run reported 2,704 passes, 1 failure, and 2 skipped tests. This was observed immediately after syncing to upstream commit `7596522`; no local implementation change was made to suppress or repair it. Treat it as an upstream baseline issue until independently reproduced and fixed. Do not claim a fully green suite until it passes.

### Dependency audit

`npm audit --omit=dev` reported two moderate-severity transitive production dependency advisories, both beneath Cesium 1.138.0 through `@cesium/engine`:

| Package | Advisory themes | Action |
| --- | --- | --- |
| `dompurify` 3.4.14 | custom-element hook bypass / allowed-attribute pollution / detached-subtree XSS cases | Watch Cesium and DOMPurify release notes; test an upgrade in a branch. |
| `protobufjs` 8.7.2 | prototype mutation from text-format map parsing; `.proto` option parsing denial of service | Watch Cesium and protobufjs release notes; do not manually override without compatibility testing. |

These are dependency-audit findings, not proof that the app currently exposes an exploit path. They should be revisited before any public or commercial deployment.

### Performance and product limits

- The documented performance baseline is Apple M5 / Chrome 150 only; it explicitly does **not** establish Windows performance.
- CCTV had the slowest measured cold activation (~19.6 s in the documented M5 capture).
- Dense detection, Snow, Noir, and combined operational scenes have the greatest measured frame-rate pressure.
- The first-run Infrastructure tile was intentionally removed because the full-earth data-center/dam/cable combination creates roughly 5,700 entities and harms frame rate.
- Known active issues include uneven street-traffic coverage in dense cities, potentially off-screen persisted CCTV panels, and transient height-datum residuals for newly observed grounded aircraft.

## 7. Data, licenses, and deployment cautions

- MIT covers the application source code, **not** all bundled or live data.
- `src/data/local_data/telegeography_submarine_cables/` is CC BY-NC-SA 3.0. Remove it or obtain a license before commercial use.
- OpenSky access is non-commercial research/education by default and may require a separate agreement for operational use.
- Google News RSS is documented as personal/non-commercial; commercial deployments need to disable/replace it or obtain permission.
- Google Maps, Cesium ion, TomTom, NASA FIRMS, AISStream, and OpenAI capability depend on their respective keys, terms, billing, quotas, and restrictions.
- Do not remove provider and source attribution. New sources require both a `DATA_SOURCES.md` entry and an in-app `DATA_CREDITS` entry.

## 8. Recommended next actions

1. Make one low-risk visual customization in `style.css` on a `tweak/` branch to practice the workflow.
2. Run and visually inspect the app on the target Windows machine; do not extrapolate from the Apple-only performance record.
3. Reproduce the one unit-test failure on a clean Codespace or fresh clone before assigning ownership or attempting a fix.
4. Before public deployment, resolve/reassess the two transitive audit advisories and conduct a provider/license review for the intended use.
5. Keep this fork note current whenever Cossackx adds decisions, custom features, deployment information, or accepted deviations from upstream.
