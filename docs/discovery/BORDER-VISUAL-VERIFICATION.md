# Globe border visual verification

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md). This report remains an inconclusive historical visual check: the original large-displacement issue was never visually accepted. Known renderer fixes (winding/global tint and black SVG `rgba(hex)`) do not establish map correctness; the naturalearth50m IR candidate and route-intercept results remain unapproved/unapplied.

Date: 2026-09-11

## Verdict

**INCONCLUSIVE for a border-rendering pass; visual acceptance fails.** The original
GlobeMap was exercised in a real Chrome instance against `http://localhost:4187`
using the private checkout at
`C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`. The 3D control
selected `#mapContainer.globe-mode`, but the requested Iran-centered views did
not both produce a recognizable Persian Gulf/Caspian framing.

- URL `lat=32&lon=53&zoom=4`: Iran is visible on the globe, with a recognizable
  red Iran-shaped overlay and nearby Gulf/Caspian geography, but the settled URL
  was rewritten to `lat=32.0000&lon=52.7195`; the view is not a clean centered
  acceptance frame.
- Tehran `[51.389,35.689]`, URL zoom 7: Iran and both water bodies are visually
  recognizable, but the screenshot is a broad, noisy dashboard view rather than
  a precise landmark comparison.
- Hormuz `[56.3,26.6]`, URL zoom 7: the globe view is too close/settled away from
  recognizable land and does not show Hormuz or a usable Persian Gulf outline.

No genuine border bug can be separated from view settling/URL normalization,
texture registration, or projection using these captures. Do not claim a visual
pass or make another renderer edit from this evidence.

## Actual seam observed

The diagnostic used the real visible `3D Globe` button (`.map-dim-btn[title="3D
Globe"]`) and waited for `.globe-mode`; no guessed global map hook was used.
The only matching exposed window helper was the source-defined `window.geoDebug`,
whose actual API is `{ cells, count }`. No `getScreenCoords`, raycast, or
GlobeMap instance was exposed. The live map canvas was `862x689` CSS/device
pixels. The settings/mobile menu was not open in the captured frames; the layer
tray is ordinary map chrome, not the menu.

The live URL changed longitude during app state serialization:

- requested 53 -> settled 52.7195
- requested 51.389 -> settled 51.0595
- requested 56.3 -> settled 55.9570

That systematic offset is evidence that the URL/viewport path must be inspected
before interpreting pixels as a border offset.

## Numeric fixture check

Pinned `public/data/countries.geojson` feature `ISO3166-1-Alpha-2=IR` is a 57-point
Polygon with bounds:

```text
longitude 44.061372..62.753564
latitude  25.202094..39.685279
```

Both Tehran `[51.389,35.689]` and Hormuz `[56.3,26.6]` lie inside those numeric
bounds. This confirms the expected `[longitude, latitude]` order but does not
prove live pixel alignment.

## Artifacts

- Diagnostic source: `globe-border-diagnostic.mjs`
- Machine report: `globe-border-diagnostic.json`
- Captures: `borders-diagnostic-url-iran.png`, `borders-tehran.png`,
  `borders-hormuz.png`
- Existing parent captures were not modified: `borders-before-globe.png` and
  `borders-after-globe.png`

The first browser-harness attempt timed out. The fallback executable Playwright
run succeeded with installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
The page emitted unrelated local-dev 404/503/CORS/data-feed errors; none gave a
usable coordinate/raycast seam, so they are recorded as environment noise rather
than border findings.
