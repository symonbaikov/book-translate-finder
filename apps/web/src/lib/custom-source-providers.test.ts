import { InvalidUrlTemplateError } from '@golden/plugins';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DuplicateCustomSourceError,
  addCustomSource,
  listCustomSources,
  removeCustomSource,
  setCustomSourceEnabled,
} from './custom-source-providers';

/** Same fake `localStorage` as `installed-addons.test.ts`, so refusals can be exercised directly. */
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

describe('addCustomSource', () => {
  it('persists a new source, enabled by default, with a slug id derived from the name', () => {
    installStorage();
    const result = addCustomSource({
      name: 'My Shop',
      urlTemplate: 'https://my-shop.example/isbn/{isbn}',
    });
    expect(result).toEqual({ persisted: true, id: 'my-shop' });
    expect(listCustomSources()).toEqual([
      {
        id: 'my-shop',
        name: 'My Shop',
        urlTemplate: 'https://my-shop.example/isbn/{isbn}',
        enabled: true,
      },
    ]);
  });

  it('disambiguates two different names that happen to slugify to the same id', () => {
    installStorage();
    addCustomSource({ name: 'My Shop!', urlTemplate: 'https://a.example/{isbn}' });
    const second = addCustomSource({ name: 'My  Shop', urlTemplate: 'https://b.example/{isbn}' });
    expect(second.id).toBe('my-shop-2');
  });

  it('rejects a template that is not an absolute http(s) URL, and writes nothing', () => {
    installStorage();
    expect(() => addCustomSource({ name: 'Bad', urlTemplate: 'javascript:alert(1)' })).toThrow(
      InvalidUrlTemplateError,
    );
    expect(listCustomSources()).toEqual([]);
  });

  it('rejects a name that is already configured, case-insensitively', () => {
    installStorage();
    addCustomSource({ name: 'My Shop', urlTemplate: 'https://a.example/{isbn}' });
    expect(() =>
      addCustomSource({ name: 'MY SHOP', urlTemplate: 'https://b.example/{isbn}' }),
    ).toThrow(DuplicateCustomSourceError);
  });

  it('reports an unstored write when the browser refuses to persist it', () => {
    installStorage({ refuseWrites: true });
    const result = addCustomSource({ name: 'My Shop', urlTemplate: 'https://a.example/{isbn}' });
    expect(result.persisted).toBe(false);
  });
});

describe('removeCustomSource', () => {
  it('drops the matching entry and leaves the rest', () => {
    installStorage();
    addCustomSource({ name: 'Keep', urlTemplate: 'https://a.example/{isbn}' });
    addCustomSource({ name: 'Drop', urlTemplate: 'https://b.example/{isbn}' });
    removeCustomSource('drop');
    expect(listCustomSources().map((source) => source.id)).toEqual(['keep']);
  });
});

describe('setCustomSourceEnabled', () => {
  it('toggles enabled without touching the rest of the entry', () => {
    installStorage();
    addCustomSource({ name: 'My Shop', urlTemplate: 'https://a.example/{isbn}' });
    setCustomSourceEnabled('my-shop', false);
    expect(listCustomSources()).toEqual([
      { id: 'my-shop', name: 'My Shop', urlTemplate: 'https://a.example/{isbn}', enabled: false },
    ]);
  });
});
