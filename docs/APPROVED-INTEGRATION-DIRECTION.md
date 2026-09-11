# Approved integration direction

Status: Confirmed direction and current status reviewed 2026-09-11. This document supersedes conflicting older proposals in DEVELOPMENT-PLAN.md, PRODUCT-DECISIONS.md and WORLDMONITOR-INSPIRED-SCOPE.md. It does not authorize publication, hosting spend, or an unrelated-history Git merge. See [PROJECT-STATUS.md](../PROJECT-STATUS.md) and [README.md](../README.md) when created.

## Confirmed requirements

1. Use World Monitor's screen design as the base. Integrate God's Eye's spatial UX into that dashboard rather than adding panels around God's Eye's existing shell.
2. Include BOTH projects' complete existing feed catalogs and coverage descriptions. Inventory against pinned upstream revisions. Catalog completeness is not a promise of live availability. Paid, unconfigured, unavailable and restricted providers remain clearly identified; never imply these sources are active.
3. User accepts an open-source combined application and AGPL compliance for direct World Monitor code reuse. Preserve God's Eye MIT attribution and all third-party notices. Verify exact pinned licence text, source-offer obligations, assets/data licences and hosted API terms; AGPL does not grant access to proprietary hosted services or third-party datasets.
4. God's Eye 3D replaces the dashboard's map pane while other panels remain visible. Maintain the requested 2D/3D switch and preserve selection/filter context. No separate browser tab or forced fullscreen workflow.
5. Zero additional monthly cost takes precedence over live coverage. Slower refreshes and unavailable feeds are acceptable, provided the UI explains why. No automatic paid fallback, billable service activation, or compulsory local always-on backend.
6. Persist bookmarks, personal notes, source links and recent event metadata where permitted. Retention duration remains to be chosen; no historical vessel/aircraft replay requirement.
7. Private standalone browser application for one user. No M365 dependency. No AI in the initial version.
8. No promotional or hosted-account call to action. Saved personal notes and bookmarks are product features, not a public account service.
9. Implementation work is cheap and bounded; child tasks are experiments unless independently verified against the acceptance criteria.

## Current implementation status — 2026-09-11

Experimental code exists at `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`. It is not merged into the GEV repository and is not deployed. The current acceptance blockers are unresolved 3D border/texture alignment and poor default UX. The higher-resolution Iran NaturalEarth50m candidate was tested through parent request interception only: promising visually in 2D, failed in 3D, and was not deployed. Winding/global-fill and CSS opaque-black changes are narrower experiments and do not establish all-border success. Earlier test passes and prior local Google/AIS/TomTom checks are historical scoped evidence, not whole-suite or credential-validity claims.

## Architecture implications to investigate

- Evaluate World Monitor as the application shell, with a God's Eye/Cesium spatial integration, rather than assuming the existing God's Eye fork must host all UI code.
- Determine repository layout only after inspecting both pinned codebases. Keep clean upstream references; do not combine unrelated Git histories as a shortcut.
- Build a complete feed inventory using code/config registration and documentation from both projects. Distinguish provider, endpoint, layer, preset and duplicate feed. Retain both provenance mappings when consolidating a shared provider.
- Inventory fields: stable ID, upstream origin/revision, coverage, auth, provider terms, cost, retention, runtime requirements, adapter readiness and actual health.
- Completion gate: every catalog entry from the pinned inventories has a mapped implemented adapter or an explicit reason it is disabled/unavailable; verify counts programmatically.
- Prove the free private deployment model including protected proxy APIs and stored notes before promising production access.

## Next technical work

Rebaseline the development plan around the confirmed World Monitor-first shell and permitted AGPL reuse. Discover integration seams, dependencies, source catalogs, 2D/3D constraints and deployment limits. Then write implementation-sized tasks with testable acceptance criteria. Earlier clean-room/MIT-only recommendations and reduced-source MVP proposals are no longer the selected product direction.
