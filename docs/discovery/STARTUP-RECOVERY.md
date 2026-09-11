# World Monitor startup recovery

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md). The missing startup inventory artifact was repaired and startup was verified for that checkpoint. This does not establish a full production build, complete feed availability, or map correctness; the detached checkout remains experimental.

## Root cause

Discovery installed dependencies with `npm ci --ignore-scripts`, skipping the package's `postinstall` inventory generator. `api/product-catalog.js` imports the intentionally gitignored `api/_inventory-facts.generated.js`. Missing artifact reproduced as HTTP 500 from Vite.

## Supported repair and verification

Run from the World Monitor checkout:

- `npm run inventory:facts`
- `npm run inventory:facts:check`

Executed successfully. Generator reported the existing workos.com attribution scanner mismatch and used its built-in committed-count fallback. Do not silently change the source ledger to suppress that separate warning.

After generation, affected module returned HTTP 200. Started standard Vite config on http://127.0.0.1:4185/ and verified in real Chrome: dashboard title loaded, zero Vite error overlays and zero pageerror events during the 15-second observation. This verifies startup only, not every external feed.

## Separate test server

http://127.0.0.1:4186/cesium-spike.html is the isolated Cesium harness. Its minimal config is intentionally not the full dashboard config. Opening the dashboard root on that port produces missing app build-definition errors such as __BUILD_HASH__; use port 4185 for the dashboard instead.

No source-import workaround, fabricated inventory file, credential edit or disabled error overlay was needed. No commits or deployment performed.
