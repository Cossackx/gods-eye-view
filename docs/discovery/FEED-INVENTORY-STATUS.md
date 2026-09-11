# Feed inventory status

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md) for the current evidence boundary. The extracted 1,383 client and 468 server rows are registration rows, not unique feeds or live-source counts; the full client/server inventory remains incomplete. Source-host counts are 894 raw, 132 excluded, 762 nonexcluded, 761 catalog-active (because `gtaupdate.com` has `catalogActive: false`), and 748 labels.

**Status:** partial discovery — not complete.

## Pinned revisions

- God's Eye View: `Cossackx/gods-eye-view@759652207fd1279ece97f0f19af566feb9a82146`
  ([GitHub commit](https://api.github.com/repos/Cossackx/gods-eye-view/commits/759652207fd1279ece97f0f19af566feb9a82146)); local checkout evidence: `docs/discovery/baseline-0.log`.
- World Monitor: `koala73/worldmonitor@d906869231970005ab3e108ff5321f179e8b7457`
  ([GitHub commit](https://api.github.com/repos/koala73/worldmonitor/commits/d906869231970005ab3e108ff5321f179e8b7457)).

## Batch 1 delivered

`docs/discovery/feed-inventory.json` is valid machine-readable JSON and contains **24 unique stable-ID entries** across both repositories, plus a `registry_catalog` that maps the raw registries needed for mechanical extraction. It records verified God's Eye provider registrations and World Monitor catalog/provider families without treating generic provider summaries as complete feed rows.

Every entry includes origin/revision provenance, source evidence, domain/coverage, auth, cost, runtime, terms, retention, adapter readiness, health state and explicit unresolved fields. Hosted World Monitor APIs are not treated as freely reusable; provider-specific rights remain separate from AGPL code rights.

## Coverage manifest

The JSON manifest records **16 inspected registry/source surfaces** and **7 outstanding workstreams**. The most important inspected sources are:

- God's Eye `DATA_SOURCES.md`, `vite.config.js`, `src/data/dataCredits.js`, `src/data/`, and `src/data/local_data/` (paths identified; endpoint/dataset row extraction remains open).
- World Monitor pinned `shared/source-attribution-manifest.json` (the complete raw host/provider registry), `docs/source-attribution.mdx` (generated presentation), `src/config/feeds.ts`, `server/worldmonitor/news/v1/_feeds.ts`, `src/config/variants/*.ts`, `src/config/feed-resolution.ts`, `data/telegram-channels.json`, `src/config/map-layer-definitions.ts`, `data/x-accounts.json`, `.env.example`, and `package.json`.

`shared/source-attribution-manifest.json` is now explicitly recorded as the machine-readable authority for the **761 active source hosts / 748 active providers** catalog: `entries[]` carries host/provider/kind/license/status/references, while `logicalEntries[]` and `logicalProviders[]` carry exclusions and syndication-collapse hints. The generated docs table is a presentation to reconcile, not an independent row source.

The feed registries are not interchangeable: client `CANONICAL_FEEDS` is a URL-deduped union of seven client maps (including `ON_DEMAND_FEEDS`), while server `VARIANT_FEEDS` is the digest registry. Both must be extracted and reconciled by variant/category/name/URL. The Telegram registry has `full`, `tech`, and an intentionally empty `finance` set. The layer registry has six variants, three renderer kinds, sunset filtering, and a public product-facts count of 57 layers.

## Exact continuation

1. Parse `shared/source-attribution-manifest.json` as the complete raw host/provider registry; reconcile its `entries[]` against generated `docs/source-attribution.mdx` and preserve logical exclusions/syndication mappings.
2. Parse all `FULL_FEEDS` and variant feed maps, including multilingual URL objects, flags, presets and URL dedupe keys; reconcile client/server registries against `mergeCanonicalFeeds`.
3. Enumerate structured seed registries, map-layer catalogs, operational-status registries, Telegram channels, and disabled/restricted variants from raw files.
4. Enumerate every God's Eye proxy endpoint, CCTV config variant, bundled dataset and attribution registration at feed/layer/endpoint granularity.
5. Resolve per-provider terms, quotas, retention and redistribution rights, then run programmatic count/mapping/exclusion reconciliation.
6. Join every retained source host/feed/layer/channel to runtime consumers, seed keys, route allowlists, and attribution surfaces; record unresolved joins rather than collapsing them into provider families.
7. Keep the registry catalog and unresolved list current as row-level extraction proceeds; do not promote `status` or `completeness.complete` until counts reconcile against both pinned revisions.

No completeness claim is made until those counts reconcile against both pinned revisions.
