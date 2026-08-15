import { describe, expect, it } from 'vitest';
import { ADDON_API_VERSION, parseAddonManifest, type AddonManifest } from './manifest.js';
import { AddonRegistry, settleAddons, withTimeout } from './registry.js';
import type { AddonTransport, InstalledAddon } from './transport.js';

function manifestOf(id: string, overrides: Record<string, unknown> = {}): AddonManifest {
  return parseAddonManifest(
    {
      id,
      version: '1.0.0',
      name: id,
      apiVersion: ADDON_API_VERSION,
      resources: ['catalog', 'meta', 'source'],
      types: ['book'],
      catalogs: [{ type: 'book', id: 'top', name: 'Top' }],
      ...overrides,
    },
    `https://${id}.example/manifest.json`,
  );
}

function installed(
  id: string,
  options: { enabled?: boolean; manifest?: AddonManifest } = {},
): InstalledAddon {
  const manifest = options.manifest ?? manifestOf(id);
  const transport = {
    manifest,
    getCatalog: async () => ({ metas: [], dropped: 0 }),
    getMeta: async () => ({ meta: { id: 'x', type: 'book' as const, name: 'x' } }),
    getSources: async () => ({ sources: [], dropped: 0 }),
  } satisfies AddonTransport;
  return {
    descriptor: { kind: 'http', manifestUrl: `https://${id}.example/manifest.json` },
    transport,
    enabled: options.enabled ?? true,
  };
}

describe('AddonRegistry', () => {
  it('keeps the reader’s order, because order is priority', () => {
    const registry = new AddonRegistry([installed('c'), installed('a'), installed('b')]);
    expect(registry.all().map((addon) => addon.transport.manifest.id)).toEqual(['c', 'a', 'b']);
  });

  it('refuses two addons under one id', () => {
    expect(() => new AddonRegistry([installed('a'), installed('a')])).toThrow(/Duplicate addon id/);
  });

  it('finds an addon by id, and answers null rather than throwing', () => {
    const registry = new AddonRegistry([installed('a')]);
    expect(registry.get('a')?.transport.manifest.name).toBe('a');
    expect(registry.get('missing')).toBeNull();
  });

  describe('supporting', () => {
    it('leaves out a disabled addon', () => {
      const registry = new AddonRegistry([installed('a', { enabled: false }), installed('b')]);
      expect(registry.supporting('catalog', 'book').map((a) => a.transport.manifest.id)).toEqual([
        'b',
      ]);
    });

    it('leaves out an addon that does not offer the resource', () => {
      const metaOnly = installed('m', { manifest: manifestOf('m', { resources: ['meta'] }) });
      const registry = new AddonRegistry([metaOnly, installed('b')]);
      expect(registry.supporting('source', 'book').map((a) => a.transport.manifest.id)).toEqual([
        'b',
      ]);
    });

    it('leaves out an addon whose declared prefixes cannot match the id', () => {
      const ol = installed('ol', { manifest: manifestOf('ol', { idPrefixes: ['ol'] }) });
      const registry = new AddonRegistry([ol, installed('any')]);
      expect(
        registry
          .supporting('meta', 'book', 'isbn:9780141439518')
          .map((a) => a.transport.manifest.id),
      ).toEqual(['any']);
    });

    it('preserves priority order among the survivors', () => {
      const registry = new AddonRegistry([installed('c'), installed('a')]);
      expect(registry.supporting('meta', 'book').map((a) => a.transport.manifest.id)).toEqual([
        'c',
        'a',
      ]);
    });
  });
});

describe('settleAddons', () => {
  it('tags every answer with who gave it', async () => {
    const outcomes = await settleAddons([installed('a'), installed('b')], async (addon) =>
      addon.transport.manifest.id.toUpperCase(),
    );
    expect(outcomes).toEqual([
      { addonId: 'a', addonName: 'a', status: 'ok', value: 'A' },
      { addonId: 'b', addonName: 'b', status: 'ok', value: 'B' },
    ]);
  });

  /** The failure model in one assertion: a broken addon loses its own row and nothing else. */
  it('does not let one addon take down the others', async () => {
    const outcomes = await settleAddons([installed('good'), installed('bad')], async (addon) => {
      if (addon.transport.manifest.id === 'bad') throw new Error('upstream is down');
      return 'fine';
    });
    expect(outcomes[0]).toMatchObject({ status: 'ok', value: 'fine' });
    expect(outcomes[1]).toMatchObject({ status: 'failed', reason: 'upstream is down' });
  });

  it('does not let a slow addon hold the page', async () => {
    const outcomes = await settleAddons(
      [installed('slow')],
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('too late'), 1_000);
        }),
      { timeoutMs: 10 },
    );
    expect(outcomes[0]).toMatchObject({ status: 'failed' });
    expect(outcomes[0]?.status === 'failed' && outcomes[0].reason).toMatch(/Timed out after 10ms/);
  });

  it('describes a thrown non-Error without crashing on it', async () => {
    const outcomes = await settleAddons([installed('a')], async () => {
      throw 'a string, because addons are written by strangers';
    });
    expect(outcomes[0]).toMatchObject({
      status: 'failed',
      reason: expect.stringContaining('string'),
    });
  });
});

describe('withTimeout', () => {
  it('passes a value through when it arrives in time', async () => {
    await expect(withTimeout(Promise.resolve(1), 1_000)).resolves.toBe(1);
  });

  it('rejects when it does not', async () => {
    await expect(withTimeout(new Promise(() => {}), 5)).rejects.toThrow(/Timed out after 5ms/);
  });
});
