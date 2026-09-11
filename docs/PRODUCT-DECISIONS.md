# Merged workspace — user product decisions

Status: Current direction and status reviewed 2026-09-11. These decisions supersede conflicting older recommendations in WORLDMONITOR-INSPIRED-SCOPE.md. Experimental implementation exists outside this repository; it is not merged or deployed. See the future canonical status page [PROJECT-STATUS.md](../PROJECT-STATUS.md) and the repository index [README.md](../README.md).

## Confirmed

- Primary job: scan global developments, then investigate what interests the user.
- Default UI: balanced dashboard with rectangular map and several information panels; not the circular eye layout.
- Initial domains: news/geopolitical developments/regional briefings; aircraft/ships/ports/transport; conflicts/disasters/fires/weather/disruptions.
- Map interaction: user can switch between a flat 2D overview and immersive 3D globe in the same map pane, while dashboard panels and investigation state remain available. The World Monitor dashboard shell is the selected base direction.
- Audience/deployment: the user alone, private standalone browser application. No Microsoft 365 dependency: SharePoint, Teams, OneDrive and Power Automate are not hosting or runtime dependencies. No hosted-account or promotional CTA is part of the product. Hosting/private access remains unverified and subordinate to the zero-cost priority.
- Event selection: retain the dashboard, focus the map, and open an evidence panel. Events with uncertain/no coordinates must not receive fabricated precise locations.
- Prioritization: transparent mix of latest events and significant developments, with filters.
- AI: none initially. Prioritize dashboard and real data.
- Budget: zero additional monthly cost for hosting, storage and APIs, accepting free-tier limits. Paid or unavailable providers may appear in the catalog but must be explicit and disabled; never activate billing or silently imply availability.
- Licensing: AGPL reuse of World Monitor code is accepted in principle, with AGPL compliance, preserved God's Eye MIT attribution and third-party notices, and separate data/API terms review.
- Saved work: personal saved notes, bookmarks and source links are in scope, with bounded retention/export to be defined.
- Execution: implementation work should be cheap and bounded; child tasks must have explicit scope and evidence requirements.

## Current status — 2026-09-11

- The intended product is a World Monitor dashboard shell with God's Eye's 2D/3D experience in the same pane, not a scoping-only concept.
- Experimental code exists at `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`; it has not been merged into this repository and has not been deployed.
- Acceptance is blocked by unresolved 3D border/texture alignment and poor default UX.
- A higher-resolution Iran NaturalEarth50m candidate was tested only by parent request interception: visually promising in 2D, failed in 3D, and was **not deployed**. Winding/global-fill and CSS opaque-black fixes are narrower experiments, not evidence of all-border success.
- Earlier test passes and prior Google/AIS/TomTom local verification remain historical, scoped evidence only. They are not a whole-suite result or a promise that credentials are currently valid.

## History — proposed interpretation, not yet confirmed

The user wants a mixture of live information/bookmarks and recent event history/saved investigations but requested an explanation of the difference.

Proposed MVP: live dashboard, recent event list, bookmarks, saved investigation notes and source links; no historical aircraft/vessel replay, no long-term global archive. Retention period remains undecided. Free-feed retention and redistribution terms must be checked per source. Saving a source link is distinct from saving the article contents.

## Remaining decisions

- Free-tier hosting feasibility for authenticated access, secret-bearing proxy routes and AIS streaming. Do not promise continuous ingestion until exercised on the selected host.
- What recent event retention period is useful and permitted by sources?
- Which few panels should be visible simultaneously in the first prototype?
- Default map view, dashboard density, initial region and filtering behavior, subject to resolving the current UX blocker.
- Source selection/coverage, publication rights, authentication and hosting architecture.
- Exact pinned licence text, provenance, source-offer obligations and provider/data terms.

## Scope guard

Product direction is confirmed, but this document does not authorize publication, deployment, billable services, or an unrelated-history Git merge. Experimental code must be evaluated and merged only through an authorized, reviewed path. Preserve upstream-update options.

## Standalone product boundary

The user has selected a standalone web app rather than M365 integration. This supersedes M365-HOSTING-CONSTRAINTS.md; that document is retained as rejected/deferred historical analysis, not a current deployment option.

- Browser dashboard with rectangular map, 2D/3D switch, persistent layer controls and live event/evidence panels.
- Separate server-side handling of private credentials and feeds requiring a proxy; never expose secrets in frontend bundles.
- Existing local God’s Eye server is a development baseline, not the completed merged product or a verified cloud deployment.
- No Microsoft identity, Graph, SharePoint, Teams, OneDrive, Power Automate, premium connector or Azure service is required for the core product.
