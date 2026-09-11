# M0 Architecture Feasibility — World Monitor-first / God's Eye integration

> **Current-status context (2026-09-11):** This report is historical discovery evidence. For the current checkpoint and evidence boundary, see [../PROJECT-STATUS.md](../PROJECT-STATUS.md). God's Eye main remains unchanged at `7596522`; World Monitor is a detached experimental checkout at `d9068692` with uncommitted adapter/UI/renderer work. The integration remains source-inspected/plausible, not a verified merged implementation or production build.

**Status:** Discovery only. No implementation changes were made in the main repository.

**Decision under investigation:** Use World Monitor as the dashboard shell, put God's Eye/Cesium in the existing map pane, retain World Monitor's surrounding panels, and preserve a same-pane 2D/3D switch with shared selection/filter context.

## Executive finding

The integration is a **source-inspected feasibility hypothesis** for a World Monitor map-container adapter, not a proven implementation and not a merge of the two application shells.

World Monitor already has the required seam: `MapContainer` owns the active renderer, exposes a renderer-neutral public API, caches map data across switches, destroys the previous renderer, restores viewport/layers/time range, and rehydrates active map data. Its flat desktop path is `DeckGLMap` + MapLibre; its mobile/fallback path is `MapComponent` (D3/SVG); its existing optional 3D path is `GlobeMap` (globe.gl).[^wm-architecture][^wm-mapcontainer][^wm-getting-started]

The recommended bridge is therefore:

1. Keep World Monitor's `App`, panel layout, data loading, selection, URL/storage state, and `MapContainer` contract as the shell.
2. Add a God's Eye/Cesium renderer behind a narrow adapter implementing the relevant `MapContainer` lifecycle/data methods.
3. Extend the existing map-mode switch rather than mounting a second full dashboard or a second browser tab.
4. Treat Cesium as the 3D renderer only; do not port God's Eye's 10,000-line `StyleManager`/UI shell into World Monitor.
5. Extract any required provider proxy/auth handlers from God's Eye's Vite development middleware into deployable handlers before claiming a production build.

This is an architecture recommendation, not approval to import code or activate providers.

## Revision and source boundary

### World Monitor source inspected

- Repository: `koala73/worldmonitor`
- World Monitor source inspected from the local discovery checkout: `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`, pinned at **`d906869231970005ab3e108ff5321f179e8b7457`**. This supersedes the older `f67d308f` web snapshot used by the first report.
- Checkout guidance read: `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery/AGENTS.md`.
- License evidence: local `package.json` reports `AGPL-3.0-only`.
- Exact seam inspected: `src/components/MapContainer.ts` (local lines 1–1811), with construction/callers in `src/app/panel-layout.ts:3444-3480`, `src/app/event-handlers.ts:1436-1457,2398-2410`, `src/app/country-intel.ts:261-295`, `src/app/data-loader.ts:686-688,1380-1394,1438-1460`, and embed callers in `src/embed/panels/map.ts:22-47` / `src/embed/embed-data-loader.ts:22-37`.
- The old GitHub URLs below are retained only as historical provenance for the previous report; they are **not** evidence for this revision. The local pinned checkout is the source of truth for the contract in `MAP-BRIDGE-CONTRACT.md`.

### Local God's Eye source inspected

- `package.json`: private MIT Vite/Cesium app; Node `>=24.14.0 <25 || >=26 <27`; Cesium `^1.124.0`, Vite `^6.0.0`, `vite-plugin-cesium`; supported commands include `npm run build`, `npm test`, `npm run test:track`, and `npm run qa:map-source-tray`.
- `index.html`: Cesium mount is `#cesiumContainer`; the rest of the HUD/panels are sibling DOM surfaces.
- `src/main.js`: constructs `Cesium.Viewer`, loads Photorealistic 3D Tiles, creates `MapStackController`, `StyleManager`, `DataLayerManager`, `SceneDirector`, annotations, render governor, scope mask, and visibility suspension; the viewer and managers are application-owned globals within the startup closure.
- `src/mapStackController.js`: `MapStackController` exposes `getStacks()`, `getStack(id)`, `getActiveId()`, `getActiveStack()`, `getSwitchGeneration()`, `isStackAvailable(id)`, `setStack(id, {silent})`, and `getState()`; switching is async and generation-guarded.
- `src/mapStartup.js`: `loadPhotorealisticTileset(Cesium, {googleApiKey, cesiumToken})` tries direct Google then Cesium ion and degrades to a keyless route.
- `src/ui.js`: `StyleManager` owns a large amount of panel, camera, layer, style, share-link, storage, and event behavior. It is not a suitable World Monitor integration boundary.
- `vite.config.js`: provider access is implemented as Vite `configureServer`/`configurePreviewServer` middleware under many `/api/*` routes, including OpenSky, CelesTrak, Overpass, GBFS, CCTV, adsb.lol, AIS, terrain heights, launches, FIRMS, TomTom, regional/weather, key setup, and realtime routes. There is no separate production `api/` handler tree in the inspected local project.

Sensitive files, including `.env` and credential material, were not read.

## Evidence boundary

This revision is **source-inspected plausibility**, not executed proof. The pinned local checkout was read, including `MapContainer` and its callers, but no World Monitor build, browser mount, Cesium viewer, renderer switch, provider request, or leak test was run for this report. The adapter contract and task bounds below are therefore implementation hypotheses grounded in current TypeScript call sites. A first spike must establish runtime behavior before the feasibility verdict is upgraded to demonstrated integration.

The local source materially narrows the seam compared with the older report: `MapContainer` is not a small renderer interface. It is a stateful façade with a large cached data surface, async renderer readiness, queued viewport actions, callback replay, renderer-specific capability gaps, and fallback from globe/deck to SVG. A Cesium spike should implement only the minimum contract listed in `MAP-BRIDGE-CONTRACT.md`, while leaving unimplemented catalog methods explicit rather than silently treating them as rendered.

### World Monitor startup and shell

`src/main.ts` performs browser/bootstrap initialization and creates the `App` instance after runtime patches, theme/meta initialization, and API routing setup. `App` is the application orchestrator. The architecture document describes a central mutable `AppContext` containing map references, panel instances, layer/panel settings, cached data, in-flight requests, and UI references; it explicitly states that there is no external state library.[^wm-main][^wm-architecture]

The shell boundary to preserve is therefore:

```text
World Monitor src/main.ts
  -> App
     -> AppContext / DataLoaderManager / EventHandlerManager
     -> PanelLayoutManager
     -> MapContainer
        -> current map renderer
```

`Panel` is a stable panel lifecycle base with `destroy()`, abort handling, debounced content updates, viewport observation, and persisted sizing/collapse state. God's Eye panels should not be transplanted into this layer; the Cesium bridge should publish map events/data through the existing map and app contracts.[^wm-panel]

### Exact 2D map seam

`MapContainer` is the strongest integration point. Evidence from the inspected source shows:

- renderer fields for `DeckGLMap`, SVG `MapComponent`, and `GlobeMap`;
- renderer selection during construction based on device/WebGL capability and `preferGlobe`;
- `switchToGlobe()` snapshots state and center, disconnects its resize observer, destroys the flat map, constructs `GlobeMap`, restores viewport/layers/time range, and rehydrates active data;
- `switchToFlat()` performs the inverse;
- a unified public API delegates `render()`, `resize()`, and data setters to the active renderer;
- cached callback references and cached data are retained across renderer switches so the parent app does not need to rebuild its event wiring.[^wm-mapcontainer]

The 2D adapter target is **not** a raw MapLibre canvas. It is the `MapContainer` renderer contract. The bridge should either:

- add a `CesiumMap` renderer as another renderer selected by a map mode (`cesium`/`3d`), or
- replace the existing `GlobeMap` implementation behind `switchToGlobe()` while preserving the public `MapContainer` method names and state restoration behavior.

The first option is safer for M0/M1 because it makes the existing globe.gl behavior available as a fallback and keeps the change explicit. The second option is smaller only if the product explicitly retires globe.gl.

### State and lifecycle mapping

World Monitor state to preserve through the bridge:

| Concern | Existing World Monitor seam | Cesium bridge obligation |
|---|---|---|
| Map mode | `MapContainer.switchToGlobe()` / `switchToFlat()` and `App`'s stored map-mode preference | Add a mode that is serializable and restores deterministically; do not make Cesium state the source of truth for panels. |
| Layers | `MapContainer.setLayers()` plus renderer-specific setters and cached layer data | Translate only supported layers; retain unsupported-layer state and expose an honest incompatibility reason. |
| Viewport | `getState()`, `getCenter()`, `setView()`, `setCenter()` / renderer delegation | Convert MapLibre center/zoom to Cesium camera and back using an explicit, tested geographic/altitude policy. |
| Selection | Map callbacks (`onCountryClicked`, hotspot/asset/picking callbacks) | Emit a stable World Monitor selection payload from Cesium picking; never bypass `App`/event handlers with panel-local state. |
| Time range | `setTimeRange()` and cached range | Map Cesium-supported time-dependent layers from this state; do not invent history when God's Eye only has current snapshots. |
| Resize | `MapContainer.resize()` and `ResizeObserver` | Call `viewer.resize()` after pane layout changes; suspend/destroy observers when the renderer is removed. |
| Data updates | Many `set*` methods, cached in `MapContainer` | Implement a bounded subset first, then account for every catalog layer as active, unsupported, or unavailable. |
| Cleanup | renderer `destroy()` and map-container teardown | Destroy Cesium viewer/entities/data subscriptions, remove DOM/event listeners, stop render loops, and release WebGL resources on every switch. |

God's Eye already has useful lifecycle patterns: `MapStackController` uses async switch generations to prevent stale provider activation; `main.js` uses explicit visibility suspension; `renderGovernor.js` supports idle/requested rendering; and several modules return/remain responsible for listener removal. These patterns should be adapted into the bridge, not copied wholesale with the entire God's Eye shell.[^gev-main][^gev-stack]

### Cesium bridge strategy

**Recommended ownership:** a new World Monitor-side `CesiumMapAdapter` owns one Cesium `Viewer` mounted in the map-container element. God's Eye code may be vendored or imported behind this adapter only after provenance/licence review.

**Adapter responsibilities:**

1. Create/destroy the viewer when the map mode is entered/exited.
2. Own the Cesium camera conversion and resize handling.
3. Translate World Monitor map layer data into Cesium data sources/entities/primitives, with one cleanup registry per layer.
4. Translate Cesium picking to World Monitor's existing click/selection callback shape.
5. Apply map theme/attribution and preserve provider credits.
6. Expose only the methods MapContainer/App actually call; keep `StyleManager`, `SceneDirector`, God's Eye voice/realtime features, and God's Eye dashboard DOM out of the first bridge.
7. Use a single render scheduler. If request-render mode is used, every camera/data/provider transition must request a frame; if a continuous loop is required for tracking, it must be explicitly held and released.

**Camera policy:** keep World Monitor's 2D center/zoom as the canonical investigation location. Store a separate 3D camera orientation/height only as optional mode state. On 2D→3D, derive a Cesium camera from center/zoom; on 3D→2D, derive center and a bounded zoom from the Cesium camera. Do not promise lossless pitch/heading round-tripping.

**Layer policy:** begin with one World Monitor layer and one God's Eye-compatible spatial feed as fixtures, then add real layers. The M0 requirement is catalog accounting, not immediate activation of all sources. A layer that cannot map into both renderers must remain visible in the catalog with capability/status metadata.

## Deployment and handler feasibility

### World Monitor deployment model

World Monitor documents a Vercel Edge deployment with API functions in `api/` and domain gateways under `server/`; `vercel.json` is part of the deployment topology. Its API path applies origin allowlists, API-key validation, rate limiting, cache headers, and gateway routing. `api/bootstrap.js` and `api/health.js` are concrete edge-handler examples; `server/gateway.ts` is the reusable per-domain gateway factory.[^wm-architecture][^wm-getting-started][^wm-vercel][^wm-bootstrap][^wm-gateway][^wm-cors]

This matters because the local God's Eye `vite.config.js` handlers are development/preview server middleware. A static `vite build` does not carry those handlers. Any integrated deployment must choose one of these bounded paths:

- **World Monitor shell deployment:** port each required God's Eye provider proxy into World Monitor-compatible `api/` or `server/` handlers, preserving origin allowlists, authentication, request budgets, cache/stale behavior, and provider attribution.
- **Browser-direct only:** use only providers that are explicitly CORS-compatible, keyless/approved, and safe to call from the browser; this will not cover the current God's Eye catalog.
- **Separate sidecar:** use only if a later decision accepts a non-static private runtime; this conflicts with the zero-cost/no-compulsory-always-on-backend priority unless measured and explicitly approved.

**Required handler work before deployment:**

1. Inventory every God's Eye `/api/*` middleware route and classify it as browser-direct, World Monitor edge handler, sidecar-only, disabled, or paid/restricted.
2. Extract shared validation: allowed upstream host/path, method/query/body limits, timeout, response-size cap, cache key/TTL, stale behavior, provider attribution, and secret handling.
3. Add authenticated/private access control for any non-public provider call and storage endpoint; do not expose God's Eye development key setup routes in production.
4. Add CORS/origin policy equivalent to World Monitor's `_cors.js`; add rate limiting/budgets equivalent to `_rate-limit.js` where the provider or deployment can incur quota/cost.
5. Verify Vercel Edge compatibility: no Node-only filesystem/process/socket behavior in edge handlers. God's Eye currently has filesystem/disk-cache, Node crypto, DNS, child-process, stream, and WebSocket-related code in `vite.config.js`; these cannot be assumed portable to an Edge Function.
6. Resolve long-lived AIS: World Monitor documents WebSocket/REST and a relay/sidecar topology; free serverless Edge functions are not a safe assumption for long-lived AIS connections. Prefer a bounded snapshot/relay contract or mark live AIS unavailable under the zero-cost policy.[^wm-getting-started][^wm-architecture]
7. Prove private authentication, no-secret-client-bundle, no-billing-enabled provider behavior, cold starts, quota exhaustion, and stale/empty/error distinctions on the actual host before M5.

### Local God's Eye deployment conclusion

The current local project is a Vite browser app whose provider handlers are attached to Vite dev/preview middleware. `package.json` has no production API server or deployment handler script. It can supply the Cesium renderer and client-side concepts, but it is **not** by itself a deployable World Monitor backend. The integration must not treat `vite preview` middleware as production API infrastructure.

## Licensing and provenance

- World Monitor `package.json` at the inspected ref declares `AGPL-3.0-only`.[^wm-package]
- God's Eye `package.json` declares `MIT` and names Bilawal Sidhu as author.
- The combined application must preserve the AGPL obligations applicable to reused World Monitor code and retain God's Eye MIT attribution plus third-party notices. Provider API terms, map/imagery/terrain terms, asset licences, and data redistribution rights remain separate checks.
- Before import, record the full World Monitor commit SHA, God's Eye commit/revision, dependency lockfiles, copied-file provenance, local patches, licence texts, corresponding-source/build instructions, and any applicable network/source offer.

## Feasibility verdict and bounded next tasks

### Verdict

**Map/UI integration: source-inspected feasibility hypothesis for a narrow `MapContainer` renderer adapter; runtime integration is not proven.**

**Direct whole-shell merge: rejected.** The two projects both own startup, DOM, state, rendering, provider lifecycle, and UI orchestration. Combining `src/main.js`/`src/ui.js` with World Monitor `main.ts`/`App.ts` would create conflicting application roots and duplicate state ownership.

**Deployment: conditional design path only, requiring handler extraction and execution proof.** The local God's Eye Vite middleware cannot be carried into a static or Edge deployment unchanged. AIS and any Node/filesystem-dependent proxy require a separate bounded design or explicit unavailable status.

**Zero-cost requirement: not yet proven.** Public/keyless 2D/3D basemap options and slower snapshots may be possible, but provider terms, quotas, authentication, persistence, and private access still require an actual host proof.

### M0/M1-sized follow-up tasks

1. **Pin and baseline:** World Monitor source is now pinned to local `d906869231970005ab3e108ff5321f179e8b7457`; record God's Eye SHA and lockfile; run each manifest's supported baseline checks in separate worktrees. This report did not run those checks.
2. **Map contract extraction:** completed as `docs/discovery/MAP-BRIDGE-CONTRACT.md`, including the active renderer methods, callback signatures, caller paths, state/replay rules, and bounded test tasks.
3. **Cesium spike:** implement only a disposable adapter spike (not production integration) that mounts/destroys a Cesium viewer in the MapContainer pane, round-trips center/zoom, handles resize, and emits one selection callback; measure repeated 2D↔3D switches for leaked listeners/WebGL resources. Required runtime checks are listed in the bridge contract; none were executed for this report.
4. **Layer compatibility matrix:** map each World Monitor layer definition and each God's Eye data layer to flat/3D support, identity/geometry contract, attribution, refresh mode, and unavailable reason. Programmatically reconcile counts; do not sample.
5. **Shared state contract:** define serializable `mapMode`, `center`, `zoom`, `selectedEventId`, filters, time range, and optional 3D camera state; add migration/versioning before persistence changes.
6. **Handler inventory:** enumerate all local `/api/*` middleware routes from `vite.config.js`; select the minimum approved set; write per-route Edge/sidecar/direct-browser decisions and request budgets without reading secrets.
7. **Deployment proof:** build a private no-billing candidate with one authenticated handler and one fixture/snapshot source; verify unauthorized denial, no client secrets, stale/empty/error distinctions, cold start, and quota exhaustion.
8. **Compliance checklist:** confirm full license texts, attribution UI, source provenance, API/map/data terms, and the exact AGPL corresponding-source obligations for the selected release topology.

## Sources

[^wm-package]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/package.json
[^wm-architecture]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/ARCHITECTURE.md
[^wm-main]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/main.ts
[^wm-app]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/App.ts
[^wm-mapcontainer]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/components/MapContainer.ts
[^wm-deck]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/components/DeckGLMap.ts
[^wm-globe]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/components/GlobeMap.ts
[^wm-panel]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/src/components/Panel.ts
[^wm-getting-started]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/docs/getting-started.mdx
[^wm-vercel]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/vercel.json
[^wm-bootstrap]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/api/bootstrap.js
[^wm-gateway]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/server/gateway.ts
[^wm-cors]: https://raw.githubusercontent.com/koala73/worldmonitor/f67d308f/api/_cors.js
[^gev-main]: https://github.com/bilawalsidhu/gods-eye-view/blob/main/src/main.js
[^gev-stack]: https://github.com/bilawalsidhu/gods-eye-view/blob/main/src/mapStackController.js
