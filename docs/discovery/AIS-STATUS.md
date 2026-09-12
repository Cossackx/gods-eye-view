# AIS diagnostic status

**Checked:** 2026-09-11 (local Windows prototype)

> **Disposition 2026-09-11 (evening):** Resolved on the durable checkout `C:/Users/aleks/Projects/worldmonitor`. Run `LOCAL_AIS_PREVIEW_PORT=4200 LOCAL_AIS_RELAY_PORT=4201 node scripts/local-ais-preview.mjs --env C:/Users/aleks/Projects/gods-eye-view/.env` and open http://127.0.0.1:4200/?cesiumSpike=1. Verified: relay connected (4,000-7,000 live vessels), vessel snapshot `dataAvailable:true`, AIS disruptions and density on the map, 272 military aircraft from keyless adsb.lol on the 3D globe. Still true: World Monitor plots AIS *disruptions/density/military candidates*, not every civilian ship (God's Eye did); OpenSky is now authenticated: a fresh API client credential was created on the OpenSky account page on 2026-09-11 (~20:05Z) and written into the God's Eye env and the IMSOC workbench credentials file (the previous secret is invalid after the reset); the dev proxy routes /api/opensky through the relay, which acquires an OAuth2 token (4,000 credits/day). Run the launcher with `--with-opensky`; military *vessels* need USNI/Redis or relay candidate reports and stay empty locally.

> **All-ships layer 2026-09-11 (night):** the private build now lists every live relay contact in the camera's view (relay `/ais/vessels`, flag-gated) and renders them on Cesium under Ship Traffic with click-to-track. Coverage is the volunteer AISStream network's: the Dover Strait shows ~90-120 contacts, the Gulf box (24-28N, 52-58E) returns 0. VesselAPI (key in the God's Eye `.env`, ~150 requests/month) is wired as the on-demand check for such gaps; each press spends one request on the current view (must be 4 degrees or narrower).

## Result

> **Subsequent restore verified:** authenticated local relay now serves the separately launched dashboard at http://127.0.0.1:4189/. Its vessel endpoint returned dataAvailable:true,125 candidate reports and124 density zones; relay counters increased with real incoming AIS messages. The original4187 process remains unconfigured. See [LOCAL-AIS-PREVIEW.md](LOCAL-AIS-PREVIEW.md) for ports, startup, cache limits and exact evidence. The diagnosis below records the earlier unavailable state, not the final restore result. Experimental Cesium vessel drawing remains unsupported.

> **Parent verification / current disposition:** AIS remains unavailable on port 4187. The child changed the desktop sidecar, but the running browser preview executes the Vite maritime handler directly. That irrelevant sidecar change and its test assertion were reverted. Sections describing the sidecar fix below are historical attempted work, not the current implementation or a live-data success. Public relay health does not authorize using its protected snapshot service. No key validity claim is established. The original God's Eye server on port 4173 was stopped at diagnosis time. Current project record: [PROJECT-STATUS](../PROJECT-STATUS.md).

The observed local response was reproduced:

```text
GET http://127.0.0.1:4187/api/maritime/v1/get-vessel-snapshot
200 {"fetchedAt":0,"dataAvailable":false}
```

This is an intentional empty response from the maritime handler when its relay
fetch returns no snapshot; it is not a Vite route or map-rendering failure.

The supported public relay is healthy at the time of checking:

```text
GET https://proxy.worldmonitor.app/health
200
status=ok
AIS enabled=true, connected=true, currentPositionReady=true, hasData=true
vessels=20006, messages=4525033, densityZones=416
```

The relay's `/ais/snapshot` route is authenticated (a direct unauthenticated
probe must not be used as a feed test). Its health endpoint is the safe public
status check.

## Inspected data path

- `src/services/maritime/index.ts`
  - Creates `MaritimeServiceClient` with the configured RPC base URL.
  - Polls `GET /api/maritime/v1/get-vessel-snapshot` every five minutes.
  - AIS is enabled in a browser unless `VITE_ENABLE_AIS=false`, and also
    requires runtime feature `aisRelay`.
  - The client sends an all-zero bbox (interpreted by the server as no bbox),
    with candidates/tankers opt-in.
- `api/maritime/v1/[rpc].ts` and `server/worldmonitor/maritime/v1/handler.ts`
  - Correctly register the generated maritime RPC route and
    `getVesselSnapshot` handler.
- `server/worldmonitor/maritime/v1/get-vessel-snapshot.ts`
  - Requires `WS_RELAY_URL` to be present via `getRelayBaseUrl()`.
  - Fetches `${WS_RELAY_URL}/ais/snapshot?...` with the relay auth headers.
  - Returns `{snapshot: undefined, fetchedAt: 0, dataAvailable: false}` when
    the relay URL is absent, the request is non-OK, or the payload is invalid.
- `scripts/ais-relay.cjs`
  - Requires `AISSTREAM_API_KEY` for upstream AISStream ingestion.
  - Requires `RELAY_SHARED_SECRET` unless its explicit unauthenticated bypass
    is deliberately enabled.
  - Builds and serves the snapshot from its in-memory vessel state; the
    snapshot route is authenticated and bounded.
- `vite.config.ts`
  - The dev server has a `/ws/aisstream` WebSocket proxy, but the current
    browser service uses the HTTP maritime RPC snapshot path, not that WebSocket
    directly. The sebuf plugin correctly registers the maritime RPC route.
- `src-tauri/sidecar/local-api-server.mjs`
  - A sidecar without `WS_RELAY_URL` cannot make the local maritime handler
    produce live AIS. Previously, maritime was absent from the sidecar's
    cloud-preferred list; because the local handler returns a valid 200 empty
    envelope, normal error-based cloud fallback never ran.

## Root cause and prerequisites

The running local prototype had no usable relay path for its local maritime
handler. The minimum live-data prerequisites are:

1. A running AIS relay reachable through `WS_RELAY_URL` (HTTP/HTTPS or
   WS/WSS URL; the handler normalizes WS schemes for HTTP snapshot access).
2. Relay-side AISStream authorization (`AISSTREAM_API_KEY`) and a live
   AISStream connection with current positions.
3. Matching relay authorization (`RELAY_SHARED_SECRET`, plus the configured
   relay auth header) between the maritime handler and relay.
4. In a desktop/sidecar deployment without a local relay, cloud fallback must
   be enabled and the sidecar must have whatever cloud API authorization the
   cloud maritime endpoint requires. This is authorization, not display state.

No secret values were read or printed. No provider subscription was opened.

## Historical attempted sidecar fix — reverted; not the browser runtime

Added `/api/maritime/v1/` to the sidecar's cloud-preferred routes when
`WS_RELAY_URL` is absent. This prevents a relay-less sidecar from incorrectly
stopping at the local 200-empty response and allows its existing bounded cloud
fallback to run. The change does not create credentials, start infrastructure,
or fabricate AIS data. If cloud authorization is absent, the remaining blocker
will be an explicit cloud authorization failure.

Regression coverage was added to the sidecar test asserting the maritime
snapshot is cloud-preferred in the no-relay configuration.

## Display/config conclusion

Private browsing mode only affects storage/UI persistence in the inspected
code; it does not supply or remove the server relay. The AIS layer is consumed
by both the SVG map (`src/components/Map.ts`) and DeckGL map
(`src/components/DeckGLMap.ts`); no experimental map adapter gate was found on
the maritime fetch path. A working snapshot would therefore be a data-path
issue independent of the selected map renderer.

## Verification

```text
node --test src-tauri/sidecar/local-api-server.test.mjs
86 passed, 0 failed
```

The local endpoint remains empty until the sidecar is restarted/reloaded with
the focused routing change and either a configured relay or authorized cloud
fallback. The public relay health check confirms the upstream backend itself
was healthy during this diagnostic.
