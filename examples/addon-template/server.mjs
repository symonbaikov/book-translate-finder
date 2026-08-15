#!/usr/bin/env node
/**
 * A complete Golden Library addon in one file, with no dependencies.
 *
 * This is **documentation, not a source**. It serves two hard-coded public domain books so that the
 * protocol is visible end to end; it is not shipped with the application, not listed anywhere in it,
 * and not installed by default. Replace the three handlers with whatever you are integrating.
 *
 *   node examples/addon-template/server.mjs
 *   pnpm addon:validate http://localhost:4300/manifest.json
 *
 * Then paste http://localhost:4300/manifest.json into the app's Addons page.
 *
 * The protocol is specified in docs/addon-protocol.md. Where this file and that document disagree,
 * the document is right.
 */

import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 4300);

const MANIFEST = {
  id: 'addon-template',
  version: '1.0.0',
  name: 'Addon Template',
  description: 'A worked example of the Golden Library addon protocol.',
  apiVersion: 1,
  resources: ['catalog', 'meta', 'source'],
  types: ['book'],
  catalogs: [{ type: 'book', id: 'all', name: 'All books', extra: [{ name: 'search' }] }],
  // Say which ids you understand and the engine will not ask you about books you cannot answer for.
  // Omit it entirely to be asked about everything.
  idPrefixes: ['tmpl'],
  homepage: 'https://github.com/symonbaikov/golden-library',
};

/** Whatever your source actually is, this is the shape it has to end up in. */
const BOOKS = [
  {
    id: 'tmpl:frankenstein',
    type: 'book',
    name: 'Frankenstein',
    authors: ['Mary Shelley'],
    releaseInfo: '1818',
    description: 'Replace this with a description from your own source.',
    sources: [
      {
        name: 'Project Gutenberg',
        title: 'EPUB',
        url: 'https://www.gutenberg.org/ebooks/84.epub3.images',
        format: 'epub',
      },
    ],
  },
  {
    id: 'tmpl:dracula',
    type: 'book',
    name: 'Dracula',
    authors: ['Bram Stoker'],
    releaseInfo: '1897',
    sources: [
      {
        name: 'Project Gutenberg',
        title: 'EPUB',
        url: 'https://www.gutenberg.org/ebooks/345.epub3.images',
        format: 'epub',
      },
    ],
  },
];

/** `{ metas: [...] }` — the list views are built on this. */
function catalog(extra) {
  const search = (extra.search ?? '').toLowerCase();
  const matched = search ? BOOKS.filter((book) => book.name.toLowerCase().includes(search)) : BOOKS;
  return {
    metas: matched.slice(Number(extra.skip ?? 0)).map(({ sources: _sources, ...meta }) => meta),
  };
}

/** `{ meta: {...} }` — one book, everything you know about it. */
function meta(id) {
  const book = BOOKS.find((candidate) => candidate.id === id);
  if (!book) return null;
  const { sources: _sources, ...rest } = book;
  return { meta: rest };
}

/** `{ sources: [...] }` — how to actually get it. Stremio calls this `stream`. */
function sources(id) {
  const book = BOOKS.find((candidate) => candidate.id === id);
  return book ? { sources: book.sources } : { sources: [] };
}

/**
 * `search=dune&skip=20` — one path segment, values percent-encoded. Splitting it is the only fiddly
 * part of implementing this protocol, so here it is in full.
 */
function parseExtra(segment) {
  const extra = {};
  if (!segment) return extra;
  for (const pair of decodeURIComponent(segment).split('&')) {
    const index = pair.indexOf('=');
    if (index > 0) extra[pair.slice(0, index)] = pair.slice(index + 1);
  }
  return extra;
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  const parts = url.pathname
    .replace(/\.json$/, '')
    .split('/')
    .filter(Boolean);

  // Without this header a browser will make the request and then refuse to let the addon read the
  // answer. It is the single most common reason a new HTTP addon appears to do nothing.
  const send = (status, body) => {
    response.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=60',
    });
    response.end(JSON.stringify(body));
  };

  if (parts[0] === 'manifest') return send(200, MANIFEST);

  const [resource, type, id, extraSegment] = parts;
  if (type !== 'book') return send(404, { error: 'unknown type' });

  if (resource === 'catalog') return send(200, catalog(parseExtra(extraSegment)));
  if (resource === 'meta') {
    const found = meta(decodeURIComponent(id ?? ''));
    return found ? send(200, found) : send(404, { error: 'unknown book' });
  }
  if (resource === 'source') return send(200, sources(decodeURIComponent(id ?? '')));

  return send(404, { error: 'unknown resource' });
}).listen(PORT, () => {
  console.log(`Addon template listening on http://localhost:${PORT}/manifest.json`);
});
