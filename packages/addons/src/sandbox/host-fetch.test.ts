import { describe, expect, it, vi } from 'vitest';
import { AddonError } from '../errors.js';
import type { FetchLike } from '../transport.js';
import { AddonPermissionError, mediatedFetch } from './host-fetch.js';

function reply(body = 'ok', status = 200) {
  return {
    ok: status < 400,
    status,
    text: async () => body,
    headers: { get: () => null },
  };
}

function options(overrides: Partial<Parameters<typeof mediatedFetch>[2]> = {}) {
  return {
    allowedHosts: ['api.example.org'],
    fetchImpl: vi.fn<FetchLike>(async () => reply()),
    timeoutMs: 1_000,
    maxChars: 1_000,
    ...overrides,
  };
}

describe('mediatedFetch', () => {
  it('lets a declared host through', async () => {
    const config = options();
    await expect(mediatedFetch('https://api.example.org/books', null, config)).resolves.toBe('ok');
  });

  /**
   * The load-bearing assertion of the whole sandbox: the request is not merely rejected afterwards,
   * it is never made. A refusal that still touched the network would have already told the host
   * that the reader is here.
   */
  it('refuses an undeclared host without making the request', async () => {
    const config = options();
    await expect(mediatedFetch('https://elsewhere.example/x', null, config)).rejects.toThrow(
      AddonPermissionError,
    );
    expect(config.fetchImpl).not.toHaveBeenCalled();
  });

  it('names the host it refused, because that is what the reader needs to know', async () => {
    await expect(mediatedFetch('https://tracker.example/x', null, options())).rejects.toThrow(
      /tracker\.example/,
    );
  });

  it('does not treat a subdomain as covered by the parent', async () => {
    await expect(mediatedFetch('https://cdn.api.example.org/x', null, options())).rejects.toThrow(
      AddonPermissionError,
    );
  });

  it('matches the host case-insensitively, as the URL parser already normalises it', async () => {
    const config = options({ allowedHosts: ['API.example.ORG'] });
    await expect(mediatedFetch('https://api.example.org/x', null, config)).resolves.toBe('ok');
  });

  it.each(['javascript:alert(1)', 'file:///etc/passwd', 'data:text/plain,x', 'not a url'])(
    'refuses %s outright',
    async (url) => {
      await expect(mediatedFetch(url, null, options())).rejects.toThrow(AddonError);
    },
  );

  it('pins credentials and referrer rather than letting the addon choose', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => reply());
    await mediatedFetch('https://api.example.org/x', null, options({ fetchImpl }));
    const init = fetchImpl.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('omit');
    expect(init?.referrerPolicy).toBe('no-referrer');
  });

  it('drops headers that would replay a credential', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => reply());
    await mediatedFetch(
      'https://api.example.org/x',
      { headers: { Cookie: 'session=1', Authorization: 'Bearer x', Accept: 'application/json' } },
      options({ fetchImpl }),
    );
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toEqual({ Accept: 'application/json' });
  });

  it('passes a method and body through for the APIs that need them', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => reply());
    await mediatedFetch(
      'https://api.example.org/x',
      { method: 'POST', body: 'q=1' },
      options({ fetchImpl }),
    );
    expect(fetchImpl.mock.calls[0]?.[1]).toMatchObject({ method: 'POST', body: 'q=1' });
  });

  it('refuses a method that is not GET or POST', async () => {
    await expect(
      mediatedFetch('https://api.example.org/x', { method: 'DELETE' } as never, options()),
    ).rejects.toThrow();
  });

  it('reports a non-2xx answer against the host that gave it', async () => {
    const config = options({ fetchImpl: vi.fn<FetchLike>(async () => reply('', 429)) });
    await expect(mediatedFetch('https://api.example.org/x', null, config)).rejects.toThrow(
      /api\.example\.org answered 429/,
    );
  });

  it('refuses an answer over the ceiling', async () => {
    const config = options({ fetchImpl: vi.fn<FetchLike>(async () => reply('x'.repeat(2_000))) });
    await expect(mediatedFetch('https://api.example.org/x', null, config)).rejects.toThrow(
      /too large/,
    );
  });

  it('gives up on a host that does not answer', async () => {
    const config = options({
      timeoutMs: 10,
      fetchImpl: vi.fn<FetchLike>(
        (_url, init) =>
          new Promise((_resolve, rejectPromise) => {
            init?.signal?.addEventListener('abort', () => rejectPromise(new Error('aborted')), {
              once: true,
            });
          }),
      ),
    });
    await expect(mediatedFetch('https://api.example.org/x', null, config)).rejects.toThrow(
      /did not answer within 10ms/,
    );
  });

  it('says CORS out loud, because that is what usually goes wrong', async () => {
    const config = options({
      fetchImpl: vi.fn<FetchLike>(async () => {
        throw new TypeError('Failed to fetch');
      }),
    });
    await expect(mediatedFetch('https://api.example.org/x', null, config)).rejects.toThrow(/CORS/);
  });

  it('lets an addon reach the reader’s own server when that is what was declared', async () => {
    const config = options({ allowedHosts: ['192.168.1.10'] });
    await expect(mediatedFetch('http://192.168.1.10:8083/opds', null, config)).resolves.toBe('ok');
  });

  /** ADR-0009 again, at the one point where it would be easiest to quietly reintroduce a gate. */
  it('does not care what the declared host is', async () => {
    const config = options({ allowedHosts: ['libgen.rs'] });
    await expect(mediatedFetch('https://libgen.rs/search', null, config)).resolves.toBe('ok');
  });
});
