import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listAddons, removeAddon } from './installed-addons';
import { addFeed, listFeeds } from './opds-feeds';

/**
 * A `localStorage` that can be told to refuse, because the interesting cases here are the refusals.
 * Everything in this app writes straight into the reader's browser, and a browser in private mode
 * accepts the call and keeps nothing — so "the reader clicked" and "it is stored" are two different
 * facts, and the code has to be able to tell them apart.
 */
function installStorage(options: { readonly refuseWrites?: boolean } = {}) {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.refuseWrites) throw new DOMException('QuotaExceededError');
      entries.set(key, value);
    },
    removeItem: (key: string) => void entries.delete(key),
  };
  vi.stubGlobal('window', { localStorage: storage });
  return entries;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('migrating the OPDS catalogs a reader added before the engine existed', () => {
  it('turns the old list into addons and deletes the old key', () => {
    const entries = installStorage();
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([
        { id: 'feed-a', name: 'My Calibre', url: 'http://192.168.1.10:8083/opds' },
        {
          id: 'feed-b',
          name: 'Kavita',
          url: 'https://kavita.example/opds',
          username: 'me',
          password: 'pw',
        },
      ]),
    );

    const addons = listAddons();
    expect(addons.map((addon) => addon.id)).toEqual(['opds.feed-a', 'opds.feed-b']);
    expect(addons[0]?.descriptor).toEqual({
      kind: 'builtin',
      builtin: 'opds',
      config: { url: 'http://192.168.1.10:8083/opds' },
    });
    expect(entries.get('btf.opds-feeds')).toBeUndefined();
  });

  it('keeps the credentials, which are the reason this never went to the server', () => {
    const entries = installStorage();
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([
        {
          id: 'feed-b',
          name: 'Kavita',
          url: 'https://kavita.example/opds',
          username: 'me',
          password: 'pw',
        },
      ]),
    );
    expect(listFeeds()[0]).toMatchObject({ username: 'me', password: 'pw' });
  });

  it('records the feed’s host as what the reader is contacting', () => {
    const entries = installStorage();
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([{ id: 'f', name: 'K', url: 'https://k.example/opds' }]),
    );
    expect(listAddons()[0]?.hosts).toEqual(['k.example']);
  });

  /**
   * The failure that would actually hurt: a browser that refuses the write. Deleting the old key
   * before the new list is safely stored would lose the reader's shelf outright, so the old key
   * stays and the migration is simply retried next time.
   */
  it('leaves the old list alone when the browser refuses to store the new one', () => {
    const entries = installStorage({ refuseWrites: true });
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([{ id: 'f', name: 'K', url: 'https://k.example/opds' }]),
    );
    listAddons();
    expect(entries.get('btf.opds-feeds')).toBeDefined();
  });

  it('does not run twice over a catalog already migrated', () => {
    const entries = installStorage();
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([{ id: 'f', name: 'K', url: 'https://k.example/opds' }]),
    );
    listAddons();
    entries.set(
      'btf.opds-feeds',
      JSON.stringify([{ id: 'f', name: 'K', url: 'https://k.example/opds' }]),
    );
    expect(listAddons().map((addon) => addon.id)).toEqual(['opds.f']);
  });
});

describe('the shelf’s view of the one list', () => {
  it('adds a catalog as an addon and shows it in both places', () => {
    installStorage();
    const { feed, persisted } = addFeed({
      name: 'My Calibre',
      url: 'http://192.168.1.10:8083/opds',
    });
    expect(persisted).toBe(true);
    expect(listFeeds().map((candidate) => candidate.url)).toEqual([feed.url]);
    expect(listAddons().map((addon) => addon.name)).toEqual(['My Calibre']);
  });

  it('refuses the same catalog twice', () => {
    installStorage();
    addFeed({ name: 'A', url: 'https://k.example/opds' });
    expect(() => addFeed({ name: 'A again', url: 'https://k.example/opds' })).toThrow(
      /already on your shelf/,
    );
  });

  it('reports honestly when the browser refused to keep it', () => {
    installStorage({ refuseWrites: true });
    expect(addFeed({ name: 'A', url: 'https://k.example/opds' }).persisted).toBe(false);
  });

  it('removing it from the addons page removes it from the shelf', () => {
    installStorage();
    const { feed } = addFeed({ name: 'A', url: 'https://k.example/opds' });
    removeAddon(feed.id);
    expect(listFeeds()).toEqual([]);
  });

  it('shows only OPDS catalogs, not every addon the reader has', () => {
    const entries = installStorage();
    addFeed({ name: 'A', url: 'https://k.example/opds' });
    const stored = JSON.parse(entries.get('btf.addons') ?? '[]') as unknown[];
    entries.set(
      'btf.addons',
      JSON.stringify([
        ...stored,
        {
          id: 'http-one',
          name: 'An HTTP addon',
          version: '1',
          descriptor: { kind: 'http', manifestUrl: 'https://addon.example/manifest.json' },
          hosts: ['addon.example'],
          enabled: true,
        },
      ]),
    );
    expect(listFeeds().map((feed) => feed.name)).toEqual(['A']);
    expect(listAddons()).toHaveLength(2);
  });
});
