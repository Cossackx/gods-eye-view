# Local AIS preview — verified restore

Checked 2026-09-11. This is a local test setup, not zero-cost cloud deployment.

## Run

From `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`:

```bash
"C:/Program Files/nodejs/node.exe" scripts/local-ais-preview.mjs --env "C:/Users/aleks/Projects/gods-eye-view/.env"
```

- Dashboard: http://127.0.0.1:4189/
- Authenticated relay: http://127.0.0.1:4191/ (snapshot requests require the in-memory relay secret)
- Existing 4187 preview has NOT acquired this process's relay configuration. Use 4189 for AIS testing.
- Close launcher with Ctrl+C to stop its children. Windows forced-termination cleanup should be verified separately; no always-on service was installed.

## Credential boundaries

Node's built-in loadEnvFile reads the explicitly authorized original file into the launcher process. Only AISSTREAM_API_KEY is selected and forwarded to the relay; other provider credentials are not forwarded. Relay auth is generated in memory, shared with the dashboard server, not printed or saved. Child environments are allowlisted; WM_SKIP_DOTENV suppresses the custom config's ambient dotenv loading. Provider keys must not be copied into browser bundles.

## Parent corrections to child implementation

- Use Vite development server, NOT static build/preview: the maritime handler is registered through configureServer. A static preview would not run that API.
- Enable VITE_PRIVATE_WORKSPACE=1 for the new dashboard.
- Relay port4190 was rejected by Node Fetch with `fetch failed / bad port` (Sieve blocked port). Port4191 works.
- An authenticated startup request initiates on-demand AIS ingestion after relay readiness. RELAY_TEST_MODE disables ancillary startup seed loops; it does not supply test vessel records without their separate flags, which are not enabled.
- Broader World Monitor dev polling still runs and may report unrelated unconfigured sources. No claim that every background task is disabled.

## Live verification

- Dashboard `/api/maritime/v1/get-vessel-snapshot?include_candidates=true` returned `dataAvailable:true` and a nonzero fetchedAt.
- Snapshot contained125 candidate reports and124 density zones at the second checkpoint.
- Relay live counters increased from1,098 vessels/1,308 messages to5,222 vessels/6,434 messages. These are point-in-time counts, not completeness or current-count guarantees.
- Snapshot metadata remained cached while relay counters grew, consistent with the handler's five-minute base snapshot TTL. Do not describe each dashboard request as instantaneous live positions.
- Unauthenticated direct relay snapshot request returned HTTP401.
- Five focused launcher checks passed. They include source-wiring assertions and do not prove every failure/cleanup path.

AIS data transport is restored for this local preview. Individual vessel drawing in the experimental Cesium adapter is still not implemented; normal World Monitor ship/density presentation and source filters determine what is visible. Do not claim all5,222 vessels are drawn or that the full God's Eye AIS layer has been ported.
