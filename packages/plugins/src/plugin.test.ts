import { describe, expect, it } from 'vitest';
import { PluginRegistry, settleAll, type Plugin, type PluginManifest } from './plugin.js';

function fakePlugin(manifest: Partial<PluginManifest> & { id: string }): Plugin {
  return {
    manifest: {
      name: manifest.id,
      kind: 'price',
      accessMode: 'official-api',
      runtime: 'both',
      ...manifest,
    },
  };
}

describe('PluginRegistry', () => {
  it('rejects two plugins under one id', () => {
    expect(() => new PluginRegistry([fakePlugin({ id: 'a' }), fakePlugin({ id: 'a' })])).toThrow(
      /duplicate plugin id/i,
    );
  });

  it('looks plugins up by id and returns null for an unknown one', () => {
    const registry = new PluginRegistry([fakePlugin({ id: 'a' })]);
    expect(registry.get('a')?.manifest.id).toBe('a');
    expect(registry.get('b')).toBeNull();
  });

  it('selects by runtime, counting "both" as either side', () => {
    const registry = new PluginRegistry([
      fakePlugin({ id: 'client-only', runtime: 'client' }),
      fakePlugin({ id: 'server-only', runtime: 'server' }),
      fakePlugin({ id: 'either', runtime: 'both' }),
    ]);
    expect(registry.select({ runtime: 'server' }).map((p) => p.manifest.id)).toEqual([
      'server-only',
      'either',
    ]);
  });

  it('skips a plugin that does not serve the reader’s country, and keeps unscoped ones', () => {
    const registry = new PluginRegistry([
      fakePlugin({ id: 'de-only', countries: ['DE'] }),
      fakePlugin({ id: 'worldwide' }),
    ]);
    expect(registry.select({ country: 'pl' }).map((p) => p.manifest.id)).toEqual(['worldwide']);
    expect(registry.select({ country: 'DE' }).map((p) => p.manifest.id)).toEqual([
      'de-only',
      'worldwide',
    ]);
  });
});

describe('settleAll', () => {
  it('keeps the working plugins when one throws', async () => {
    const outcomes = await settleAll(
      [fakePlugin({ id: 'good' }), fakePlugin({ id: 'broken' })],
      async (plugin) => {
        if (plugin.manifest.id === 'broken') throw new Error('upstream is down');
        return 'ok';
      },
    );

    expect(outcomes).toEqual([
      { pluginId: 'good', status: 'ok', value: 'ok' },
      { pluginId: 'broken', status: 'failed', reason: 'upstream is down' },
    ]);
  });

  it('fails only the plugin that exceeded the timeout', async () => {
    const outcomes = await settleAll(
      [fakePlugin({ id: 'fast' }), fakePlugin({ id: 'slow' })],
      async (plugin) =>
        plugin.manifest.id === 'fast'
          ? 'quick'
          : new Promise<string>((resolve) => setTimeout(() => resolve('late'), 200)),
      { timeoutMs: 20 },
    );

    expect(outcomes[0]).toMatchObject({ status: 'ok', value: 'quick' });
    expect(outcomes[1]).toMatchObject({ status: 'failed', reason: 'Timed out after 20ms' });
  });

  it('runs plugins concurrently rather than one after another', async () => {
    const started: number[] = [];
    const plugins = [fakePlugin({ id: 'a' }), fakePlugin({ id: 'b' }), fakePlugin({ id: 'c' })];
    await settleAll(plugins, async () => {
      started.push(started.length);
      await new Promise((resolve) => setTimeout(resolve, 10));
      return started.length;
    });
    // All three entered before any finished — a sequential implementation would give [1, 2, 3].
    expect(started).toEqual([0, 1, 2]);
  });
});
