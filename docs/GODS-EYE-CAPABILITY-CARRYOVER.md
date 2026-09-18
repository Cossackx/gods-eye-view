# God's Eye capability carry-over under the approved constraints

> [!important] Historical/reference copy — routing updated 2026-09-12
> Our combined product is **RAZ Fusion Center**. Current plans, decisions and status live in [the canonical project index](../../raz-fusion-center/docs/project/README.md) and [current status](../../raz-fusion-center/docs/project/PROJECT-STATUS.md), under `C:/Users/aleks/Projects/raz-fusion-center`. Published product repository: https://github.com/Cossackx/raz-fusion-center (private).
> The dated statements below describe the earlier project/fork; they do not override current publication, renderer, optional free-only AI or runtime decisions. This God's Eye View checkout remains an upstream reference/rollback copy, not the active product home. Current app address: http://127.0.0.1:4195/dashboard; an app restart does not establish AIS/aircraft relay readiness.


**Written:** 2026-09-11. **Owner:** Raz. **Status:** decision aid, not a build order.
**Decision recorded today:** Cesium is the single 3D engine for the merged dashboard. World Monitor's globe.gl path is to be retired from the product once the Cesium path reaches parity for the layers the product needs.

Constraints applied (from [APPROVED-INTEGRATION-DIRECTION.md](APPROVED-INTEGRATION-DIRECTION.md)): zero additional monthly cost, no billing-enabled provider, no compulsory always-on backend, no AI initially, private single user, keep every feed discoverable with an honest availability state.

Source evidence: `DATA_SOURCES.md`, `vite.config.js` route list, `src/mapStartup.js`, `src/mapStackController.js`, `public/models/README.md`, and the World Monitor layer union in the temporary checkout's `src/types/index.ts`.

## 1. What God's Eye actually contributes

God's Eye's value is not its feed list. World Monitor already carries flights, military flights, satellites, earthquakes, fires, webcams, cables, datacenters, launches and AIS as layers. The overlap is near total. God's Eye's distinct value is the **3D spatial experience**: a real terrain globe, camera behaviour that locks onto moving targets, the cockpit ride-along, per-class 3D aircraft models, and sensor-style visual treatments. Those are code and interaction patterns under MIT, and they do not cost money to run.

## 2. Survives as-is (keyless, free, MIT code)

| Capability | God's Eye source | Cost / rights | Carry-over note |
| --- | --- | --- | --- |
| Keyless satellite basemap | `mapStackController` `esri-imagery` stack | Free public Esri endpoint, attribution required | Replaces the OSM tiles in the current Cesium spike. Largest single visual upgrade available for zero cost. |
| Keyless 3D terrain | Re:Earth / Mapterhorn quantized-mesh provider, EGM96 fallback | CC BY 4.0, keyless | Gives real relief in 3D without Google. Pair with Esri imagery. |
| OSM basemap fallback | `osm` stack | ODbL | Already in spike. Keep as fallback only. |
| Click-to-track camera lock, fading trail, metadata card | `cockpitTracking.js`, `camera.js`, `cameraVerbs.js` | MIT code | Port the camera maths and trail entity logic behind the adapter. This is the signature interaction. **Ships done 2026-09-11** (`private-ship-traffic.ts`, adapter ship card: Track / Follow / Stop, session trail, VesselAPI check). Aircraft half and the fading-trail shader not yet ported. |
| Cockpit ride-along and 250 km contacts roster | `cockpitTracking.js`, `contactsDetectionPolicy.js`, `cockpitMath.js` | MIT code | Needs flight positions, which World Monitor already supplies. Mount as a map-pane mode, not a full-screen takeover. |
| Per-class 3D aircraft and ship models | `public/models/*.glb` | CC BY 4.0 each, attribution in-app | Copy the folder with its README. Register credits in the attribution popover. |
| Sensor looks: CRT, NVG, FLIR, Noir, Snow | GLSL post-process stages | MIT code | Cesium post-process stages port directly. Optional toggle, off by default. |
| Detection overlay boxes and military HUD telemetry | `hud.js`, `cockpitVisionPolicy.js` | MIT code | Optional toggle. HUD summary text from OpenAI is excluded; the telemetry HUD does not need it. |
| Share links with camera, style, layers and tracked target | `sharelink.js` | MIT code | Merge into World Monitor's existing URL state rather than adding a second serializer. |
| Scene director camera tours | `scenes/` | MIT code | Low priority. Port only after tracking works. |
| Annotations resolver: real Natural Earth and SF boundary polygons | `annotations/`, bundled Natural Earth and DataSF packs | Public domain, PDDL | The voice front end is excluded, but the resolver can be driven from a text box or the evidence panel. |
| Render governor, visibility suspension | `renderGovernor.js` | MIT code | Carry over. Cesium in a dashboard pane needs it to keep the other panels responsive. |
| Bundled datacenters, dams | ODbL extracts | ODbL, attribution | World Monitor already has datacenters. Dams is a small net addition. |
| Bundled TeleGeography cables | CC BY-NC-SA | Non-commercial only | Acceptable for a private personal deployment. World Monitor already has a cables layer; use one, not both. |

## 3. Survives with a free key you already hold or can get (still zero monthly cost)

| Capability | Key | Free-tier limit | Note |
| --- | --- | --- | --- |
| Photorealistic 3D tiles via Cesium ion | Cesium ion token | Free for personal, non-commercial use | This is the honest route to photorealistic 3D at zero cost. The direct Google Map Tiles route is billing-enabled and is excluded. Confirm the ion community terms before relying on it. |
| NASA FIRMS fires | `FIRMS_MAP_KEY` | Free, quota by MAP_KEY | World Monitor already has a fires layer. Reuse whichever pipeline is cleaner. |
| TomTom live traffic colouring | `TOMTOM_API_KEY` | 200K tiles/month; God's Eye ships a daily tile budget governor | Key already on file locally. Governor must move into World Monitor's API layer. |
| OpenSky authenticated flights | OpenSky client credentials | Non-commercial licence; higher rate limit with account | World Monitor already has flights. Keep God's Eye's adsb.lol fallback logic. |
| Launch Library 2 | `LL2_API_TOKEN` optional | 15 calls/hour anonymous | World Monitor already has launches. |
| TfL JamCams | `TFL_APP_KEY` optional | Keyless works, key raises limit | World Monitor already has webcams. |

## 4. Survives only with an always-on process

| Capability | Why | Options |
| --- | --- | --- |
| Live AIS vessels | AISStream is a persistent websocket. Free serverless hosts cannot hold it. Today's Hermes work confirms the merged prototype returns an empty snapshot without a relay. | (a) Run the relay locally only while using the dashboard, which is what the new `local-ais-preview` launcher does. (b) Use World Monitor's public relay, which is hosted API access and outside the AGPL code grant. (c) Accept AIS as "unavailable in cloud, available locally" and label it so. |
| Cockpit local weather effects and regional brief | Server-side caching and Nominatim rate serialisation | Port as World Monitor API handlers if the cockpit is kept. Google News RSS is personal-use only, which fits. |

## 5. Excluded by the approved constraints

| Capability | Reason |
| --- | --- |
| Google Map Tiles direct route, Places, Geocoding, Street View | Billing-enabled. The ion route above is the substitute for tiles. |
| OpenAI realtime voice agent and HUD summaries | No AI initially, and paid. |
| Circular scope mask as the default view | Explicitly rejected in the approved direction. Could remain as an optional treatment. |
| God's Eye's `StyleManager` UI shell and panel system | Not a seam. World Monitor owns the shell. |
| God's Eye's Vite-middleware API routes as-is | Dev-server only. Anything needed must be rewritten as a World Monitor server handler. |

## 6. Recommended porting order

1. ~~Basemap and terrain: Esri imagery plus Re:Earth terrain into the Cesium adapter.~~ **Done 2026-09-11** in `Projects/worldmonitor` (`CesiumMapAdapter.ts`): Esri World Imagery default with on-screen "Powered by Esri" credit and truthful OSM fallback; Re:Earth terrain loaded lazily with flat-ellipsoid fallback. Browser acceptance: `docs/discovery/cesium-basemap-terrain-acceptance.mjs` in that repo (PASS; Tehran 1,201 m, Damavand area 5,293 m, Caspian -33 m). Evaluating the ion photorealistic route remains open.
2. ~~Country and conflict polygons on Cesium, using the shared conflict-zone resolver already written.~~ **Done 2026-09-11** (`Projects/worldmonitor`, commit after eed370124): canonical country polygons with holes as terrain-classified ground primitives, regional zones labelled as approximate, conflict popup on click, country click / fitCountry / highlight. Browser acceptance `docs/discovery/cesium-conflict-polygons-acceptance.mjs` PASS; layer toggle changes 13% of a wide frame (local footprint, not the globe-wide complement the globe.gl bug produced). The globe.gl border problem is now bypassed on the product path.
3. ~~Point layers to parity.~~ **Done 2026-09-11** (`Projects/worldmonitor`, `CesiumMarkerLayers.ts` + adapter): every layer GlobeMap renders now renders on Cesium (32 layer toggles, 33 feed setters, bundled static layers, cables/pipelines/orbits/storm tracks, CII/scenario/footprint polygons), same palette and marker budget as GlobeMap, popups/tooltips on click. Browser acceptance `docs/discovery/cesium-layer-parity-acceptance.mjs` PASS. The bridge no-op list is down to methods GlobeMap itself never implemented. globe.gl can now be retired from the product path.
4. Click-to-track with trails and the metadata card. First God's Eye signature behaviour.
5. 3D models and the render governor.
6. Cockpit and contacts roster.
7. Sensor looks, HUD, share-link merge, annotations resolver.

Everything below step 3 waits for accepted default UX per the development plan.
