# God's Eye / World Monitor — Current Project Status

**Record reconciled:** 2026-09-11 night (EDT). **Owner:** Raz. **Status:** experimental implementation; NOT user-accepted, production-ready, or cloud-deployed.

This is the current status reference. [Approved direction](APPROVED-INTEGRATION-DIRECTION.md) owns product decisions; [development plan](DEVELOPMENT-PLAN.md) owns delivery gates. Historical discovery reports are evidence with limits, not cumulative proof of completion.

## Objective and approved decisions

Build a private standalone web dashboard using World Monitor's information layout and God's Eye's spatial capabilities. Keep surrounding panels visible when switching 2D/3D within the map pane. The circular scope is not the default UX.

- Include both pinned projects' complete feed catalogs. Mark paid, restricted, missing-key and unavailable sources; do not promise all sources live.
- Zero additional monthly cost takes priority; reduced refreshes/unavailable sources accepted. No automatic paid fallback or compulsory always-on local backend.
- AGPL-compliant source reuse accepted; retain MIT and third-party notices. This does not grant access to hosted World Monitor APIs or third-party data.
- ~~No AI initially~~ Superseded 2026-09-11 (owner): AI features run on OpenRouter **free-tier models only**, discovered live and cycled on rate limits (`LLM_FREE_POOL=1`, `LLM_FREE_ONLY=1`); no paid model is ever requested. Free-tier accounts are capped at ~50 free-model requests/day until $10 of credits is bought once (then ~1,000/day). No M365 dependency. Save bookmarks, notes, source links and permitted recent event metadata; retention remains undecided.
- Remove hosted marketing, upgrade pitches and account-acquisition CTAs. Preserve attribution and real security checks.
- Prefer cheaper, bounded children for independent work; parent verifies actual results. No open-ended repeated investigations or simultaneous edits to shared files.
- User permits selecting one map engine if necessary. Decided 2026-09-11: Cesium is the single 3D engine; globe.gl is retired from the product path.
- Decided 2026-09-11 (owner): "everything is wide open, this is a personal project." The private build unlocks every Pro-gated layer, panel and export and shows no lock, PRO badge, upgrade or sign-in prompt. Hosted-product branding is removed. Entitlement/auth code stays in place for hosted mode only.

## Where the records and code live

| Object | Exact location / state verified during this reconciliation |
| --- | --- |
| God's Eye repository and main documentation | `C:/Users/aleks/Projects/gods-eye-view` |
| God's Eye local revision | `759652207fd1279ece97f0f19af566feb9a82146`; `main` tracks `fork/main` |
| Owner fork | https://github.com/Cossackx/gods-eye-view |
| God's Eye upstream | https://github.com/bilawalsidhu/gods-eye-view |
| Experimental World Monitor checkout (durable, from 2026-09-11) | `C:/Users/aleks/Projects/worldmonitor`, branch `experimental/gev-cesium-prototype-20260911`, head `62442db25` (2026-09-11 night; the prototype snapshot was `10d478a88`), pushed to https://github.com/Cossackx/worldmonitor (`fork`); upstream koala73 is `origin` |
| Superseded temporary checkout | `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery` holds the same commit; retire once no session is using it |
| World Monitor base revision | `d906869231970005ab3e108ff5321f179e8b7457`; prototype committed on the experimental branch above (56 upstream commits behind as of 2026-09-11) |
| World Monitor upstream | https://github.com/koala73/worldmonitor |
| Existing KM project hub | `C:/Users/aleks/RAZSOC/projects/gods-eye-view.md` |

The merged prototype is NOT in the God's Eye main branch and is not cloud-deployed. As of 2026-09-11 night the World Monitor work is committed on the experimental branch and pushed to the fork (head `62442db25`), and this documentation is committed on God's Eye `main` (tracking `fork/main`). Generated changes remain mixed with authored changes on that branch, and no production build has been accepted.

### Preview addresses (last used; not a current uptime guarantee)

- `http://127.0.0.1:4173/`: separate original God's Eye application.
- `http://127.0.0.1:4200/?cesiumSpike=1`: **current** private local path. Start with `LOCAL_AIS_PREVIEW_PORT=4200 LOCAL_AIS_RELAY_PORT=4201 node scripts/local-ais-preview.mjs --env <God's Eye .env> --with-opensky --with-llm` in `Projects/worldmonitor` (AIS relay on 4201). The review capture runs against it.
- `http://127.0.0.1:4187/` and `?cesiumSpike=1`: earlier Temp-checkout server (`VITE_PRIVATE_WORKSPACE=1`); superseded.
- `http://127.0.0.1:4186/cesium-spike.html`: isolated fixture smoke page, NOT the dashboard.
- Port 4185 was an earlier non-private presentation server; do not use it as the current canonical preview.

“Private presentation” hides commercial UI. It does NOT establish production authentication. Localhost scope and an authenticated cloud deployment are separate controls.

## Implemented, with verification limits

| Work | Observed result | What is NOT established |
| --- | --- | --- |
| Cesium map adapter and bridge | Real Chrome mount/destroy/remount and in-pane canvas exercised; camera/lifecycle/URL checks exist | Full God's Eye tracking/terrain/style integration; every layer; production asset delivery |
| Mode controls | 2D/3D active state and switching corrected; experimental parameter retained in dev | All camera-state transitions are accepted; final engine choice |
| Cesium dependency failure | Matching engine/widgets pinned and deduplicated; real OSM globe rendered without maximumTextureSize error | Complete production build/deploy; all later border cases |
| Missing generated inventory import | Supported inventory generator and check ran; module changed HTTP 500→200; browser overlay cleared | Every generated artifact or full build is healthy |
| Private UI | Header Pro/hosted sign-in CTAs, footer Pricing and Discord popup suppressed and browser-checked. 2026-09-11 evening: hosted-product branding also removed in private mode (author handle and X/GitHub credit links, version badge, footer brand block, Blog/Status/GitHub/X/Download links, layer-tray author badge in 2D and 3D); kept: MONITOR title, reference links, Docs, copyright attribution. Source-level gate tests + live check. | Authentication can be removed; hosted metadata in index.html (canonical/og URLs, schema.org author) is untouched |
| Everything unlocked (2026-09-11 evening) | Private workspace resolves as fully entitled at the three seams the app consults (entitlements state, hasPremiumAccess, isProUser). Live check: 86 panels, 0 locked toggles, 0 PRO badges, 0 upgrade prompts. Hosted-mode gating tests unchanged (73 DOM + 53 node pass). | Server-side premium endpoints still need provider/LLM credentials; a denial renders as unavailable, never as an upsell. |
| Free-tier LLM route (2026-09-11 evening) | OpenRouter key stored in the God's Eye env (never in the repo); launcher `--with-llm` forwards it. Free pool discovered from /models, cycled on 429/5xx/404, paid rung removed, summarizer cycles too, premium RPCs granted locally. Live: summary answered by a free model after the primary rate-limited; OpenRouter shows $0.00 usage. | Daily free-request cap (~50/day); the key was pasted in chat and should be rotated (paste the new one into the env file, not chat); AI Insights and other LLM panels not yet exercised one by one. |
| Country vs regional conflict geometry | Shared resolver keeps exact country input; labels regional approximations; no guessed national fallback | Border accuracy at every zoom or across all renderers |
| Globe polygon winding | Unconditional reversal created spherical complements; normalization and holes tests added; broad orange tint cleared | Exact border/texture visual acceptance |
| SVG black fill | Invalid rgba(hex) caused black after animation stopped; color-mix produced transparent 20% red in Chrome | Full SVG usability or all CSS colors checked |
| Keyless Esri imagery + Re:Earth terrain in Cesium (2026-09-11, `Projects/worldmonitor`) | Esri World Imagery is the default 3D basemap with required on-screen credit; two tile failures or construction failure fall back to OSM with a visible notice. Re:Earth quantized-mesh terrain installs lazily; flat ellipsoid stays if unreachable. Headless Chrome acceptance PASS with real relief (Damavand area 5,293 m). 19 DOM tests, app + DOM typechecks, biome pass. | Photorealistic (ion) route; layer parity; production build; the embedded Claude browser pane suspends requestAnimationFrame so Cesium needs manual render pumping there (harness quirk, not app behaviour) |
| Conflict zones + country boundaries on Cesium (2026-09-11, `Projects/worldmonitor`) | Country-mapped zones use the canonical `/data/countries.geojson` polygons (with holes) as terrain-classified ground primitives; regional zones keep their approximate polygon, orange, labelled. Conflict click opens the shared MapPopup; bare click resolves the country; fitCountry/highlightCountry work. Headless Chrome acceptance PASS: Iran entity present, real mouse click opens "Iran War Theater" popup, bare click returns IR, layer toggle changes 13.4% of a wide frame. 26 DOM tests, typechecks, biome pass. | Full layer parity (adapter still renders 6 of ~65 layers); CII choropleth and scenario polygons; production build. The globe.gl winding fix remains an upstream bug find, no longer on the product path. |
| Layer parity on Cesium (2026-09-11, `Projects/worldmonitor`) | New `CesiumMarkerLayers.ts` builders + adapter pipeline render every layer GlobeMap renders: 33 feed setters, bundled static layers, ground-clamped cables/pipelines/storm tracks, orbit trails at altitude, CII/scenario/footprint polygons, shared marker budget, popup/tooltip click routing. Headless Chrome acceptance PASS: all 12 bundled layers rendered, live feeds that arrived rendered, all-off leaves zero entities. 31 DOM tests, typechecks, biome pass. | Layers GlobeMap never rendered (sanctions, canada*, finance/tech-HQ, positive/kindness, renewables, mining/commodity, disease, storage, fuel, liveTankers) stay unsupported on both globes; satellite beam cones and AIS density heatmap not ported; production build. |
| Live feeds on the local path (2026-09-11 evening, `Projects/worldmonitor`) | Launcher runs the AIS relay (your AISStream key, read from the God's Eye env, never stored) plus the private dev server; keyless adsb.lol military aircraft added to the local aircraft path ahead of anonymous OpenSky. Verified: relay 4,000-7,000 live vessels, snapshot dataAvailable:true, 272 aircraft from adsb.lol rendered in 3D. Hermes's post-snapshot AIS/aircraft fixes carried into the durable branch. | OpenSky credentials empty (anonymous quota only); no all-ships civilian AIS layer exists in World Monitor (needs a new private RPC over the relay snapshot); military vessels depend on USNI/Redis; relay must be running locally (no free always-on host). |
| Dashboard panels on the local path (2026-09-11 night, `Projects/worldmonitor`) | Every "Temporarily unavailable" panel family was traced to a hosted-only dependency and, where a keyless upstream exists, given a private-build fallback (all gated on `VITE_PRIVATE_WORKSPACE=1`, hosted path unchanged): Markets / Metals & Materials / Energy Complex tape (Yahoo spark), Macro Stress (FRED CSV), Predictions (Polymarket Gamma), AI Strategic Posture (adsb.lol per theater), Stock Analysis / Backtesting (Yahoo 429 on the shared Chrome UA; private build sends its own UA). Dev router now answers `/api/bootstrap` with a clean miss instead of JS source and mounts the forecast service; correlation panels (Force Posture, Escalation, Economic Warfare, Disaster Cascade) wait for the in-page engine instead of erroring. Every remaining Pro chip/label is gated in the private build (settings tabs, upgrade card, mobile category, widget chat, panel-layout widget badges, evidence-export title). Live-verified after launcher restart. Still hosted-only: **AI Forecasts** (needs the LLM forecast seeder + Redis), **Oil Inventories / Energy inventory widgets** (need a free EIA key and GIE AGSI key forwarded by the launcher), GSCPI stress component, Kalshi leg of Predictions. |
| All-ships layer + click-to-track on Cesium (2026-09-11 night, `Projects/worldmonitor`) | Carry-over step 4, ship half. The relay gains a private, bbox-scoped all-vessel listing (`/ais/vessels`, only with `RELAY_PRIVATE_VESSELS=true`, which the launcher sets); the dev server exposes it as `/api/private/ais/vessels` and adds `/api/private/vesselapi/bbox` (VesselAPI check: 4-degree span guard, 12/day cap, monthly quota echoed from the response header). The Cesium adapter polls the camera's view every 20 s while the Ship Traffic layer is on, draws every contact with MarineTraffic-style class colours (moving = triangle, stationary = dot, VesselAPI = hollow diamond), keeps a session trail per MMSI, and opens a Track / Follow / Stop card on click; a status chip shows counts and the "Check VesselAPI here" button. Browser acceptance `cesium-ship-traffic-acceptance.mjs` PASS on the Dover Strait: 91 ships in view, card opens, Track arms the trail, layer off removes everything. Trail polyline needs a second distinct fix; the volunteer feed re-reported the tracked ship's position unchanged inside the 70 s window, so the trail was not observed in that run. Hosted code paths unchanged (route absent without the flag). Still open: Gulf/Hormuz stays empty on the relay (no volunteer receivers), so VesselAPI is the only source there and costs quota; aircraft half of step 4 (all civil aircraft + click-to-track) not started. |
| 3D pane chrome and readability (2026-09-11 night, `Projects/worldmonitor` `62442db25`) | The 15:00 default-layout frames showed the Cesium pane with no layer picker, time range, zoom or legend (every renderer builds its own chrome inside the map container and the adapter built none), regional conflict labels stacked at world scale, vessel-cluster counts as bare red digits, no country borders in 3D, the Cesium ion logo despite no ion asset, and a light-mode capture (Playwright default; Windows runs dark). Fixed: new `CesiumMapChrome` reproduces the shared picker/time-range/zoom/legend markup with truncation badges and wires the layer hooks; regional labels centred and shown only within ~3,000 km; numeric badges ringed; all 270 country rings drawn as clamped outlines from the canonical GeoJSON; nearest-first budget re-selects after camera moves; credits docked bottom-right without the ion logo (main.css sits in `@layer base`, so the widget override needs `!important`); banner moved off the time selector. The review script captures dark mode, reads picker rows correctly, waits for feeds and markers, proves the 3D picker drives the renderer, asserts the private build and fails on page errors. Verified: tsc (app + DOM tests), 32 adapter DOM tests (5 new), biome, safe-HTML gate, review capture PASS 10/10, conflict-polygon and layer-parity acceptance PASS. | Raz's accept/reject of the frames (M1); `getLayerStatus` still reports an empty live feed as "unsupported"; production build. |

## Border investigation: resolved on the Cesium path (2026-09-11); globe.gl history below

> **Disposition 2026-09-11:** Cesium is the single 3D engine. Conflict and country polygons are now drawn on Cesium from the canonical country GeoJSON as terrain-classified ground primitives, and browser acceptance (`cesium-conflict-polygons-acceptance.mjs` in `Projects/worldmonitor`) shows a local Iran-sized footprint with real terrain conformance. The globe.gl findings below remain a correct upstream bug report, but they are no longer on the product path and no further globe.gl border work is planned.

The user showed substantial border/fill mismatch in 2D/3D and rejected the visual quality. Several narrower defects were corrected, but no complete visual acceptance was obtained.

Corrections to earlier claims:

1. The diagonal Pakistan polygon is the configured Pakistan–Afghanistan regional conflict area, not Iran's fallback border. Same color did not mean same selected country.
2. The crude-looking map screenshot did not prove SVG fallback. Subsequent live checks showed DeckGL/WebGL2 and no fallback exception.
3. A canvas, valid coordinates, geographic texture or passing tests alone does not prove coastline alignment.
4. Country IDs remaining IR/IRN do not prove two datasets preserve identical political/disputed boundaries.
5. Both apps' known-good behavior must be compared against our changed version before assuming an engine replacement is necessary.

### Higher-resolution Iran candidate — NOT applied

- Bundled Iran geometry: 57 points; source provenance not fully established beyond the introducing World Monitor commit.
- Natural Earth Admin 0 50m candidate: 605 points, two rings, same IR/IRN identifiers. Source pin `ca96624a56bd078437bca8184e78163e5039ad19`.
- Parent injected the candidate into a browser request for comparison only. 2D screenshot looked broadly aligned; 3D remained failed/inconclusive.
- Candidate files remain under the temporary checkout's `docs/discovery/boundary-resolution-candidate-iran*`.
- Do not promote as a complete border fix or silently substitute every country's political boundaries.

## Verification ledger

Current checkpoint first; the rest are historical checkpoints not rerun for this documentation update:

- 2026-09-11 night (current, `Projects/worldmonitor` `62442db25`): app and DOM-test typechecks, 32 Cesium adapter DOM tests, biome, safe-HTML gate, default-layout review capture PASS (10/10 checks), conflict-polygon and layer-parity acceptance PASS. Still no full World Monitor suite run or accepted production build.
- God's Eye baseline: build passed; 2,707 tests, 2,704 pass, one failure, two skipped. Failure: voice Cockpit entry reaches the camera only through stamping seams / missing Cockpit entry transaction. Logs: `discovery/baseline-*.log`.
- World Monitor baseline: typecheck passed; full `test:data` attempt timed out with relay-startup failures. No full-suite green result.
- Combined focused checkpoint: 37 Node geometry/map-mode/URL tests and 16 DOM tests passed; application and DOM-test typechecks passed.
- Additional focused geometry/private-UI checks passed at individual checkpoints. Do not sum repeated runs into a unique test count.
- Full production build acceptance remains blocked/unproven. Reports include source-attribution generation warnings and a PWA precache limit for the Cesium chunk. Those are not waived by an isolated Vite spike build.
- Several children used the wrong test runner/include initially. Parent executed the appropriate supported focused checks; child self-reports are not release certificates.

## Feed catalog progress — partial

Machine extraction produced 1,383 client and 468 server registration rows. These include variant repetitions and are NOT unique feeds or network-verified providers. URL leaves: 1,446 client / 468 server.

Raw attribution manifest: 894 rows; 132 excluded, 668 terms-review, 94 reviewed. 762 nonexcluded hosts versus 761 catalog-active hosts is explained by `gtaupdate.com` having `catalogActive:false`. There are 748 nonexcluded provider labels. Rights, runtime joins and the entire combined catalog remain unreconciled.

No source data became trustworthy or licensed merely by extraction. Existing Google/AIS/TomTom local checks are historical; no secrets were re-read or provider credentials revalidated for this record update.

## Milestone disposition

| Milestone | Current state |
| --- | --- |
| M0 baselines/catalog/licence/hosting feasibility | Partial; no proven free private deployment, full catalog incomplete |
| M1 dashboard design acceptance | Review package re-captured 2026-09-11 night (dark mode, full 3D chrome); Raz's accept/reject pending. The earlier rejection of clutter/visual quality stands until then |
| M2 shell/map integration | Experimental; same-pane 2D/3D with matching chrome; conflict borders on terrain plus a global country-outline layer on Cesium; production build unproven |
| M3 evidence vertical slice | Partial technical point rendering; end-to-end user workflow not accepted |
| M4 complete catalogs/saved investigations | Incomplete |
| M5 private free-tier deployment | Not performed |
| M6 release/user acceptance | Not reached |

## Prioritized next actions

1. Raz reviews the re-captured default-layout frames (`Projects/worldmonitor/docs/discovery/default-layout-review.out/`) and records accept/reject for M1 before feed or AI work widens.
2. Preserve an immutable known-good preview separately from active edits; stop exposing incomplete imports through hot reload.
3. ~~Reproduce the remaining geographic mismatch against untouched upstream~~ Superseded 2026-09-11: Cesium is the engine and both renderers draw borders from the canonical GeoJSON. Keep data attribution and regional-area semantics explicit.
4. God's Eye interaction carry-over on Cesium: click-to-track with trails, then models, cockpit, sensor looks.
5. Complete machine-checked catalog mapping, saved-work requirements and real free-hosting proof.
6. ~~Move accepted work into a durable owner-controlled branch/repository~~ Done 2026-09-11 (`fork/experimental/gev-cesium-prototype-20260911`). Still needed before release: generated-file review, an accepted production build, rollback notes.

## Recordkeeping lessons

Use smaller cost/time budgets, scoped ownership, and executable acceptance checks for children. Run deterministic extraction directly rather than repeated manual inventories. Capture actual UI and inspect screenshots before saying 'working'. Do not silently broaden into new infrastructure, tools, vault reorganization or background ingestion.
