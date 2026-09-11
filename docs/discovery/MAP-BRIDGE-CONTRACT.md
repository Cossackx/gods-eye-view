# World Monitor → Cesium map bridge contract

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md). The detached World Monitor checkout contains experimental map integration, private UI, and renderer fixes, but the adapter is not merged into God's Eye main and has no full-build or real WebGL/map-correctness proof. A canvas mount alone is not map correctness.

**Status:** bounded first-spike contract, source-inspected only.

**Source of truth:** local World Monitor discovery checkout
`C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`, pinned
`d906869231970005ab3e108ff5321f179e8b7457`. The checkout's
`AGENTS.md` was read. No build, browser run, Cesium mount, switch test, or
provider request was executed while producing this document.

## Integration boundary

Add a World Monitor-side renderer behind `src/components/MapContainer.ts`; do
not mount God's Eye's `src/main.js` or `src/ui.js`. `MapContainer` constructs
one concrete renderer asynchronously and delegates to it. The existing shell
creates the façade at `src/app/panel-layout.ts:3444-3461`, wires time range at
`3444-3480`, and owns the surrounding panels and app state.

The first spike should add a disposable `CesiumMap`/`CesiumMapAdapter` with the
same renderer-facing behavior as the selected `GlobeMap` path. It may support a
small fixture layer set, but it must not claim that unsupported catalog data was
rendered.

## Required renderer methods for the first spike

These are the methods `MapContainer` calls on the active renderer during
construction, switching, readiness, normal viewport operation, and destruction.
Types below are the exact types visible in the pinned source.

```ts
constructor(
  container: HTMLElement,
  initialState: MapContainerState,
  options: {
    onInitError: (error: unknown) => void;
    chrome: boolean;
  },
): CesiumMap;

whenReady(): Promise<void>;
destroy(): void;
render(): void;
resize(): void;
setIsResizing(isResizing: boolean): void;

setView(view: MapView, zoom?: number): void;
setZoom(zoom: number): void;
setCenter(lat: number, lon: number, zoom?: number): void;
getCenter(): { lat: number; lon: number } | null;
whenViewportSettled(): Promise<boolean>;
getState(): MapContainerState;
setTimeRange(range: TimeRange): void;
getTimeRange(): TimeRange;
setLayers(layers: MapLayers): void;

onStateChanged(callback: (state: MapContainerState) => void): void;
onTimeRangeChanged(callback: (range: TimeRange) => void): void;
setOnLayerChange(
  callback: (
    layer: keyof MapLayers,
    enabled: boolean,
    source: 'user' | 'programmatic',
  ) => void,
): void;
setOnCountryClick(callback: (country: CountryClickPayload) => void): void;
setOnMapContextMenu(
  callback: (payload: {
    lat: number;
    lon: number;
    screenX: number;
    screenY: number;
    countryCode?: string;
    countryName?: string;
  }) => void,
): void;
setOnHotspotClick(callback: (hotspot: Hotspot) => void): void;
setOnAircraftPositionsUpdate(callback: (positions: PositionSample[]) => void): void;
```

**Path/line evidence:** `MapContainer` renderer fields and constructor are
`src/components/MapContainer.ts:166-215,266-299`; renderer creation and ready
handling are `604-623`; runtime switching is `693-738`; readiness and queued
viewport settlement are `821-877`; core delegation is `896-1020`; callback
re-wiring is `741-750,1392-1435,1611-1621`; destruction is `1724-1746`.
The `GlobeMap` option shape is visible at `604-615`; the callback names and
signatures are the façade's exact public signatures at `1394-1435,1611-1621`.

### Callback/state rules

1. **Ready is asynchronous.** `MapContainer` may call `set*` methods before the
   renderer exists. View commands are queued (`setView`, `setZoom`, `setCenter`)
   and replayed in action-token order when the renderer becomes ready. This is
   `MapContainer.ts:397-430,921-973`.
2. **Callbacks survive switches.** The façade caches callbacks and replays them
   when a new renderer is installed (`741-750`). The adapter must replace old
   listeners rather than accumulate duplicate subscriptions.
3. **Data survives switches in the façade.** Cached datasets are re-pushed by
   `rehydrateActiveMap()` (`752-810`). The adapter owns only its current Cesium
   entities/data sources and must clear them in `destroy()`.
4. **State is renderer-readable.** `getState()` must return the current
   `zoom`, `pan`, `view`, `layers`, and `timeRange` shape (`110-116,1013-1020`).
   For the spike, document the camera policy: World Monitor's geographic
   center/zoom is canonical; Cesium heading/pitch/height may be transient mode
   state and need not round-trip losslessly.
5. **Viewport settlement is meaningful.** `whenViewportSettled()` must resolve
   only after the camera command is visible, and return `false` if interrupted;
   `MapContainer` converts that to `ViewportTransitionError` (`854-877`).
6. **Resize is pane-driven.** `MapContainer` observes the pane and calls
   `resize()` (`439-446,903-913`). The adapter must size Cesium from the current
   container, not from a fixed dashboard viewport.
7. **Cleanup is mandatory.** `destroy()` must remove DOM and Cesium event
   handlers, cancel camera/data callbacks, destroy the viewer/data sources, and
   release WebGL resources. `MapContainer` invalidates async generations before
   destroying renderers (`1724-1746`).
8. **Unsupported layers are explicit.** Do not emit a rendered/ready state for a
   layer the adapter did not implement. Preserve the façade's `MapLayers` state
   and expose a bounded unsupported reason in the spike report.

## Callers that make the contract non-optional

| Caller | Current calls and implication |
|---|---|
| `src/app/panel-layout.ts:3453-3479` | Constructs `MapContainer`; calls `setSupplyChainPanel`, `isDeckGLActive`, `initEscalationGetters`, `getTimeRange`, and `onTimeRangeChanged`. A Cesium mode must not make the shell wait on a synchronous constructor. |
| `src/app/panel-layout.ts:3592-3639` | Applies URL `setView`, `setTimeRange`, `setLayers`, `setCenter`, `setZoom`, then reads `getState`. These calls can occur immediately after construction, before ready. |
| `src/app/event-handlers.ts:1436-1457` | `onStateChanged` drives URL sync and region selection from `getState`; camera changes must produce stable state callbacks without feedback loops. |
| `src/app/event-handlers.ts:2398-2410` | Registers layer-change and aircraft-position callbacks. Aircraft callback is not needed for the first fixture, but must be either wired or explicitly disabled at the caller/data-loader boundary. |
| `src/app/country-intel.ts:261-295` | Country click and context-menu callbacks open country briefs or copy coordinates. Picking must provide geographic coordinates; country identity may be optional for the first spike. |
| `src/app/data-loader.ts:686-688` | CII scores plus `setLayerReady`. The first spike may mark this unsupported, but must not display a false choropleth. |
| `src/app/data-loader.ts:1380-1394` | Reads `isGlobeMode`, `getBbox`, and may call `setImageryScenes`. Satellite imagery is out of scope for the first spike; avoid enabling this path until `getBbox` has a tested policy. |
| `src/app/data-loader.ts:1438-1460` | Calls `flashLocation(lat, lon)` for news. Implement this as a small camera/entity flash or gate the feature explicitly. |
| `src/embed/embed-data-loader.ts:22-37,145-255` | The embed surface directly requires `supportsLiveConflictEvents`, `setConflictEvents`, `setEarthquakes`, `setNaturalEvents`, `setProtests`, `setWeatherAlerts`, `setLayerLoading`, `setLayerReady`, `getState`, and `setLayers`. The first Cesium spike should not silently break the embed path; either support these fixture setters or keep the spike behind the main dashboard only. |

`setOnAircraftPositionsUpdate` is registered by the shell, but the current
`MapContainer` does not delegate it to the globe renderer (`1412-1417`). It is
therefore not a Cesium/globe-path requirement for the first spike; if Cesium is
also selected for the flat path, implement it before enabling aircraft updates.

## Minimal first-spike data surface

To prove the pane seam without porting the complete catalog, implement these
facade methods and one deterministic fixture per method:

```ts
setEarthquakes(earthquakes: Earthquake[]): void;
setNaturalEvents(events: NaturalEvent[]): void;
setProtests(events: SocialUnrestEvent[]): void;
setWeatherAlerts(alerts: WeatherAlert[]): void;
setLayerLoading(layer: keyof MapLayers, loading: boolean): void;
setLayerReady(layer: keyof MapLayers, hasData: boolean): void;
flashLocation(lat: number, lon: number, durationMs?: number): void;
```

The façade caches and dispatches these at `MapContainer.ts:1022-1053,
1115-1133,1465-1494,1602-1609`; it replays cached values during a switch at
`752-810`. The Cesium adapter can initially map the four fixture setters to
simple billboards/points, but must use stable IDs and replace/remove stale
entities on update. Do not implement every `set*` method merely to satisfy
structural typing; the current façade has many catalog-specific methods and
renderer capability gaps.

## Bounded implementation tasks

1. **Adapter seam:** add only the renderer adapter and its tests; do not modify
   God's Eye startup/UI or copy `StyleManager`.
2. **Mode wiring:** add an explicit Cesium mode or a disposable replacement
   branch while retaining the existing globe/SVG fallback. Preserve the
   `switchToGlobe`/`switchToFlat` snapshot, async readiness, and fallback result
   behavior at `MapContainer.ts:693-738,812-843`.
3. **Camera policy:** define and test center/zoom ↔ Cesium camera conversion,
   including antimeridian, latitude bounds, initial global view, and a bounded
   altitude policy. Mark heading/pitch as non-round-tripping.
4. **Picking:** implement one point/country fixture and verify click plus
   context-menu payloads, including screen coordinates relative to the map pane.
5. **Layer accounting:** record each first-spike layer as `rendered`,
   `unsupported`, or `unavailable`; make `setLayerReady` agree with that status.
6. **Lifecycle:** add listener/entity/WebGL cleanup and generation guards for
   rapid enter/exit and repeated 2D↔3D switches.
7. **No provider proof:** use local fixtures only. Provider proxy/deployment
   conclusions remain the separate handler-extraction work in the architecture
   report.

## Required tests before upgrading the verdict

- Construct adapter in a real map-pane-sized DOM, await `whenRendererReady`, and
  assert a Cesium canvas is mounted.
- Call `setCenter`/`setView`/`setZoom` before readiness; assert the last queued
  action wins and `getState` reports the expected geographic location.
- Exercise `resize()` after pane dimension changes and assert the viewer/canvas
  dimensions follow the pane.
- Register every callback above, switch away/back repeatedly, and assert one
  callback per event (no duplicate listeners).
- Set fixture data twice with removals; assert stale Cesium entities disappear.
- Click a fixture and invoke context menu; assert exact payload shape and
  country-code optionality.
- Run at least 20 rapid mode switches, then assert no rejected readiness waiter,
  stale generation activation, orphaned DOM node, listener, timer, or Cesium
  resource remains.
- Run the relevant World Monitor typecheck/focused tests and a browser smoke
  test. Record those as execution evidence; this document currently contains
  none.

## Contract conclusion

The seam is credible from source inspection and precise enough for a bounded
spike. It is not yet proof that Cesium can coexist with World Monitor's actual
bundler, pane sizing, WebGL lifecycle, or feed cadence. Upgrade the architecture
report from “source-inspected plausibility” only after the tests above produce
runtime evidence on the pinned integration checkout.
