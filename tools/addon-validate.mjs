#!/usr/bin/env node
/**
 * Checks an addon against the same schemas the engine uses, then actually asks it things.
 *
 * A schema check alone is worth little here: the manifests that fail one are the easy case, and the
 * bugs that cost an author a weekend are the other kind — a catalog that returns `results` instead
 * of `metas`, an id that stops matching once it is percent-encoded, a missing
 * `Access-Control-Allow-Origin` that makes a perfectly correct addon invisible in a browser. So this
 * walks the resources the manifest declares, using ids discovered from the addon's own catalog, and
 * prints what came back.
 *
 * It talks to the addon and to nothing else. No result is sent anywhere.
 *
 *   pnpm addon:validate https://addon.example/manifest.json
 */

import { installHttpAddon } from '@golden/addons';

const OK = '  ✓';
const BAD = '  ✗';
const NOTE = '  ·';

let failures = 0;

function fail(message) {
  failures += 1;
  console.log(`${BAD} ${message}`);
}

function describe(error) {
  return error instanceof Error ? error.message : String(error);
}

const manifestUrl = process.argv[2];
if (!manifestUrl) {
  console.error('Usage: pnpm addon:validate <manifest url>');
  process.exit(2);
}

console.log(`\nReading ${manifestUrl}\n`);

let addon;
try {
  addon = await installHttpAddon(manifestUrl);
} catch (error) {
  console.log(`${BAD} ${describe(error)}`);
  console.log('\nNothing else can be checked until the manifest reads.\n');
  process.exit(1);
}

const { manifest } = addon;
console.log(`${OK} ${manifest.name} ${manifest.version} (${manifest.id})`);
console.log(`${NOTE} answers: ${manifest.resources.join(', ')}`);
console.log(`${NOTE} types: ${manifest.types.join(', ')}`);
if (manifest.idPrefixes) console.log(`${NOTE} id prefixes: ${manifest.idPrefixes.join(', ')}`);

/**
 * Ids discovered from the addon's own catalogs, so `meta` and `source` are exercised with ids it
 * actually uses rather than ones invented here.
 */
const discovered = [];

if (manifest.resources.includes('catalog')) {
  console.log('\ncatalog');
  if (manifest.catalogs.length === 0) {
    fail('the manifest declares the catalog resource but lists no catalogs');
  }
  for (const catalog of manifest.catalogs) {
    const searchable = catalog.extra?.some((extra) => extra.name === 'search') ?? false;
    try {
      const result = await addon.getCatalog(catalog.type, catalog.id, {});
      console.log(`${OK} ${catalog.type}/${catalog.id}: ${result.metas.length} entries`);
      if (result.dropped > 0) {
        fail(
          `${result.dropped} entries in ${catalog.id} did not match BookMetaPreview and were dropped`,
        );
      }
      for (const meta of result.metas.slice(0, 3))
        discovered.push({ type: meta.type, id: meta.id });
    } catch (error) {
      fail(`${catalog.type}/${catalog.id}: ${describe(error)}`);
    }

    if (searchable) {
      try {
        const result = await addon.getCatalog(catalog.type, catalog.id, { search: 'the' });
        console.log(`${OK} ${catalog.type}/${catalog.id} with search=the: ${result.metas.length}`);
      } catch (error) {
        fail(`${catalog.type}/${catalog.id} with a search term: ${describe(error)}`);
      }
    } else {
      console.log(
        `${NOTE} ${catalog.id} declares no search extra, so it is skipped on the search page`,
      );
    }
  }
}

if (
  discovered.length === 0 &&
  (manifest.resources.includes('meta') || manifest.resources.includes('source'))
) {
  console.log(
    `\n${NOTE} No ids came back from a catalog, so meta and source cannot be exercised. Pass an id: pnpm addon:validate <url> <id>`,
  );
  const given = process.argv[3];
  if (given) discovered.push({ type: manifest.types[0], id: given });
}

if (manifest.resources.includes('meta')) {
  console.log('\nmeta');
  for (const { type, id } of discovered.slice(0, 3)) {
    try {
      const { meta } = await addon.getMeta(type, id);
      console.log(`${OK} ${id} → ${meta.name}`);
    } catch (error) {
      fail(`${id}: ${describe(error)}`);
    }
  }
}

if (manifest.resources.includes('source')) {
  console.log('\nsource');
  for (const { type, id } of discovered.slice(0, 3)) {
    try {
      const result = await addon.getSources(type, id);
      console.log(`${OK} ${id}: ${result.sources.length} sources`);
      if (result.dropped > 0) {
        // Overwhelmingly the scheme rule: an addon returning a `magnet:` or a bare path loses that
        // row silently in the app, and this is where an author finds out.
        fail(`${result.dropped} sources for ${id} were dropped — check the url scheme is http(s)`);
      }
    } catch (error) {
      fail(`${id}: ${describe(error)}`);
    }
  }
}

console.log('\nA note on what this cannot tell you');
console.log(
  `${NOTE} These requests came from Node, which ignores CORS. A browser will not. Make sure every`,
);
console.log(`${NOTE} response carries Access-Control-Allow-Origin, or readers will see nothing.`);

if (failures > 0) {
  console.log(`\n${failures} problem(s).\n`);
  process.exit(1);
}
console.log('\nNo problems found.\n');
