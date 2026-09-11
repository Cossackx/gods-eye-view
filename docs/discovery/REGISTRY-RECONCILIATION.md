# Registry reconciliation

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md). The 1,383 client / 468 server figures are registration rows with repetition, not unique feeds or live verified sources; full both-sided inventory reconciliation remains incomplete. The source-host reconciliation is 894 raw / 132 excluded / 762 nonexcluded / 761 catalog-active / 748 labels.

**Status: partial discovery; the feed catalogs are not yet promoted to complete.**

## Pinned source and extraction design

World Monitor is pinned to `d906869231970005ab3e108ff5321f179e8b7457` at:

`C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`

`extract-feed-registries.mjs` imports only the two modules that actually own the
registries:

- `src/config/feeds.ts`: `FULL_FEEDS`, `CANONICAL_FEEDS`, `ON_DEMAND_FEEDS`,
  active-variant `FEEDS`, and `INTEL_SOURCES`.
- `server/worldmonitor/news/v1/_feeds.ts`: `VARIANT_FEEDS`.

It does not import `App`, a config barrel, variant barrels, `.env`, or any
credential/config bootstrap. The pinned checkout's installed `tsx` must run the
script because the source modules are TypeScript and use the checkout's
`@/*` path mapping.

```text
npx tsx C:/Users/aleks/Projects/gods-eye-view/docs/discovery/extract-feed-registries.mjs \
  --worldmonitor C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery
```

Optional `--out-dir` selects the discovery output directory. By default the
script writes beside itself:

- `worldmonitor-feed-registries.json`: raw client/server maps plus row records.
- `worldmonitor-source-host-reconciliation.json`: source-manifest counts and
  the host discrepancy explanation.

Each row retains catalog, map/variant, category, declaration index, name,
optional feed metadata, and URL leaves. Multilingual URL objects are not
flattened destructively: the original `metadata.url` remains intact and each
leaf records its language. Client URLs are preserved exactly as exported,
including the client RSS proxy wrapper; server URLs preserve their upstream
values.

## Why 762 became 761

The parent extraction's 894 raw `entries[]` rows reconcile as:

| Measure | Count |
| --- | ---: |
| Raw rows | 894 |
| `excluded` | 132 |
| `terms-review` | 668 |
| `reviewed` | 94 |
| Unique nonexcluded hosts | 762 |
| Nonexcluded provider labels | 748 |
| Catalog-active hosts | 761 |

The source-attribution generator's catalog predicate is effectively:

```js
entry.observed === true
  && entry.catalogActive !== false
  && (entry.status === 'terms-review' || entry.status === 'reviewed')
```

The 762 figure only removes rows with `status: "excluded"`; it does not honor
`catalogActive: false`. The sole nonexcluded row removed by the catalog-active
predicate is:

- host: `gtaupdate.com`
- provider: `GTA Update`
- status: `reviewed`
- `catalogActive: false`
- reference: `scripts/lib/gta-update.mjs`

Its review text says production remains disabled pending upstream provenance,
safety, cadence, capacity, and product acceptance gates. Therefore 761 is the
correct active-host count; 762 is the broader nonexcluded row/host count.

## Exact source-attribution exclusion behavior

The generator distinguishes a source row being observed from a source being a
credit-bearing active catalog item:

1. The only credit-bearing statuses are `terms-review` and `reviewed`.
2. `excluded` rows remain visible in the manifest but do not count as active.
3. A row referenced only by `src/components/LiveNewsPanel.ts` receives the
   generated live-video exclusion: presentation-only HLS transport, not an
   ingested dataset.
4. Hosts in the generator's `EXCLUDED_HOSTS` set, and every host ending in
   `.worldmonitor.app`, receive the generated first-party/control-plane/UI/
   rendering exclusion. The set covers browser presentation, telemetry,
   documentation, social/control-plane, namespace, and similar non-ingested
   transports (for example `x.com`, `t.me`, `github.com`, map tile hosts,
   `www.youtube.com`, and `wingbits.com`).
5. Curated `PROVIDER_OVERRIDES` take precedence over generated exclusions.
   Generated exclusion text is cleared if the host later gains a real ingest
   reference; curated human exclusions are not overwritten by that cleanup.
6. Retired rows are retained as explicit `observed: false`, `excluded` history
   rather than silently deleted. They are not active hosts.
7. `logicalEntries[]` are candidate/logical attribution rows that are not live
   host rows. At this pin there is one: `Fintraffic Digitraffic`, host
   `not-currently-wired`, explicitly excluded because no current source call
   was found.
8. `logicalProviders[]` collapse FeedBurner-only declarations into editorial
   identities. At this pin they are Fast Company, NDTV, and The Hacker News.
   Their `feeds.feedburner.com` transport is retained as transport provenance,
   while the logical publisher identities are included in provider identity
   reporting. `isCatalogProviderEntry` excludes syndication transports from
   publisher counting.

## Remaining verification boundary

The parent agent must run the executable in the pinned checkout and inspect the
JSON totals. This change does not modify `feed-inventory.json`, existing
inventory, World Monitor source, deployment state, or secrets. The report and
script establish the mechanical extraction path; catalog completeness still
requires the parent's run and reconciliation of the generated client/server
rows against the pinned source.
