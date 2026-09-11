# WorldMonitor border-alignment discovery

> **Current-status context (2026-09-11):** See [../PROJECT-STATUS.md](../PROJECT-STATUS.md) for the consolidated status. Winding/global-tint and black SVG `rgba(hex)` fixes are recorded as addressed in the experimental checkout, but border correctness remains unresolved: the original large-displacement screenshots were never visually accepted; the naturalearth50m IR candidate preserves 605 points/IDs but political equivalence is unproven; the parent route-intercept 2D result was promising and 3D failed, and no candidate was applied. The diagonal feature near Afghanistan/Pakistan below is not evidence that Pakistan is a strip of Iran.

Date: 2026-09-11
Repository under test: `C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery`
Commit inspected: `d906869231970005ab3e108ff5321f179e8b7457`

## Result

No safe source-level fix was proven in the scoped boundary helpers. No arbitrary
translation or disputed-border policy change was made.

The supplied evidence confirms a visible country-polygon problem, but does not
uniquely distinguish a source-boundary mismatch from a renderer/projection or
polygon-tessellation problem. The exact pixels need a live render with the
polygon layer and basemap coordinates captured together.

## Evidence inspected

### Renderer paths and coordinate order

- `src/components/DeckGLMap.ts:1103-1112` constructs MapLibre with
  `center: [longitude, latitude]`, `zoom`, and `renderWorldCopies: false`.
  No explicit `projection` option is supplied; MapLibre therefore uses its
  default Web Mercator projection. DeckGL layers use `[lon, lat]` throughout,
  including the country GeoJSON layers at `:4717-4731` and conflict GeoJSON at
  `:2927-2939`.
- `src/components/Map.ts:1510-1527` uses D3 equirectangular for the SVG fallback,
  with the same `[lon, lat]` GeoJSON convention. Its country base is not the
  country geometry service: it loads `worldTopologyUrl()` and converts
  `countries-50m.json` (desktop) or `countries-110m.json` (mobile).
- `src/components/GlobeMap.ts:881-887` explicitly reads path points as
  `p[1] = latitude`, `p[0] = longitude`. Its polygon accessor at `:946-949`
  builds a GeoJSON Polygon from `coords` without swapping axes.
- `src/services/country-geometry.ts:63-69` also parses GeoJSON as
  `[longitude, latitude]`; hit-testing at `:328-349` passes `(lat, lon)` into
  functions that intentionally test `(lon, lat)`.

### Different geometry sources

There are at least three independent border datasets on the affected paths:

1. MapLibre vector-tile basemap selected by `src/config/basemap-styles.ts`.
2. SVG base topology: `public/data/countries-50m.json` or
   `public/data/countries-110m.json` via `src/config/geo-map.ts:2659-2661`.
3. Country service GeoJSON: `public/data/countries.geojson`, optionally replaced
   per-country by `https://maps.worldmonitor.app/country-boundary-overrides.geojson`
   in `src/services/country-geometry.ts:222-247, 282-291`.

The DeckGL conflict and choropleth overlays use source (3), while the visible
basemap borders use source (1). The SVG base uses source (2), while GlobeMap
conflict/CII polygons use source (3). These sources are not asserted to be the
same release, resolution, datum, or disputed-boundary policy. This is a
credible explanation for small boundary discrepancies, but it cannot explain
or rule out the large apparent spill seen in the second screenshot without a
rendered geometry dump.

### Ring transformation and antimeridian review

- GlobeMap reverses every ring for conflict polygons only
  (`src/components/GlobeMap.ts:2342-2349, 2357-2379`). Reversing point order
  changes winding, not longitude/latitude positions; it is not an offset.
  CII and scenario polygons are not reversed. A winding/tessellation interaction
  remains possible, but changing it blindly would alter polygon fill semantics
  and was not proven safe.
- `src/app/country-map-focus.ts:53-76` has an antimeridian-aware focus bbox. Its
  existing tests cover Russia, Fiji, and a contiguous country. This helper is
  not the renderer path that paints the red polygons.
- `src/components/map/conflict-zone-cull.ts:146-150` documents and preserves
  `[lon, lat]`; its culling deliberately renders all geometry when the viewport
  crosses the antimeridian. This can over-include, not shift, a country.

## Deterministic checks run

All commands were run from the repository above:

```text
node --import tsx --test tests/country-map-focus.test.mts
  5 passed, 0 failed

npx vitest run --config vitest.dom.config.mts tests/dom/deckgl-map-state.test.mts
  13 passed, 0 failed

npm run --silent lint:boundaries
  No architectural boundary violations found.
```

The country fixture's Iran feature was independently scanned numerically:

```text
ISO2=IR, Polygon, 57 positions
longitude range 44.061372..62.753564
latitude range 25.202094..39.685279
```

Those values are in the expected order and geographic range; they do not show a
lat/lon swap. The existing fixture test also proves the service's longitude
order and antimeridian focus behavior for bundled Russia.

## Visual evidence

- `C:/Users/aleks/AppData/Roaming/Hermes/composer-images/image_41902d.png`:
  3D globe view with a red Iran-shaped polygon over satellite imagery. The
  outline is recognizably Iran, but the apparent coast/texture separation is
  significant enough that a dataset mismatch or globe texture registration
  needs live coordinate measurement.
- `C:/Users/aleks/AppData/Roaming/Hermes/composer-images/image_884c01.png`:
  flat dark labelled map with several red/orange country fills. Iran is filled,
  Sudan and Yemen are also filled, and a narrow diagonal colored feature appears
  near the Afghanistan/Pakistan labels. Because multiple conflict polygons are
  present, this cannot be attributed to Iran without inspecting rendered layer
  object IDs and geometry.

An attempt to inspect `http://localhost:4187` with the browser harness timed out
(420 seconds) before page state was returned. No screenshot or DOM geometry from
the live app was therefore available.

## Commands needed from parent for a conclusive fix

Run the pinned UI on port 4187 (or provide an equivalent live tab), then capture
all of the following in the same viewport and zoom:

1. MapLibre `map.getProjection().name`, `map.getCenter()`, `map.getZoom()`,
   `map.getBounds()`, and the active style source/layer IDs for country borders.
2. DeckGL `conflict-zones-layer` and choropleth layer data after culling, including
   the exact Iran/Sudan/Yemen feature geometry and layer props.
3. GlobeMap `polygonsData()` for `_kind=conflict`/`cii`, including the exact
   `coords` passed to `polygonGeoJsonGeometry`, plus globe POV and canvas CSS
   width/height versus internal width/height.
4. A stable-region probe at known points (Tehran 35.6892, 51.3890; Bandar Abbas
   27.1832, 56.2666; Zahedan 29.4963, 60.8629) and a screenshot with the layer
   IDs/outline colors isolated. Compare the projected basemap boundary and
   overlay vertex coordinates, not screen pixels from separate renders.
5. Repeat with conflict polygons disabled, then CII/scenario polygons disabled,
   to determine whether the diagonal feature is a specific polygon/tessellation
   artifact or a global basemap registration issue.

Only after that capture should the parent choose between: aligning all renderers
to one authoritative geometry source, correcting a proven Globe polygon winding/
tessellation input, or fixing a proven projection/sizing mismatch. Do not apply
a global x/y offset or change political-border policy.
