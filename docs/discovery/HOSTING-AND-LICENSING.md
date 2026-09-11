# M0 — Hosting and licensing feasibility

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md). The hosting conclusion is documentary feasibility only, not an executed deployment or verified production build. Source-attribution and PWA/build concerns remain open, and the experimental World Monitor checkout is not the main repository implementation.

**Status:** research-only decision record; no services provisioned and no deployment performed.
**Research date:** 2026-09-10. **Scope:** one private user, standalone dashboard, authenticated access, server-side provider proxy, modest saved notes/bookmarks/source links/recent metadata, and the explicit limitation of long-lived AIS WebSockets.

## Decision summary

**Documentary feasibility is credible for a reduced-capability zero-cost deployment, but not proven.** The strongest candidate is a Cloudflare Pages + Workers + D1 design, protected by Cloudflare Access. Cloudflare's published free limits cover static hosting, a small authenticated API/proxy, and modest notes, subject to hard request budgets and provider terms.[1][2][3][4][5] Cloudflare documentation does **not** prove that this repository's eventual build, Cesium asset size/performance, every provider proxy, authentication flow, or AIS connection will work; those require execution.

Continuous AIS ingestion is **not a documentary acceptance criterion**. Cloudflare documents long-lived HTTP/WebSocket support and Durable Object WebSocket hibernation, but it also documents free request/duration ceilings and outbound-connection behavior.[3][6][7] The safe M0 product posture is periodic snapshots or on-demand AIS, with stale/unavailable status. A continuously connected AIS upstream must be exercised on the exact implementation and account before being promised.

## Candidate architectures (at most two)

### A — Cloudflare edge stack (recommended candidate; not yet accepted)

```text
Cloudflare Pages static dashboard
        │ Access policy / identity login
        ▼
Cloudflare Worker (authenticated API + allow-listed provider proxy)
        ├─ D1 (notes, bookmarks, source links, bounded recent metadata)
        └─ optional Durable Object (only for exercised, bounded WebSocket fan-out)
```

**Documented fit.** Pages static asset requests are free and unlimited; Pages Functions count against the Workers Free daily quota.[5] Workers Free has 100,000 requests/day, 10 ms CPU/request, 50 subrequests/invocation, and 128 MB/isolate memory.[1] D1 Free is documented as 10 databases/account, 500 MB/database, 5 GB/account, 50 queries/Worker invocation, 2 MB maximum row/string/blob, and 30-second maximum SQL duration.[2] That is comfortably sized for text notes and links, but not a global event archive or large cached feed corpus.

Cloudflare Access self-hosted applications are deny-by-default and require an Allow policy; the documented browser flow checks an application token on every HTTP request.[4] Cloudflare advertises a $0 Free Zero Trust plan for teams under 50 users.[8] One user is within that published target, but the account's current eligibility and exact Access feature limits still need an execution check.

**Required controls.** Keep all provider credentials in Worker secrets; authenticate every API route; use an explicit source allow-list; impose per-route request budgets, payload-size limits, cache TTLs and fail-closed behavior; disable paid providers by default; never treat Cloudflare's quota behavior as a provider billing cap. D1 writes should be limited to user-owned notes/bookmarks/links and only source metadata whose provider terms permit retention.

**Free-tier restrictions that matter.** At 100,000 Worker requests/day, a browser polling many panels can exhaust the account; a Worker invocation can make at most 50 external/D1/cache subrequests; Free CPU is only 10 ms, and heavier authentication/parsing may exceed it.[1] D1 is single-threaded per database and has the limits above.[2] Access requires an active Cloudflare domain/zone for the documented public-hostname flow; the documentation does not provide a free domain.[4] A domain purchase, if needed, is outside the zero-additional-cost claim.

**AIS/WebSocket posture.** Workers support WebSockets, and Durable Objects support WebSocket servers plus a hibernation API that keeps clients connected while the object is idle.[6][7] However, Durable Object Free is limited to 100,000 requests/day and 13,000 GB-s/day; accepting a WebSocket without hibernation incurs duration for the connection, and an outbound connection can keep an object active.[3] Cloudflare also documents six simultaneous outgoing connections/request and 32 MiB received WebSocket-message size for Durable Objects.[7] These documents establish an available mechanism, not reliable free continuous upstream AIS ingestion. Do not make the AIS provider connection a permanent process until a real deployment test measures reconnects, hibernation, quota use, provider idle behavior, and failure recovery.

### B — Supabase-hosted application services (fallback candidate; not yet accepted)

```text
Static frontend (any free static host)
        │ Supabase Auth session / RLS
        ▼
Supabase Edge Function (authenticated provider proxy)
        └─ Supabase Postgres (notes, bookmarks, links, bounded recent metadata)
        └─ Supabase Realtime only for browser notifications, not AIS upstream
```

**Documented fit.** Supabase Free is advertised at $0/month with 50,000 monthly active users, 500 MB database size, 5 GB egress, 5 GB cached egress and 1 GB file storage; free projects are paused after one week of inactivity.[9] Supabase Edge Functions Free has a 150-second wall-clock limit and 2 seconds CPU per request.[10] Supabase Realtime Free documents 200 concurrent connections, 100 messages/second, 100 channels/connection, 256 KB broadcast payloads and 72-hour broadcast replay retention.[11] Passwordless email's built-in provider is limited to two emails/hour and the OTP request window is 60 seconds.[12][13]

This is enough on paper for one user and small text records, but the pause-after-inactivity rule means cold starts and availability must be accepted. Supabase's Edge Function duration is explicitly unsuitable as proof of a permanently connected AIS upstream. Realtime is a browser transport; it does not document that an Edge Function can hold an upstream AIS connection indefinitely. Use periodic fetches or a separately exercised connector, not a promise of continuous AIS.

**Restrictions and gaps.** Free-tier quotas are plan limits, not a guarantee of uninterrupted service. The static frontend host and private hostname/auth edge still need a selected, verified design. Database row-level security, secret handling, provider allow-listing, request budgets and export/backup behavior require implementation tests. No Supabase document reviewed here grants rights to third-party data; provider retention and redistribution terms remain controlling.

## AIS limitation — explicit M0 finding

AISStream is listed by the existing project documentation as “Free, beta, no formal ToS; AIS is a public broadcast.”[14] That is not a durable service-rights grant and does not establish permission to store, redistribute, or run a relay. The public-broadcast statement also does not remove provider/network terms or operational risk.

The relevant engineering distinction is:

- **Browser session:** a user may open a WebSocket while the dashboard is open, if the provider permits it and the chosen host supports the route.
- **On-demand/periodic snapshot:** compatible with the zero-cost priority; label snapshots and stale data honestly.
- **Always-on upstream collector:** not established by free-tier documentation. It needs execution on the selected host, measured reconnection and quota behavior, and a provider-rights review. Do not claim it in MVP or architecture acceptance.

## Source-code licensing

### God's Eye View pinned repository

The local repository's `LICENSE` is MIT, copyright Bilawal Sidhu (2026). The grant permits use, copying, modification, publication, distribution, sublicensing and sale, subject to retaining the copyright and permission notices; it disclaims warranty and liability. The same file expressly carves out bundled datasets, runtime provider data and third-party models/assets from the MIT grant, and directs readers to `DATA_SOURCES.md` and per-asset notices. [Local evidence: `LICENSE`, `DATA_SOURCES.md`]

### World Monitor pinned license

The upstream revision used for the M0 pin is **`c001e75662f87d580c0ee3c6e7b18eaa8777975a`** (commit message: `fix(sources): publish complete provider catalog (#6509)`, dated 2026-08-12). The exact upstream `LICENSE` fetched at that revision is AGPL v3; the repository's package metadata identifies the platform as `AGPL-3.0-only`.[15][16][17]

The AGPL permits private use, modification, copying and redistribution, including commercial use, **only subject to its conditions**. For a modified version that users interact with over a network, AGPL section 13 requires the operator to offer those users the Corresponding Source of the running version. Preserve the license/copyright notices and provide the complete corresponding source, build/install instructions and any required notices for the exact released revision. Do not assume that a private one-user deployment removes the obligation if the service is made available over a network; obtain legal review for the final distribution/access model.

The World Monitor licensing page also states that only the official thin client packages are MIT; the platform, server and dashboard remain AGPL-3.0-only.[16] World Monitor's name, logo and visual identity are separate trademark/branding rights, not granted by AGPL.[16] Reusing the dashboard code is therefore approved in principle by the product direction, but implementation must retain AGPL notices, offer corresponding source where applicable, document local changes, and avoid implying official affiliation.

## Hosted World Monitor service/API is separate

Do **not** treat the AGPL code license as permission to call or republish World Monitor's hosted service/data. The hosted Service and Outputs are governed separately by the EULA and Terms.[17][18]

Relevant exact restrictions in the current published terms include:

- API/MCP credentials are confidential; do not publish/embed them in distributed client code or hand them to another organization.[17]
- Do not exceed or circumvent quotas, rate limits, authentication, entitlement checks or access controls, including by scraping the rendered front end.[17][18]
- Do not bulk-extract the Service or reconstitute its data as a standalone database or substantially similar feed.[17]
- Do not redistribute beyond the authorized class/plan; source-specific terms remain controlling.[17]
- Do not train, fine-tune, distill, evaluate or benchmark a competing model or dataset on Outputs without written permission.[17][18]
- Do not remove or alter copyright, license, attribution, source citations, timestamps or provenance markers, and do not misrepresent affiliation.[17]
- Hosted free/anonymous access is as-is/as-available with no service commitment and may be modified, limited or withdrawn without notice.[18]

The current pricing page describes paid API plans (including API Starter at $99.99/month with a 1,000-request/day starter limit and API Business at $299.99/month with redistribution rights); this is not a zero-cost dependency.[19] The proposed app should self-host the approved source and use separately cleared feeds, not rely on the World Monitor hosted API, unless a later budget and rights decision explicitly authorizes it.

## Source/data/service-rights boundary

| Subject | Right established | Not established / restriction |
|---|---|---|
| God's Eye source | Local MIT grant, notices retained | Does not license third-party data/assets/models |
| World Monitor platform source | AGPL-3.0-only at the pinned revision; network users may receive corresponding-source offer | Does not license World Monitor branding or hosted outputs; AGPL compliance remains required |
| World Monitor hosted API/Service | Only the plan/EULA/Terms scope purchased or otherwise granted | Credentials, quotas, bulk extraction, redistribution, ML-training and attribution restrictions apply |
| AISStream | Existing repo records free beta/public broadcast | No formal ToS is documented there; no rights to continuous relay, retention or redistribution inferred |
| Provider feeds generally | Only each provider's own license/terms | A free host changes cost and topology, not data rights; source-specific retention, caching and attribution remain mandatory |

For the MVP, save user-authored notes, bookmarks and source URLs by default. Save recent event metadata only after checking each source's retention/redistribution terms; do not store article bodies, map tiles, proprietary imagery or live AIS history merely because the database has capacity. Preserve source URL, provider, fetched/observed timestamp, attribution and stale/unavailable state.

## Claims that require execution, not documentation

The following remain unproven and must not be reported as working until exercised:

1. Build and deploy the combined World Monitor/God's Eye artifact on the selected host, including Cesium/static asset limits and cold-start behavior.
2. Private authentication end-to-end: unauthenticated HTML/API denial, session expiry, direct-origin bypass resistance and one-user recovery.
3. Secret-bearing provider proxy: no key in client bundle/logs, allow-list enforcement, timeout/oversize handling, CORS and quota governor.
4. D1 or Supabase persistence: schema, migrations, note/bookmark/link CRUD, export, retention cleanup, concurrent writes and restore procedure.
5. Actual free-tier consumption under the intended refresh schedule, including the 100,000/day Cloudflare request ceiling or Supabase quotas, and behavior after exhaustion/pause.
6. Every selected feed's live response, CORS/proxy compatibility, terms-compliant caching and attribution.
7. AIS WebSocket behavior: upstream connection, reconnect/backoff, browser fan-out, host sleep/hibernate, provider disconnects, message volume and measured free quota.
8. 2D/3D renderer switching, memory/GPU cleanup and state preservation in a real browser.
9. AGPL corresponding-source offer and notices for the exact combined revision, plus legal review of any private/public network-access interpretation.

## Sources

[1] Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/  
[2] Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/  
[3] Cloudflare Durable Objects pricing: https://developers.cloudflare.com/durable-objects/platform/pricing/  
[4] Cloudflare Access self-hosted application: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/  
[5] Cloudflare Pages Functions pricing: https://developers.cloudflare.com/pages/functions/pricing/  
[6] Cloudflare Workers WebSockets: https://developers.cloudflare.com/workers/runtime-apis/websockets/  
[7] Cloudflare Durable Objects WebSockets and limits: https://developers.cloudflare.com/durable-objects/best-practices/websockets/ and https://developers.cloudflare.com/durable-objects/platform/limits/  
[8] Cloudflare Zero Trust Access pricing: https://www.cloudflare.com/sase/products/access/  
[9] Supabase pricing: https://supabase.com/pricing  
[10] Supabase Edge Function limits: https://supabase.com/docs/guides/functions/limits  
[11] Supabase Realtime limits: https://supabase.com/docs/guides/realtime/limits  
[12] Supabase passwordless email: https://supabase.com/docs/guides/auth/auth-email-passwordless  
[13] Supabase Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits  
[14] Local source/data record: `DATA_SOURCES.md`, AISStream row  
[15] Pinned World Monitor commit: https://github.com/koala73/worldmonitor/commit/c001e75662f87d580c0ee3c6e7b18eaa8777975a  
[16] Pinned World Monitor LICENSE: https://raw.githubusercontent.com/koala73/worldmonitor/c001e75662f87d580c0ee3c6e7b18eaa8777975a/LICENSE  
[17] World Monitor EULA: https://www.worldmonitor.app/docs/eula.md  
[18] World Monitor Terms of Service: https://www.worldmonitor.app/docs/terms.md  
[19] World Monitor pricing: https://www.worldmonitor.app/docs/pricing
