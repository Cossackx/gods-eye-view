# World Monitor-Inspired Product Scope

**Status:** Historical proposal reconciled to confirmed direction on 2026-09-11. Experimental integration code exists at `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`, but is not merged or deployed. See [PROJECT-STATUS.md](../PROJECT-STATUS.md) and [README.md](../README.md) when created.  
**Created:** 2026-09-10  
**Applies to:** Cossackx/gods-eye-view  
**Research inputs:** [World Monitor features](https://www.worldmonitor.app/docs/features), [map engine](https://www.worldmonitor.app/docs/map-engine), [signal intelligence](https://www.worldmonitor.app/docs/signal-intelligence), [architecture](https://www.worldmonitor.app/docs/architecture), and [licensing](https://raw.githubusercontent.com/koala73/worldmonitor/main/docs/license.mdx).

## 1. Product direction

Build a **God's Eye Intelligence Workspace**: use the World Monitor dashboard shell as the default experience, while retaining God's Eye View's spatial layers, tracking, and cockpit. The flat 2D overview and immersive 3D globe share the same map pane; switching modes preserves panels and investigation state.

This is a deliberate product pivot: the current circular "eye" presentation is a cinematic focus treatment, not an effective default workspace for scanning many signals. It should become an optional **Focus Lens** display mode rather than the shell that constrains the product.

The result should make a globe operator able to answer:

1. **What is happening now?** — a decluttered, categorized view of live signals.
2. **Why is this worth attention?** — source, time, confidence, coverage, and nearby related signals are always visible.
3. **What changed in this region?** — a timeline, saved theater view, and shareable link provide context.
4. **What can I trust?** — each data item identifies its source, freshness, terms, and whether the source is degraded, stale, empty-confirmed, or unavailable.

### Default workspace and focus modes

| Surface | Job | Layout | Design rule |
| --- | --- | --- | --- |
| **Global Signals workspace (default)** | Scan, compare, filter, and prioritize many signals. | Full rectangular viewport: global command/search bar, persistent left source/layer rail, center Cesium globe/map, right event/feed rail, and optional bottom timeline. | Information density wins; the globe is one working pane, not a circular peephole. |
| **Theater workspace** | Brief on a named region such as Indo-Pacific, MENA, or Europe. | Same shell with a saved camera, relevant sources, event timeline, and status summary. | Switching theater changes state, not the whole application. |
| **Event investigation** | Understand one event and its evidence. | Selected event expands the right rail into a detail view with sources, freshness, links, nearby signals, and a permalink. | Evidence is visible before AI interpretation. |
| **Cockpit / Focus Lens** | Follow a single aircraft, vessel, camera, or event in immersive 3D. | Existing tracking, HUD, 3D globe, visual modes, and local context. | Opt-in focus mode; the circular lens and cinematic treatments are available here but never hide the default workspace's information. |

The product uses one dashboard shell and one working map pane. It must support both the existing 2D overview and God's Eye's 3D experience without splitting them into separate tabs or forcing fullscreen. Renderer details remain an implementation concern, subject to the unresolved 3D border/texture alignment acceptance blocker.

### First-pass desktop layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ GOD'S EYE INTELLIGENCE   [Global] [Theaters] [Watchlists]  Search / Ctrl+K  │
├───────────────┬──────────────────────────────────────┬───────────────────────┤
│ LAYERS        │                                      │ LIVE SIGNALS          │
│ Sources       │                                      │ 12 new / 3 degraded   │
│ Freshness     │           RECTANGULAR                │ [event timeline]      │
│ Filters       │           CESIUM GLOBE               │ [source/freshness]    │
│ Watchlists    │                                      │ [selected-event card] │
│               │                                      │                       │
├───────────────┴──────────────────────────────────────┴───────────────────────┤
│ TIME / EVENT HISTORY       [focus lens] [share] [save workspace]             │
└──────────────────────────────────────────────────────────────────────────────┘
```

On compact screens, the left and right rails become drawers/bottom sheets; the full globe remains rectangular. The Focus Lens does not become the mobile default.

## 2. Licensing direction and preserved history

World Monitor's platform/dashboard source is documented as **AGPL-3.0-only**. Directly copying, adapting, translating, vendoring, or linking that code into this MIT-based fork would create a serious risk that the combined distributed or network-served application must be offered under AGPL, including Corresponding Source access to remote users. MIT code can be included in an AGPL work, but that changes the combined-work distribution posture.

**Current direction:** direct World Monitor code reuse is accepted in principle under AGPL, with the combined application complying with AGPL as applicable. Preserve God's Eye MIT attribution and all third-party notices, verify exact pinned licence text and corresponding-source obligations, and separately review assets, data and hosted API terms. This is not authorization to publish or merge unrelated Git histories.

The earlier independent-implementation recommendation below is retained as history, not the current product decision. It remains a fallback if exact provenance, terms or technical compatibility make reuse unsuitable.

Permissible next paths, subject to terms review:

1. **Fallback:** independent implementation against directly licensed upstream sources.
2. **Optional:** a separately configured adapter for an officially documented World Monitor API/SDK, only after reviewing its EULA, data rights, costs, and exact package license.
3. **Alternative:** obtain a written commercial licence/exception from World Monitor's rightsholder if direct code reuse is important.
4. **Current compatible posture:** adopt the applicable AGPL obligations for the combined application and provide source as required; do not infer proprietary hosted-service or third-party-data rights from AGPL acceptance.

This is engineering guidance, not legal advice.

## 3. Capability map

| World Monitor-inspired outcome | God's Eye implementation approach | First value |
| --- | --- | --- |
| Categorized layer catalog and regional presets | A GEV-owned `IntelligenceRegistry` that declares category, source, freshness, attribution, zoom/point budgets, and theater presets. | Makes existing layers discoverable without a new rendering engine. |
| Command palette and rapid regional navigation | Keyboard command palette plus saved theater views: Global, Europe, MENA, Indo-Pacific, Americas. | Faster analyst navigation. |
| Noise control and progressive disclosure | Zoom/severity/viewport gates, clustering, label budgets, and priority-first rendering on Cesium. | Improves readability before adding new feeds. |
| Source manager and provenance | Source health card plus per-source toggles; show freshness, source links, licensing, and errors. | Prevents false certainty and supports responsible use. |
| Event feed and map-event inspector | Compact Intelligence panel and selected-event detail surface with timeline, citations, nearby signals, and share link. | Converts a marker into a reviewable evidence object. |
| Findings / hotspot workflow | Start with transparent rules: source-diverse events within a region/time window, dedupe, cooldown, and an explanation. | Useful triage without opaque geopolitical scoring. |
| Country/region dossier | Evidence-backed regional timeline, active signal counts, key assets, and sources. | Defer AI narrative until the underlying evidence is trusted. |
| Bookmarks, kiosk, and operational sharing | Persist safe camera/layer/theater/selection state into URLs; add saved workspaces and a clean display mode. | Enables briefing and display use. |

## 4. Architecture proposal

Keep GEV's current Vite + Cesium + vanilla ES-module architecture. Add a narrow, testable intelligence domain instead of growing `src/ui.js` further.

```text
Rectangular Cesium workspace + dashboard shell
               │
     Intelligence controllers and renderers
               │
Normalized event + source-health contracts
               │
        Source registry and adapters
               │
Vite development proxy / deployable same-origin BFF
               │
    Direct upstream feeds or optional licensed APIs
```

Suggested module boundary:

```text
src/intelligence/
  contracts.js       # JSDoc contracts for events, sources, health envelopes
  registry.js        # source/layer metadata and theater presets
  adapterRunner.js   # fetch, timeout, retry, cache, stale/degraded state
  adapters/          # one independently licensed source per module
  renderers/         # Cesium point/cluster rendering and UI panel rendering
  findings.js        # transparent correlation rules, later phase only
```

Every source adapter returns a normalized envelope:

```js
{
  status: 'fresh' | 'stale' | 'degraded' | 'unavailable' | 'empty-confirmed',
  fetchedAt: 'ISO timestamp',
  expiresAt: 'ISO timestamp',
  source: { id, label, attributionHtml, termsUrl, provenanceUrl },
  items: [{ id, kind, title, occurredAt, latitude, longitude,
            severity, confidence, urls, rawSourceId }]
}
```

Rules:

- An empty list is not evidence of “nothing happened” unless explicitly `empty-confirmed`.
- Credentials stay in server-side proxy/BFF code. The browser must never provide an arbitrary upstream URL.
- Every new source needs a `DATA_SOURCES.md` entry and `dataCredits.js` attribution.
- Adapters are pure payload-normalization functions with fixture tests.
- Rendering enforces caps, clustering, zoom gates, and proper cleanup when disabled.

## 5. Phased delivery

### Phase 0 — Product, source, and licence inventory

Reconcile both complete catalogs and document each source's terms, attribution, refresh cadence, quotas, retention policy, commercial posture, availability and owner. Paid/unavailable entries remain explicit and disabled. Record AGPL provenance and notices.

**Exit:** approved full source inventory and provenance record; any reuse is reviewed for AGPL/notice obligations, and no experimental work is treated as merged or deployed.

### Phase 1 — Dashboard shell and intelligence foundation

Add the normalized event/source-health contracts, registry, adapter runner, freshness UI vocabulary, and server-side proxy pattern. Build the rectangular desktop shell with left layer/source rail, center Cesium workspace, right signals rail, and a command/search entry point. Reuse GEV's existing cache, stale-last-good, attribution, and layer lifecycle patterns.

**Exit:** dashboard rails remain usable at normal desktop width; the globe resizes correctly; tests prove valid payload, invalid payload, timeout, stale fallback, unavailable, and empty-confirmed behavior.

### Phase 2 — First vertical slice: Global Signals over existing data

Do **not** duplicate the existing USGS earthquake layer. Instead, add a source-health/status card and a compact event list that initially surfaces already-supported GEV signals:

- significant earthquakes;
- active fires when `FIRMS_MAP_KEY` is configured;
- launches;
- high-level flight/vessel availability;
- mapped installation context when enabled.

A selected event focuses the globe and opens an evidence card with source/time/freshness/link information.

**Exit:** toggle → fetch/status → marker/list → detail → attribution → disable is covered by unit and browser smoke tests.

### Phase 3 — Analyst workflow

Add theater presets, keyboard command palette, source filters, timeline, saved permalink state, clustering/decluttering, and responsive panel behavior.

**Exit:** an operator can open a regional view, understand data coverage, select a signal, and share the same investigation state.

### Phase 4 — New independent source adapters

Add one domain at a time after source review: maritime disruption, weather/severe events, carefully licensed news/RSS, or supply-chain reference data. Each source gets separate contract fixtures, attribution, and degradation tests.

**Exit:** each source is bounded, source-attributed, independently switchable, and does not degrade globe performance beyond its declared budget.

### Phase 5 — Transparent findings and regional dossiers

Only after the evidence layer is reliable, add explainable correlation: “multiple independent sources within a defined geography/time window.” Then add regional dossiers composed from that evidence.

**Exit:** every surfaced finding answers “why is this here?” with visible component events and limitations. AI prose, if later added, is optional and never hides evidence.

## 6. First release scope: Global Signals MVP

**Include**

- One `IntelligenceRegistry` and source-health envelope.
- Rectangular dashboard shell with left Layers/Sources rail and right Live Signals rail.
- Existing-source status and freshness panel.
- Event selection/detail with raw-source links.
- Cesium clustering and a point/label budget.
- One theater preset and shareable state.
- Full attribution and state tests.

**Exclude**

- A circular eye/lens as the default application layout.
- Paid or unavailable providers presented as active.
- AI-generated geopolitical risk scores or summaries.
- Public account systems, billing, desktop shell, or mobile app. The complete two-project catalog remains in scope, including explicit paid/unavailable entries.
- Scraping World Monitor pages or treating its hosted data as an unlicensed upstream source.

## 7. Main risks and mitigations

| Risk | Mitigation |
| --- | --- |
| AGPL scope / proprietary data terms | Keep a provenance log, implement independently, review API/data contracts before use, and seek counsel for a commercial release. |
| GEV's large `src/ui.js` becomes more coupled | Use an intelligence controller/module seam; do not put all new DOM behavior into `src/ui.js`. |
| Cesium performance degradation | Cap points/vertices, cluster, gate by zoom/viewport, and pause hidden-tab work via the existing render-governor discipline. |
| Proxy works locally but not in production | Design the handler as a portable same-origin BFF/edge function from the start; Vite middleware alone is development-only. |
| Source outages become misleading | Model fresh/stale/degraded/unavailable/empty-confirmed separately and display the status. |
| Correlation looks authoritative | Start rule-based, expose input signals and limits, and avoid claims unsupported by sources. |
| Scope creep | Ship the Global Signals MVP before any scoring, AI, or new-source expansion. |

## 8. Historical decision point

The former decision point was to choose an independent World Monitor-inspired approach or an alternative licensing/API path. The current decision is recorded in APPROVED-INTEGRATION-DIRECTION.md: use the World Monitor shell, accept AGPL reuse subject to verification, and proceed only through bounded experimental work and explicit acceptance gates.
