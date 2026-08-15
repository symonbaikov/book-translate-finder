import { describe, expect, it } from 'vitest';
import { PluginRegistry } from '../plugin.js';
import { InvalidUrlTemplateError } from './template.js';
import {
  activeSourceProviders,
  createCustomSourceProvider,
  type SourceProviderConfig,
} from './source-provider.js';

function config(overrides: Partial<SourceProviderConfig> = {}): SourceProviderConfig {
  return {
    id: 'my-shop',
    name: 'My Shop',
    urlTemplate: 'https://{domain}/isbn/{isbn}',
    enabled: true,
    params: { domain: 'my-shop.example' },
    ...overrides,
  };
}

describe('createCustomSourceProvider', () => {
  it('builds a manifest that identifies it as a url-template plugin', () => {
    const provider = createCustomSourceProvider(config());
    expect(provider.manifest).toMatchObject({
      id: 'my-shop',
      name: 'My Shop',
      kind: 'url-source',
      accessMode: 'url-template',
      runtime: 'both',
    });
  });

  it('resolves the template against the book, using params for its own tokens', () => {
    const provider = createCustomSourceProvider(config());
    expect(provider.resolveSearchUrl({ isbn: '9780140447934', title: 'Book' })).toBe(
      'https://my-shop.example/isbn/9780140447934',
    );
  });

  it('falls back to "title author" for {query} when the edition has no ISBN', () => {
    const provider = createCustomSourceProvider(
      config({ urlTemplate: 'https://{domain}/search?q={query}' }),
    );
    expect(
      provider.resolveSearchUrl({ isbn: null, title: 'Le Petit Prince', author: 'Saint-Exupéry' }),
    ).toBe('https://my-shop.example/search?q=Le%20Petit%20Prince%20Saint-Exup%C3%A9ry');
  });

  it('returns null when the template needs an ISBN the edition does not have', () => {
    const provider = createCustomSourceProvider(config());
    expect(provider.resolveSearchUrl({ isbn: null, title: 'Book' })).toBeNull();
  });

  it('lets a book-derived value win over a same-named param', () => {
    const provider = createCustomSourceProvider(
      config({
        urlTemplate: 'https://{domain}/isbn/{isbn}',
        params: { domain: 'my-shop.example', isbn: 'ignored' },
      }),
    );
    expect(provider.resolveSearchUrl({ isbn: '123', title: 'Book' })).toBe(
      'https://my-shop.example/isbn/123',
    );
  });

  it('rejects a config whose template is not an absolute http(s) URL', () => {
    expect(() =>
      createCustomSourceProvider(config({ urlTemplate: 'javascript:alert(1)' })),
    ).toThrow(InvalidUrlTemplateError);
  });
});

describe('activeSourceProviders', () => {
  it('drops disabled entries and resolves the rest', () => {
    const providers = activeSourceProviders([
      config({ id: 'on', enabled: true }),
      config({ id: 'off', enabled: false }),
    ]);
    expect(providers.map((p) => p.manifest.id)).toEqual(['on']);
  });

  it('composes with the shared PluginRegistry', () => {
    const registry = new PluginRegistry(
      activeSourceProviders([config({ id: 'a' }), config({ id: 'b', name: 'Other' })]),
    );
    expect(
      registry
        .all()
        .map((p) => p.manifest.id)
        .sort(),
    ).toEqual(['a', 'b']);
  });
});
