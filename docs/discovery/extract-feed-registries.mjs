#!/usr/bin/env node
/**
 * Extract World Monitor's client/server feed registries without importing App,
 * Vite, or any environment loader. Run with the pinned checkout as the cwd:
 *
 *   npx tsx C:/Users/aleks/Projects/gods-eye-view/docs/discovery/extract-feed-registries.mjs \
 *     --worldmonitor C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery
 *
 * The source modules are parsed with the TypeScript compiler and a deliberately
 * small evaluator; no browser/runtime module, App, Vite, or environment loader
 * is executed. The output keeps raw feed objects and provenance instead of
 * flattening multilingual URL objects or deduplicating away declarations.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const DEFAULT_WORLD_MONITOR = 'C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery';
const DEFAULT_OUT = new URL('.', import.meta.url).pathname.replace(/^\/+([A-Za-z]):\//, '$1:/');

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function assertDir(path, label) {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function flattenUrls(url, path = []) {
  if (typeof url === 'string') return [{ language: path.at(-1) ?? null, url }];
  if (!url || typeof url !== 'object') return [];
  return Object.entries(url).flatMap(([language, child]) => flattenUrls(child, [...path, language]));
}

function rowsFromMap(map, catalog, mapName) {
  return Object.entries(map ?? {}).flatMap(([category, feeds]) => (Array.isArray(feeds) ? feeds : []).map((feed, index) => ({
    catalog,
    map: mapName,
    category,
    index,
    name: feed?.name ?? null,
    lang: feed?.lang ?? null,
    metadata: clone(feed ?? {}),
    urls: flattenUrls(feed?.url),
  })));
}

function providerHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function sourceStats(manifest) {
  const entries = Array.isArray(manifest?.entries) ? manifest.entries : [];
  const statusCounts = Object.fromEntries(['excluded', 'terms-review', 'reviewed'].map((status) => [
    status,
    entries.filter((entry) => entry?.status === status).length,
  ]));
  const nonexcluded = entries.filter((entry) => entry?.status !== 'excluded');
  const active = entries.filter((entry) => entry?.observed === true && entry?.catalogActive !== false
    && (entry?.status === 'terms-review' || entry?.status === 'reviewed'));
  return {
    rawRows: entries.length,
    statusCounts,
    nonexcludedUniqueHosts: new Set(nonexcluded.map((entry) => entry.host)).size,
    nonexcludedProviderLabels: new Set(nonexcluded.map((entry) => entry.provider)).size,
    reportedCatalogActiveHosts: active.length,
    excludedByCatalogActiveFalse: entries.filter((entry) => entry?.catalogActive === false).map((entry) => ({
      host: entry.host,
      provider: entry.provider,
      status: entry.status,
      references: entry.references ?? [],
    })),
    logicalEntries: clone(manifest?.logicalEntries ?? []),
    logicalProviders: clone(manifest?.logicalProviders ?? []),
  };
}

function propertyName(node, ts) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isComputedPropertyName(node) && ts.isStringLiteral(node.expression)) return node.expression.text;
  throw new Error(`unsupported computed/property name at ${node.getStart()}`);
}

function unwrap(node, ts) {
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)
    || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)
    || ts.isSatisfiesExpression?.(node)) node = node.expression;
  return node;
}

function extractStaticModule(filePath, wantedExports, worldMonitor) {
  const requireFromWorldMonitor = createRequire(join(worldMonitor, 'package.json'));
  let ts;
  try {
    ts = requireFromWorldMonitor('typescript');
  } catch (error) {
    throw new Error(`TypeScript is required from the World Monitor checkout (${join(worldMonitor, 'node_modules', 'typescript')}): ${error.message}`, { cause: error });
  }
  const source = ts.createSourceFile(filePath, readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declarations = new Map();
  for (const statement of source.statements) {
    const declaration = ts.isVariableStatement(statement) ? statement.declarationList.declarations : [];
    for (const item of declaration) if (ts.isIdentifier(item.name)) declarations.set(item.name.text, item.initializer);
  }

  const encode = (value) => encodeURIComponent(value);
  const builtins = {
    SITE_VARIANT: 'full',
    rssProxyUrl: (url) => `/api/rss-proxy?url=${encode(url)}`,
    rss: (url) => `/api/rss-proxy?url=${encode(url)}`,
    railwayRss: (url) => `/api/rss-proxy?url=${encode(url)}`,
    gn: (query) => `https://news.google.com/rss/search?q=${encode(query)}&hl=en-US&gl=US&ceid=US:en`,
    gnLocale: (query, hl, gl, ceid) => `https://news.google.com/rss/search?q=${encode(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`,
  };
  const resolving = new Set();
  const evaluate = (rawNode) => {
    const node = unwrap(rawNode, ts);
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isTemplateExpression(node)) {
      return node.head.text + node.templateSpans.map((span) => String(evaluate(span.expression)) + span.literal.text).join('');
    }
    if (ts.isIdentifier(node)) {
      if (Object.hasOwn(builtins, node.text)) return builtins[node.text];
      if (!declarations.has(node.text)) throw new Error(`unresolved identifier ${node.text} in ${filePath}`);
      if (resolving.has(node.text)) throw new Error(`cyclic declaration ${node.text} in ${filePath}`);
      resolving.add(node.text);
      const value = evaluate(declarations.get(node.text));
      resolving.delete(node.text);
      return value;
    }
    if (ts.isArrayLiteralExpression(node)) {
      return node.elements.flatMap((element) => {
        if (ts.isSpreadElement(element)) {
          const value = evaluate(element.expression);
          if (!Array.isArray(value)) throw new Error(`spread is not an array in ${filePath}`);
          return value;
        }
        return [evaluate(element)];
      });
    }
    if (ts.isObjectLiteralExpression(node)) {
      const result = {};
      for (const element of node.properties) {
        if (ts.isSpreadAssignment(element)) Object.assign(result, evaluate(element.expression));
        else if (ts.isPropertyAssignment(element)) result[propertyName(element.name, ts)] = evaluate(element.initializer);
        else if (ts.isShorthandPropertyAssignment(element)) result[element.name.text] = evaluate(element.name);
        else throw new Error(`unsupported object member in ${filePath} at ${element.getStart()}`);
      }
      return result;
    }
    if (ts.isConditionalExpression(node)) return evaluate(node.condition) ? evaluate(node.whenTrue) : evaluate(node.whenFalse);
    if (ts.isBinaryExpression(node) && (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
      || node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken)) {
      return evaluate(node.left) === evaluate(node.right);
    }
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression, ts);
      const name = ts.isIdentifier(callee) ? callee.text : null;
      if (name === 'mergeCanonicalFeeds') {
        const maps = evaluate(node.arguments[0]);
        const merged = {};
        for (const map of maps) for (const [category, feeds] of Object.entries(map ?? {})) {
          const bucket = merged[category] ?? (merged[category] = []);
          const seen = new Set(bucket.map((feed) => typeof feed.url === 'string' ? feed.url : JSON.stringify(feed.url)));
          for (const feed of feeds ?? []) {
            const key = typeof feed.url === 'string' ? feed.url : JSON.stringify(feed.url);
            if (!seen.has(key)) { bucket.push(feed); seen.add(key); }
          }
        }
        return merged;
      }
      const fn = name && builtins[name];
      if (typeof fn !== 'function') throw new Error(`unsupported call ${name ?? '<expression>'} in ${filePath}`);
      return fn(...node.arguments.map(evaluate));
    }
    throw new Error(`unsupported AST expression ${ts.SyntaxKind[node.kind]} in ${filePath} at ${node.getStart()}`);
  };
  return Object.fromEntries(wantedExports.map((name) => {
    if (!declarations.has(name)) throw new Error(`missing export declaration ${name} in ${filePath}`);
    return [name, evaluate(declarations.get(name))];
  }));
}

async function importRegistries(worldMonitor) {
  const clientPath = join(worldMonitor, 'src/config/feeds.ts');
  const serverPath = join(worldMonitor, 'server/worldmonitor/news/v1/_feeds.ts');
  assertDir(clientPath, 'client feed module');
  assertDir(serverPath, 'server feed module');
  // Do not execute either module: feeds.ts imports browser/runtime code whose
  // import.meta.env access is meaningful only inside Vite. The declarations are
  // intentionally static; evaluate that small AST subset instead, with the
  // production web proxy and full variant made explicit.
  const client = extractStaticModule(clientPath,
    ['FULL_FEEDS', 'CANONICAL_FEEDS', 'ON_DEMAND_FEEDS', 'FEEDS', 'INTEL_SOURCES'], worldMonitor);
  const server = extractStaticModule(serverPath, ['VARIANT_FEEDS'], worldMonitor);
  return { client, server };
}

async function main() {
  const worldMonitor = resolve(arg('--worldmonitor', DEFAULT_WORLD_MONITOR));
  const outDir = resolve(arg('--out-dir', DEFAULT_OUT));
  assertDir(worldMonitor, 'World Monitor checkout');
  const { client, server } = await importRegistries(worldMonitor);
  const manifestPath = join(worldMonitor, 'shared/source-attribution-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  const clientMaps = {
    FULL_FEEDS: client.FULL_FEEDS,
    CANONICAL_FEEDS: client.CANONICAL_FEEDS,
    ON_DEMAND_FEEDS: client.ON_DEMAND_FEEDS,
    FEEDS_active_variant: client.FEEDS,
  };
  const clientRows = Object.entries(clientMaps).flatMap(([name, map]) => rowsFromMap(map, 'client', name));
  const intelRows = (Array.isArray(client.INTEL_SOURCES) ? client.INTEL_SOURCES : []).map((feed, index) => ({
    catalog: 'client', map: 'INTEL_SOURCES', category: 'intel', index,
    name: feed?.name ?? null, lang: feed?.lang ?? null, metadata: clone(feed ?? {}), urls: flattenUrls(feed?.url),
  }));
  const serverRows = Object.entries(server.VARIANT_FEEDS ?? {}).flatMap(([variant, categories]) =>
    rowsFromMap(categories, 'server', `VARIANT_FEEDS.${variant}`));
  for (const row of serverRows) row.variant = row.map.slice('VARIANT_FEEDS.'.length);

  const output = {
    schemaVersion: 1,
    generatedBy: 'docs/discovery/extract-feed-registries.mjs',
    upstream: {
      checkout: worldMonitor,
      commit: 'd906869231970005ab3e108ff5321f179e8b7457',
      sourceModules: ['src/config/feeds.ts', 'server/worldmonitor/news/v1/_feeds.ts'],
      sourceAttributionManifest: 'shared/source-attribution-manifest.json',
    },
    importSurface: {
      clientExports: ['FULL_FEEDS', 'CANONICAL_FEEDS', 'ON_DEMAND_FEEDS', 'FEEDS', 'INTEL_SOURCES'],
      serverExports: ['VARIANT_FEEDS'],
      intentionallyNotImported: ['App', 'src/config/index.ts', '.env', 'variant barrels'],
    },
    sourceAttribution: sourceStats(manifest),
    client: { maps: clientMaps, rows: [...clientRows, ...intelRows] },
    server: { variants: server.VARIANT_FEEDS, rows: serverRows },
    derived: {
      clientRowCount: clientRows.length + intelRows.length,
      serverRowCount: serverRows.length,
      clientUrlCount: [...clientRows, ...intelRows].reduce((n, row) => n + row.urls.length, 0),
      serverUrlCount: serverRows.reduce((n, row) => n + row.urls.length, 0),
      serverHosts: [...new Set(serverRows.flatMap((row) => row.urls.map((item) => providerHost(item.url)).filter(Boolean)))].sort(),
      note: 'Client URL values are preserved exactly as exported, including proxy URLs; each row also retains its complete raw metadata and provenance. Server rows preserve variant/category/index and multilingual URL leaves when present.',
    },
  };

  mkdirSync(outDir, { recursive: true });
  const outputPath = join(outDir, 'worldmonitor-feed-registries.json');
  const reconciliationPath = join(outDir, 'worldmonitor-source-host-reconciliation.json');
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  writeFileSync(reconciliationPath, `${JSON.stringify({
    schemaVersion: 1,
    upstream: output.upstream,
    ...output.sourceAttribution,
    explanation: 'The 762 nonexcluded host figure counts every row whose status is not excluded. The 761 catalog-active figure additionally requires observed=true, catalogActive !== false, and a credit-bearing status (terms-review or reviewed). The sole difference is the explicitly reviewed-but-disabled GTA Update row.',
  }, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, reconciliationPath, ...output.derived, sourceAttribution: output.sourceAttribution }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
