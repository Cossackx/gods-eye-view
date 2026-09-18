# M365 hosting constraints — rejected/deferred historical analysis

> [!important] Historical/reference copy — routing updated 2026-09-12
> Our combined product is **RAZ Fusion Center**. Current plans, decisions and status live in [the canonical project index](../../raz-fusion-center/docs/project/README.md) and [current status](../../raz-fusion-center/docs/project/PROJECT-STATUS.md), under `C:/Users/aleks/Projects/raz-fusion-center`. Published product repository: https://github.com/Cossackx/raz-fusion-center (private).
> The dated statements below describe the earlier project/fork; they do not override current publication, renderer, optional free-only AI or runtime decisions. This God's Eye View checkout remains an upstream reference/rollback copy, not the active product home. Current app address: http://127.0.0.1:4195/dashboard; an app restart does not establish AIS/aircraft relay readiness.


**Reviewed:** 2026-09-11. Microsoft 365 is explicitly not part of the confirmed product direction. The selected product is a private standalone browser application with no SharePoint, Teams, OneDrive or Power Automate dependency. This file preserves the earlier M365 analysis for history only; no tenant discovery, provisioning or deployment was authorized or performed.

The zero additional monthly cost priority remains confirmed, but it does not mean M365 is preferred. Paid services and hosted account flows are out of scope; unavailable or paid feeds must be explicit. See [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md), [APPROVED-INTEGRATION-DIRECTION.md](APPROVED-INTEGRATION-DIRECTION.md), and the future canonical [PROJECT-STATUS.md](../PROJECT-STATUS.md).

## Candidate architecture, conditional on organizational approval

- SharePoint Framework (SPFx) client application for the dashboard, potentially surfaced in Teams. SharePoint can host SPFx assets without a separate Azure hosting service.
- Restricted SharePoint site/list permissions for bookmarks, watchlists, saved investigations and modest event metadata. Do not assume individual privacy from tenant administrators or organizational retention/eDiscovery.
- Document library for exports and supporting files. OneDrive is not a Node application server.
- Power Automate only for approved tasks supported by existing entitlements and quotas. Do not assume generic HTTP/custom connectors are included or use it as a continuous AIS websocket relay.
- External backend remains an unresolved dependency for private API-key handling, CORS-restricted feeds and persistent AIS ingestion. The existing Vite proxy/server cannot run inside SharePoint/OneDrive. Never move server secrets into an SPFx browser bundle to avoid this limitation.
- Free-tier external backend is an option only with employer approval and verified authentication, quotas, runtime limits and data policies. No always-on feed availability promised.
- Default to no billable provider routes. Existing Google/TomTom key configuration does not prove zero cost; quotas/terms must be validated or those providers disabled for the zero-cost deployment.

## Historical next gate — not current work

The former next gate was to ask a tenant administrator about SPFx, Teams, external feeds and free-tier backends. That gate is superseded by the standalone/no-M365 decision. Do not pursue tenant access or M365 deployment unless the product decision is explicitly changed.

## Microsoft reference

https://learn.microsoft.com/en-us/sharepoint/dev/spfx/integrate-with-teams-introduction
https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/tabs-in-sharepoint

Microsoft documents SPFx hosting and Teams integration; this establishes product capability, not approval or availability in this particular tenant.
