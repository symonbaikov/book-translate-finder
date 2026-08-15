import { describe, expect, it, vi } from 'vitest';
import { OpdsClient, OpdsFetchError, assertFetchableFeedUrl } from './opds-client.js';

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><id>urn:x</id><title>Shelf</title></feed>`;

function respond(
  body: string,
  init: {
    status?: number;
    contentType?: string;
    url?: string;
    headers?: Record<string, string>;
  } = {},
): Response {
  const headers = new Headers({
    'content-type': init.contentType ?? 'application/atom+xml;profile=opds-catalog',
    ...init.headers,
  });
  const response = new Response(body, { status: init.status ?? 200, headers });
  // `Response.url` is read-only and empty for a synthesized response; the client uses it as the
  // base for relative hrefs, so tests need to be able to set it.
  Object.defineProperty(response, 'url', { value: init.url ?? '' });
  return response;
}

describe('assertFetchableFeedUrl', () => {
  it.each(['file:///etc/passwd', 'javascript:alert(1)', 'data:text/xml,<feed/>'])(
    'rejects %s',
    (url) => {
      expect(() => assertFetchableFeedUrl(url)).toThrow(OpdsFetchError);
    },
  );

  it('rejects a string that is not a URL', () => {
    expect(() => assertFetchableFeedUrl('calibre.local/opds')).toThrow(/not a valid absolute url/i);
  });

  it.each(['http://192.168.1.10:8083/opds', 'https://standardebooks.org/feeds/opds'])(
    'accepts %s',
    (url) => {
      expect(assertFetchableFeedUrl(url).protocol).toMatch(/^https?:$/);
    },
  );
});

describe('OpdsClient', () => {
  it('sends an Accept header advertising both OPDS versions', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respond(ATOM));
    await new OpdsClient({ fetch: fetchMock }).fetchFeed({ url: 'https://example.org/opds' });

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers['Accept']).toContain('application/opds+json');
    expect(headers['Accept']).toContain('application/atom+xml');
  });

  it('sends HTTP Basic credentials for a reader’s own server, UTF-8 safe', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respond(ATOM));
    await new OpdsClient({ fetch: fetchMock }).fetchFeed({
      url: 'https://calibre.example/opds',
      credentials: { username: 'reader', password: 'pässwörd' },
    });

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    const decoded = Buffer.from(headers['Authorization']!.replace('Basic ', ''), 'base64').toString(
      'utf8',
    );
    expect(decoded).toBe('reader:pässwörd');
  });

  it('parses relative hrefs against the URL the response actually came from', async () => {
    const body = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>S</title>
  <link rel="next" href="page2" type="application/atom+xml"/>
</feed>`;
    const fetchMock = vi.fn(async () => respond(body, { url: 'https://example.org/opds/v1.2/' }));

    const feed = await new OpdsClient({ fetch: fetchMock }).fetchFeed({
      url: 'https://example.org/opds',
    });
    expect(feed.pagination.next).toBe('https://example.org/opds/v1.2/page2');
  });

  it('surfaces a non-2xx response as an OpdsFetchError carrying the status', async () => {
    const fetchMock = vi.fn(async () => respond('nope', { status: 401 }));
    await expect(
      new OpdsClient({ fetch: fetchMock }).fetchFeed({ url: 'https://example.org/opds' }),
    ).rejects.toMatchObject({ name: 'OpdsFetchError', status: 401 });
  });

  it('refuses a response larger than the byte limit before buffering it', async () => {
    const fetchMock = vi.fn(async () =>
      respond(ATOM, { headers: { 'content-length': String(50 * 1024 * 1024) } }),
    );
    await expect(
      new OpdsClient({ fetch: fetchMock, maxBytes: 1024 }).fetchFeed({
        url: 'https://example.org/opds',
      }),
    ).rejects.toThrow(/larger than/);
  });

  it('dispatches to the JSON parser when the server answers OPDS 2.0', async () => {
    const fetchMock = vi.fn(async () =>
      respond(JSON.stringify({ metadata: { title: 'JSON shelf' }, publications: [] }), {
        contentType: 'application/opds+json',
      }),
    );
    const feed = await new OpdsClient({ fetch: fetchMock }).fetchFeed({
      url: 'https://example.org/opds',
    });
    expect(feed).toMatchObject({ version: '2.0', title: 'JSON shelf' });
  });

  it('stops waiting once the timeout fires', async () => {
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    await expect(
      new OpdsClient({ fetch: fetchMock, timeoutMs: 10 }).fetchFeed({
        url: 'https://example.org/opds',
      }),
    ).rejects.toThrow('aborted');
  });
});

describe('OpdsClient.search', () => {
  const FEED_WITH_SEARCH = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>S</title>
  <link rel="search" href="/opensearch.xml" type="application/opensearchdescription+xml"/>
</feed>`;

  const DESCRIPTION = `<?xml version="1.0"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <Url type="text/html" template="https://example.org/search?q={searchTerms}"/>
  <Url type="application/atom+xml;profile=opds-catalog" template="/opds/search?q={searchTerms}&amp;count={count?}"/>
</OpenSearchDescription>`;

  it('follows the OpenSearch description and prefers the catalog template', async () => {
    const requested: string[] = [];
    const fetchMock = vi.fn(async (url: string) => {
      requested.push(url);
      if (url.includes('opensearch.xml')) return respond(DESCRIPTION, { contentType: 'text/xml' });
      return respond(FEED_WITH_SEARCH);
    });

    await new OpdsClient({ fetch: fetchMock }).search({
      url: 'https://example.org/opds',
      terms: 'war and peace',
    });

    expect(requested[0]).toBe('https://example.org/opds');
    expect(requested[1]).toBe('https://example.org/opensearch.xml');
    expect(requested[2]).toBe('https://example.org/opds/search?q=war%20and%20peace&count=50');
  });

  it('says so plainly when the feed offers no search', async () => {
    const fetchMock = vi.fn(async () => respond(ATOM));
    await expect(
      new OpdsClient({ fetch: fetchMock }).search({ url: 'https://example.org/opds', terms: 'x' }),
    ).rejects.toThrow(/does not advertise a search endpoint/);
  });

  it('fetches the feed itself before its search description', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('opensearch')
        ? respond(DESCRIPTION, { contentType: 'text/xml' })
        : respond(FEED_WITH_SEARCH),
    );
    await new OpdsClient({ fetch: fetchMock }).search({
      url: 'https://example.org/opds',
      terms: 'x',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
