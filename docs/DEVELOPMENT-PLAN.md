# Standalone Intelligence Workspace — Development and Project Management Plan

> [!important] Historical/reference copy — routing updated 2026-09-12
> Our combined product is **RAZ Fusion Center**. Current plans, decisions and status live in [the canonical project index](../../raz-fusion-center/docs/project/README.md) and [current status](../../raz-fusion-center/docs/project/PROJECT-STATUS.md), under `C:/Users/aleks/Projects/raz-fusion-center`. Published product repository: https://github.com/Cossackx/raz-fusion-center (private).
> The dated statements below describe the earlier project/fork; they do not override current publication, renderer, optional free-only AI or runtime decisions. This God's Eye View checkout remains an upstream reference/rollback copy, not the active product home. Current app address: http://127.0.0.1:4195/dashboard; an app restart does not establish AIS/aircraft relay readiness.


**Status:** Current execution plan reviewed 2026-09-11. Experimental implementation exists outside this repository but is not merged or deployed. This document does not authorize deployment, publication, billing, or unrelated-history Git merges. Canonical status will be [PROJECT-STATUS.md](../PROJECT-STATUS.md); repository navigation will be in [README.md](../README.md).
**Product owner:** Raz (Aleksei Razsadin)
**Delivery support:** Hermes, with bounded implementation/review tasks as authorized
**Authoritative requirements:** [APPROVED-INTEGRATION-DIRECTION.md](APPROVED-INTEGRATION-DIRECTION.md), supplemented by [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md).

## 1. Objective and constraints

Deliver a private standalone browser application using World Monitor's dashboard design as the base, integrating God's Eye's spatial exploration and tracking into its map pane. Keep the other information panels visible when switching from the flat 2D overview to God's Eye's immersive 3D experience. Evaluate World Monitor as the application foundation; the existing God's Eye checkout is not a mandated implementation root.

Confirmed constraints:

- Balanced dashboard, rectangular map and visible information panels; circular scope is not the default.
- User-switchable flat 2D and immersive 3D views.
- Include both pinned upstream projects' complete existing feed catalogs and coverage descriptions, with news/geopolitics, transport and disruptions prioritized visually. Catalog completeness does not mean all providers are live: paid, unconfigured, restricted or unavailable feeds must remain discoverable with clear reasons.
- Event selection focuses a known location and opens a source-backed evidence panel while retaining dashboard context.
- Transparent recent/significant sorting and filters; no AI initially.
- One private user; zero additional monthly hosting, storage and API expense. Free-tier limits are accepted, but must be measured and disclosed.
- No M365 dependency. Optional future integration must not constrain the standalone product.
- Preserve the ability to receive upstream improvements. Do not blindly merge unrelated repositories. AGPL reuse is accepted in principle, subject to provenance, notices and exact terms review.

Bookmarks, personal notes, source links and recent event metadata where permitted are confirmed requirements. Exact retention, default map view and storage implementation remain open. The user accepts direct World Monitor code reuse and an open-source combined application complying with AGPL. Verify exact pinned licence terms and preserve MIT and third-party notices; publication still requires authorization.

## 2. Document hierarchy and correction of earlier advice

1. APPROVED-INTEGRATION-DIRECTION.md records the latest confirmed choices and supersedes conflicting earlier recommendations; PRODUCT-DECISIONS.md supplies compatible context.
2. This plan defines proposed execution and acceptance gates.
3. WORLDMONITOR-INSPIRED-SCOPE.md is conceptual background; its MIT-only preference and single-renderer recommendation are not user mandates.
4. OUR-PROJECT-NOTES.md contains historical observations, not a current test certificate.
5. M365-HOSTING-CONSTRAINTS.md is deferred background, not the hosting plan.

Important correction: `git merge --ff-only origin/main` works only while local main has no divergent custom history. Once our custom changes are merged, ordinary upstream integration generally requires a reviewed merge on a dedicated sync branch. Fast-forward refusal is not itself a conflict or broken repository.

## 3. Scope boundaries

### MVP target

- One coherent dashboard shell: source/layer controls, rectangular map, event feed and evidence panel.
- 2D/3D switch preserving selected event, filters and reasonable geographic context.
- Complete inventories from both pinned codebases, reconciled into a catalog with provider coverage, attribution, runtime requirements and capability status. Every entry has an adapter mapping or explicit disabled/unavailable reason; none is silently dropped.
- Visible source timestamps, attribution, health and failure states.
- Free/keyless map defaults; no billable fallback activated automatically.
- Bookmarks, personal notes, source links and permitted recent-event metadata, with export and a bounded retention policy chosen after source/storage review.
- Private authenticated cloud deployment only if the free-hosting acceptance gate passes.

### Not MVP

AI execution, paid-feed activation, geopolitical prediction, long-term global archive, vessel/aircraft historical replay, M365 integration, mobile-native clients, collaboration and billing. Paid feeds remain in the catalog but cannot make billable calls. Complete catalog coverage is required; complete worldwide live-data coverage is not promised.

## 4. Delivery strategy

Keep changes in small feature branches. First prove the risky assumptions, then the layout, then a real end-to-end event workflow. Add more sources only after the contracts and evidence UX work.

Two workstreams can proceed independently:

- **Product/UX:** preserve World Monitor's dashboard structure and validate in-pane God's Eye interaction with Raz, rather than inventing a replacement dashboard.
- **Technical feasibility:** pin and inspect both repositories, reproduce baselines, implement the accepted licensing posture, prove map-mode integration and free private hosting.

Direct World Monitor reuse is approved in principle under AGPL; exact provenance, licence and technical compatibility checks still precede imports. No unrelated-history merge, paid provider commitment or public deployment is implied. No calendar deadline is promised before spikes establish effort. At each gate report completed acceptance criteria, evidence, blockers and the next bounded scope.

## 5. Milestones and acceptance gates

**Status at 2026-09-11:** M0 **Partial**; M1 **Experimental**; M2 **Experimental**; M3–M6 **Incomplete**. Experimental work is not merged/deployed. Release acceptance remains blocked by 3D border/texture alignment and poor default UX. Earlier scoped checks are historical evidence only, not whole-suite proof.

| ID | Deliverable | Dependencies | Acceptance |
| --- | --- | --- | --- |
| M0 | Two-repository baseline, full inventory, compliance and hosting feasibility | None | **Partial.** Remaining evidence includes complete reconciliation and zero-cost private backend feasibility. |
| M1 | World Monitor-based dashboard integration prototype | Product requirements; may run alongside M0 | **Experimental.** Code exists in the temporary discovery directory only; not merged/deployed. Default UX remains poor. |
| M2 | Application shell and map integration | M0 technical gates; M1 UX approval | **Experimental.** Same-pane 2D/3D direction is exercised, but 3D border/texture alignment remains an acceptance blocker. |
| M3 | Real event-to-evidence vertical slice | M2; one approved source | **Incomplete.** Real provider response → validated adapter → event list/map → evidence panel; source links and freshness visible; outage/empty/stale behavior tested. |
| M4 | Complete catalog and saved work | M3; individual source checks | Programmatic reconciliation accounts for every pinned feed from both projects; each has an adapter or explicit restriction reason. Test active providers and disabled zero-request behavior. Bookmarks, notes, links, permitted recent metadata and export work. |
| M5 | Private free-tier deployment candidate | M4; M0 hosting proof | Unauthorized UI/API requests denied; no secrets in client bundle; no billing-enabled services; provider calls and persistence work on actual host; cold starts, quota exhaustion and streaming limits tested. |
| M6 | User acceptance and release handover | M5 | Raz completes acceptance scenarios; no unresolved release-blocking defects; exact version and rollback artifacts recorded; operations runbook complete. |

If M0 cannot satisfy the free private-hosting requirement, stop that workstream and present a measured reduced-capability option. Do not silently substitute paid hosting, public unauthenticated access or always-on local infrastructure.

## 6. Proposed architecture (subject to M0)

```text
World Monitor-based browser dashboard
  ├─ Workspace state: map mode, selection, filters, layout
  ├─ Map bridge: existing 2D view ↔ God's Eye/Cesium 3D in the same pane
  ├─ Event list and evidence panel
  └─ Saved-work UI
           │ authenticated requests
Application API / provider adapters
  ├─ Credential handling and strict source allowlists
  ├─ Normalization, deduplication, health and freshness
  ├─ Bounded cache, retries and quota controls
  └─ Approved persistence/export
           │
Approved source APIs and feeds
```

- Prefer World Monitor as the shell, subject to code inspection; isolate God's Eye's Cesium integration rather than porting the entire dashboard into its large UI module. Record a repository/layout architecture decision before creating or relocating implementation repositories.
- Compare keeping World Monitor's existing 2D renderer with a Cesium-only alternative against actual compatibility and maintenance costs. Do not assume either one or two engines is mandatory. Mount/activate only the needed heavy renderer; test cleanup, memory and GPU resource release across repeated switches. Document unsupported layer/view combinations honestly.
- Keep dashboard components separate from the large existing UI module through narrow interfaces.
- Centralize selection and filtering so list and map do not maintain conflicting state.
- Separate data acquisition from rendering. Do not duplicate AIS or other upstream subscriptions for each panel.
- Extract reusable API handlers from development-only Vite middleware where needed. A static build does not include the existing server proxies.
- Free serverless products may not support long-lived AIS connections. Test actual connection/runtime limits. Slower refreshes or unavailable feeds are accepted under the confirmed zero-cost priority; record limitations and never label old snapshots live. No forced always-on local backend.

### Event and health contracts

Document stable event ID, source ID, title, domain, observed/published/fetched times, source URL, geometry and location certainty. Preserve source-provided severity separately from application sorting priority. Do not invent numerical confidence without a methodology.

Keep transport health distinct from content: fresh/stale/degraded/unavailable plus whether a successful response is empty. Source failure never means no events. Regional headlines without reliable coordinates stay in the feed instead of acquiring a fabricated map pin.

## 7. Source and licence management

Maintain a source inventory with provider, exact documentation/terms links, auth requirement, quotas, CORS/backend needs, refresh cadence, retention/redistribution rules, attribution, cost controls and supported domain/region.

The chosen path permits World Monitor code reuse with AGPL compliance for the combined open-source application. Verify exact licence wording at the pinned revisions, retain God's Eye MIT and other notices, and prepare corresponding-source/build instructions and a source offer for applicable distribution/network use. Hosted API access and third-party data/assets require separate rights checks. Seek clarification or legal advice for uncertain obligations; the user's AGPL acceptance does not waive provider terms.

Catalog discovery must enumerate runtime registrations, configuration variants, documented sources and backend providers from both repositories. Distinguish a feed from a layer, endpoint, preset and duplicate provider. Preserve both origin mappings when deduplicating. Store the inventory in a machine-readable artifact with upstream SHAs and evidence paths. Reconcile source counts, mappings and exclusions programmatically; do not declare completeness from a sampled README list.

Zero-cost policy: disable billable providers by default; hard-limit requests/storage; never rely solely on billing alerts as a cap. Existing local Google and TomTom keys are not authority to activate those services in a cloud deployment. Never copy local secrets into code, documentation, screenshots or logs.

## 8. Testing and quality gates

### Baseline

For each pinned repository, inspect its manifest and contributor instructions, record SHA/runtime/lockfile and run the supported checks. God's Eye's known entry commands are `npm test` and `npm run build`; discover World Monitor's actual commands rather than assuming parity. Previous conversational test counts must be reproduced before treating them as known failures. Preserve redacted evidence; do not fix unrelated upstream failures merely to make a gate look clean.

### Automated checks

- Unit: adapters, event identity/dedupe, filters/sorting, health and timestamps, state persistence and schema migration.
- Integration: allowed upstream hosts, timeouts, invalid/oversized payloads, cache expiry, stale fallback, authorization and request budgets.
- Browser: map/list selection, 2D/3D switching, panel resize, keyboard navigation, reload state, attribution and empty/error states.
- Existing regression gates: `npm run test:track` and `npm run qa:map-source-tray` where affected, with the required dev server running. Inspect their requirements before execution.
- Security: dependency advisories with exposure assessment; no secrets in generated frontend assets; no unauthenticated proxy usage; no arbitrary URL fetches.
- Performance: measure startup, interaction responsiveness, memory and rendering on the target browser at normal and dense source loads; establish measured budgets before claiming performance gains.

Test fixtures are permitted and must be labelled fixtures. Live verification must use actual provider responses. Mock-backed passing tests do not establish source availability or hosting compatibility.

### Definition of done for a feature

Requirements and acceptance cases recorded; focused implementation; tests and build exercised; no new unexplained regressions; affected UI checked; source/secret/cost review complete; relevant docs updated; independent review for substantial changes; evidence and known limitations attached. No commit or push without user authorization.

## 9. Project management workflow

Use one work-item list in this plan initially. GitHub Issues/Projects can be introduced when Raz authorizes remote project setup; do not create a separate board automatically.

Statuses: Backlog → Ready → In progress → Review → Accepted, with Blocked carrying a reason and next decision. Keep one implementation item active per working tree. Parallel work must use isolated branches/worktrees and explicit file ownership.

Every work item contains:

- ID, title, user benefit, owner and reviewer
- Included/excluded scope and dependencies
- Acceptance criteria and verification commands
- Licence, data, security and cost considerations
- Evidence locations, known limitations and rollback path

Roles:

- **Raz:** product priorities, prototype acceptance, licence/deployment decisions and authorization to publish.
- **Hermes:** discovery, proposal, bounded implementation, verification and project documentation.
- **Independent reviewer:** evaluate substantial diffs and risks before release; do not claim independence for self-review.

Progress reports: what changed, what was verified, what is blocked, what decision is needed. Update after each milestone or interruption; do not promise untested percentages or speculative dates.

### Change control

Record requests against PRODUCT-DECISIONS.md. Classify each as MVP, later, or blocked; describe cost and upstream-maintenance impact. Approval of one feature does not authorize broad refactoring, new infrastructure, copied licensed code or public deployment.

## 10. Initial backlog

All items below are planned, not completed.

| ID | Work item | Milestone | Dependency |
| --- | --- | --- | --- |
| DEV-01 | Pin both upstreams; reproduce baselines and inspect shell/map/backend seams | M0 | None |
| DEV-02 | Complete both feed inventories; reconcile counts and record accepted AGPL compliance tasks | M0 | DEV-01 |
| DEV-03 | Prove private zero-cost hosting, proxy and AIS feasibility | M0 | DEV-01 |
| UX-01 | Prototype World Monitor dashboard with God's Eye in-pane 3D and evidence workflow | M1 | Confirmed requirements; inspected World Monitor UI |
| DEV-04 | Spike map bridge, lifecycle, 2D/3D compatibility and shared state | M0/M2 | DEV-01 |
| DEV-05 | Integrate World Monitor shell and God's Eye renderer with shared selection | M2 | UX-01 approval; DEV-04; licence checklist |
| DEV-06 | Implement source-health contract and existing-source vertical slice | M3 | DEV-02, DEV-05 |
| DEV-07 | Account for every catalog feed with active adapter or explicit unavailable/paid/restricted state | M4 | DEV-02, DEV-06 |
| DEV-08 | Implement approved bookmarks, notes and retention/export | M4 | Retention decision; DEV-06 |
| OPS-01 | Deploy restricted free-tier candidate and verify failure limits | M5 | DEV-03, M4 |
| QA-01 | User acceptance, regression evidence and release runbook | M6 | OPS-01 |

## 11. Git and upstream maintenance

Current remote convention: `origin` is bilawalsidhu/gods-eye-view; `fork` is Cossackx/gods-eye-view. Verify with `git remote -v` every session before acting. A fresh clone may use different names.

- Keep `main` as the accepted version; feature branches are `feat/<topic>`, fixes `fix/<topic>`, and sync work `sync/upstream-<identifier>`.
- Before edits inspect status; preserve unrelated/untracked work and ignored credential files. Never reset or force-push to simplify synchronization.
- Keep custom dashboard modules and integration seams small to reduce upstream conflict risk.
- For upstream updates: fetch both remotes; start a sync branch from current accepted fork main; inspect incoming changes; merge official main on that branch if needed; resolve conflicts, run gates, review and obtain approval before merging/pushing to the fork.
- Do not use `--allow-unrelated-histories` to combine World Monitor and God's Eye.
- Track both upstream revisions separately. Prefer normal reviewed merges for the chosen shell's fork; manage God's Eye integrations as a versioned module/vendor/subtree boundary selected in an architecture decision. Record file provenance, local patches and update tests. Do not assume a World Monitor merge updates God's Eye code or vice versa. Exercise an update rehearsal before release.

## 12. Release, operations and rollback

Before release record exact source revision, dependency lockfile, build artifact, deployment configuration (no secrets), data schema version and known limitations. Publish only on explicit approval.

Rollback must restore the prior compatible artifact/configuration; persistent data changes need a backup/export and backwards-compatible migration or explicit recovery procedure. Verify rollback in the selected environment before relying on it.

Runbook must document: start/build/test, deploy/rollback, auth configuration, provider secret rotation, source outage diagnostics, free-tier quota monitoring, retention cleanup and export/restore. Never present an inaccessible source as healthy or silently upgrade to a paid service.

Operational cadence: check health during use; review quotas before adding sources or enabling background ingestion; review security advisories and upstream changes before each release. Scheduled automation is a separate approved work item, not implicitly enabled by this plan.

## 13. User acceptance scenarios

1. Open the private URL; unauthorized users cannot obtain dashboard data or spend provider quota.
2. Understand latest/significant developments from multiple panels without navigating hidden controls.
3. Filter by domain/region; map and feed agree on what is included.
4. Select an event; see source, timestamps and evidence; locate it only if location is supported.
5. Switch between 2D and 3D without losing investigation state; incompatible layers are explained.
6. See a provider outage, empty response and stale cache represented differently.
7. Save and restore approved bookmarks/notes; export them before deletion or migration.
8. Stay within zero-cost service limits; unsupported continuous feeds are explicitly identified.
9. Find every source in both pinned catalogs, including disabled/paid/restricted feeds; understand why each unavailable source is not running.
10. View God's Eye 3D inside the dashboard map pane while other panels remain visible; return to 2D with selection and filters retained.
11. Access applicable source/licence notices and corresponding-source offer for the exact released revision without exposing private user data or credentials.

## 14. Next authorized work

This task revises documentation only. Next proposed execution package is a cheap, bounded set of DEV-01/DEV-02/DEV-03/DEV-04 and UX-01, ordered by dependencies. Do not treat child self-reports as verified runtime facts. Hosting, data rights, privacy, 3D alignment and default-UX gates remain mandatory before deployment.
