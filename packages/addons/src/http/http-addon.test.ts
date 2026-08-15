import { describe, expect, it, vi } from 'vitest';
import { AddonManifestError, AddonResponseError, AddonTransportError } from '../errors.js';
import { ADDON_API_VERSION } from '../manifest.js';
import type { FetchLike } from '../transport.js';
import { installHttpAddon } from './http-addon.js';

const MANIFEST = {
  id: 'example-books',
  version: '1.0.0',
  name: 'Example Books',
  apiVersion: ADDON_API_VERSION,
  resources: ['catalog', 'meta', 'source'],
  types: ['book'],
  catalogs: [{ type: 'book', id: 'top', name: 'Top', extra: [{ name: 'search' }] }],
};

interface Reply {
  status?: number;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
}

/** A fetch that answers from a map of URL → reply and records how it was called. */
function fakeFetch(routes: Record<string, Reply>): {
  fetchImpl: FetchLike;
  calls: { url: string; init: Parameters<FetchLike>[1] }[];
} {
  const calls: { url: string; init: Parameters<FetchLike>[1] }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    const reply = routes[url];
    if (!reply) throw new TypeError('Failed to fetch');
    const text = reply.raw ?? JSON.stringify(reply.body ?? {});
    return {
      ok: (reply.status ?? 200) < 400,
      status: reply.status ?? 200,
      text: async () => text,
      headers: { get: (name: string) => reply.headers?.[name.toLowerCase()] ?? null },
    };
  };
  return { fetchImpl, calls };
}

describe('installHttpAddon', () => {
  it('reads the manifest and is then ready to answer', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { body: MANIFEST },
    });
    const addon = await installHttpAddon('https://addon.example/manifest.json', { fetchImpl });
    expect(addon.manifest.name).toBe('Example Books');
  });

  it('accepts the base address as well as the manifest address', async () => {
    const { fetchImpl, calls } = fakeFetch({
      'https://addon.example/books/manifest.json': { body: MANIFEST },
    });
    await installHttpAddon('https://addon.example/books/', { fetchImpl });
    expect(calls[0]?.url).toBe('https://addon.example/books/manifest.json');
  });

  /**
   * The addon is a third-party origin the reader picked. Handing it whatever cookies the browser
   * holds for this site, or the page they were reading, is not something to leave to a default
   * (docs/adr/0010-addon-engine.md).
   */
  it('sends no credentials and no referrer', async () => {
    const { fetchImpl, calls } = fakeFetch({
      'https://addon.example/manifest.json': { body: MANIFEST },
    });
    await installHttpAddon('https://addon.example/manifest.json', { fetchImpl });
    expect(calls[0]?.init?.credentials).toBe('omit');
    expect(calls[0]?.init?.referrerPolicy).toBe('no-referrer');
  });

  it('refuses a manifest this engine cannot read, at install time', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { body: { ...MANIFEST, apiVersion: 99 } },
    });
    await expect(
      installHttpAddon('https://addon.example/manifest.json', { fetchImpl }),
    ).rejects.toThrow(AddonManifestError);
  });

  it('explains an unreachable addon in terms the reader can act on', async () => {
    const { fetchImpl } = fakeFetch({});
    await expect(
      installHttpAddon('https://addon.example/manifest.json', { fetchImpl }),
    ).rejects.toThrow(/offline|CORS/);
  });

  it('reports a non-2xx answer with its status', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { status: 503 },
    });
    await expect(
      installHttpAddon('https://addon.example/manifest.json', { fetchImpl }),
    ).rejects.toThrow(AddonTransportError);
  });

  it('reports a body that is not JSON instead of throwing a parser error', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { raw: '<!doctype html><title>Nope</title>' },
    });
    await expect(
      installHttpAddon('https://addon.example/manifest.json', { fetchImpl }),
    ).rejects.toThrow(/not JSON/);
  });
});

describe('an installed HTTP addon', () => {
  async function install(routes: Record<string, Reply>) {
    const { fetchImpl, calls } = fakeFetch({
      'https://addon.example/manifest.json': { body: MANIFEST },
      ...routes,
    });
    const addon = await installHttpAddon('https://addon.example/manifest.json', { fetchImpl });
    return { addon, calls };
  }

  it('fetches a catalog, with the search term in the URL', async () => {
    const { addon, calls } = await install({
      'https://addon.example/catalog/book/top/search=dune.json': {
        body: { metas: [{ id: 'ol:OL1W', type: 'book', name: 'Dune' }] },
      },
    });
    const result = await addon.getCatalog('book', 'top', { search: 'dune' });
    expect(result.metas.map((meta) => meta.name)).toEqual(['Dune']);
    expect(result.dropped).toBe(0);
    expect(calls[1]?.url).toContain('search=dune');
  });

  it('keeps the readable books and counts the rest', async () => {
    const { addon } = await install({
      'https://addon.example/catalog/book/top.json': {
        body: {
          metas: [{ id: 'a', type: 'book', name: 'A' }, { id: 'b', type: 'book' }, 'not an object'],
        },
      },
    });
    const result = await addon.getCatalog('book', 'top');
    expect(result.metas).toHaveLength(1);
    expect(result.dropped).toBe(2);
  });

  it('fails the whole catalog only when the envelope itself is wrong', async () => {
    const { addon } = await install({
      'https://addon.example/catalog/book/top.json': { body: { results: [] } },
    });
    await expect(addon.getCatalog('book', 'top')).rejects.toThrow(AddonResponseError);
  });

  it('fetches one book', async () => {
    const { addon } = await install({
      'https://addon.example/meta/book/ol%3AOL1W.json': {
        body: { meta: { id: 'ol:OL1W', type: 'book', name: 'Dune', pageCount: 412 } },
      },
    });
    const { meta } = await addon.getMeta('book', 'ol:OL1W');
    expect(meta.pageCount).toBe(412);
  });

  it('fetches sources and does not classify them', async () => {
    const { addon } = await install({
      'https://addon.example/source/book/ol%3AOL1W.json': {
        body: {
          sources: [
            { name: 'Example', url: 'https://addon.example/1.epub', format: 'epub' },
            { name: 'Elsewhere', url: 'https://anything.example/2.pdf' },
            { name: 'Hostile', url: 'javascript:alert(1)' },
          ],
        },
      },
    });
    const result = await addon.getSources('book', 'ol:OL1W');
    expect(result.sources.map((source) => source.name)).toEqual(['Example', 'Elsewhere']);
    // The one that was dropped was dropped for its scheme, not its host.
    expect(result.dropped).toBe(1);
    expect(result.sources[0]).not.toHaveProperty('rightsStatus');
  });

  it('does not ask for a resource the manifest never claimed', async () => {
    const { addon, calls } = await install({});
    await expect(addon.getCatalog('audiobook', 'top')).rejects.toThrow(AddonResponseError);
    expect(calls).toHaveLength(1); // the manifest, and nothing more
  });

  it('refuses an answer larger than the ceiling, before parsing it', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { body: MANIFEST },
      'https://addon.example/catalog/book/top.json': {
        raw: `${JSON.stringify({ metas: [] })}${' '.repeat(5000)}`,
      },
    });
    const addon = await installHttpAddon('https://addon.example/manifest.json', {
      fetchImpl,
      maxChars: 1000,
    });
    await expect(addon.getCatalog('book', 'top')).rejects.toThrow(/too large/);
  });

  it('believes a declared content-length that is over the ceiling', async () => {
    const { fetchImpl } = fakeFetch({
      'https://addon.example/manifest.json': { body: MANIFEST },
      'https://addon.example/catalog/book/top.json': {
        body: { metas: [] },
        headers: { 'content-length': String(10_000_000) },
      },
    });
    const addon = await installHttpAddon('https://addon.example/manifest.json', {
      fetchImpl,
      maxChars: 1000,
    });
    await expect(addon.getCatalog('book', 'top')).rejects.toThrow(/too large/);
  });
});

describe('the timeout', () => {
  it('aborts a request that outlives it', async () => {
    const fetchImpl = vi.fn<FetchLike>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        }),
    );
    await expect(
      installHttpAddon('https://addon.example/manifest.json', { fetchImpl, timeoutMs: 10 }),
    ).rejects.toThrow(/did not answer within 10ms/);
  });
});
