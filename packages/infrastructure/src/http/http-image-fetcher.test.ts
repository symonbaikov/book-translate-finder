import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from './resilient-fetch.js';
import { HttpImageFetcher } from './http-image-fetcher.js';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

function imageResponse(): Response {
  return new Response(JPEG, { status: 200, headers: { 'content-type': 'image/jpeg' } });
}

function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { location } });
}

describe('HttpImageFetcher', () => {
  it('follows the redirect chain a cover really takes', async () => {
    // The measured chain: covers.openlibrary.org → archive.org → a per-request ia*.us node.
    const seen: string[] = [];
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async (url: string) => {
        seen.push(url);
        if (url.includes('covers.openlibrary.org')) {
          return redirectTo('https://archive.org/download/l_covers_0008/x.zip/0008443266-L.jpg');
        }
        if (url.includes('archive.org/download')) {
          return redirectTo('https://ia902809.us.archive.org/view_archive.php?file=x.jpg');
        }
        return imageResponse();
      }),
    };

    const image = await new HttpImageFetcher(fetcher, 'ua').fetchImage(
      'https://covers.openlibrary.org/b/id/8443266-L.jpg',
    );

    expect(image?.contentType).toBe('image/jpeg');
    expect(image?.bytes).toEqual(JPEG);
    expect(seen).toHaveLength(3);
  });

  it('refuses to follow a redirect off the allowlist', async () => {
    // Where an open proxy would begin: checking the host only at the first hop is not a check.
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async (url: string) =>
        url.includes('covers.openlibrary.org')
          ? redirectTo('https://169.254.169.254/latest/meta-data/')
          : imageResponse(),
      ),
    };

    await expect(
      new HttpImageFetcher(fetcher, 'ua').fetchImage('https://covers.openlibrary.org/b/id/1-L.jpg'),
    ).resolves.toBeNull();
    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('refuses a source that is not on the allowlist at all, without a request', async () => {
    const fetcher: ResilientFetcher = { fetch: vi.fn(async () => imageResponse()) };

    await expect(
      new HttpImageFetcher(fetcher, 'ua').fetchImage('https://example.com/cover.jpg'),
    ).resolves.toBeNull();
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('refuses a response that is not an image, whatever its status', async () => {
    // A rate-limit notice or an error page served with 200 is not a cover, and handing it to an
    // `<img>` tag would only produce a broken icon.
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(
        async () =>
          new Response('<html>slow down</html>', {
            status: 200,
            headers: { 'content-type': 'text/html' },
          }),
      ),
    };

    await expect(
      new HttpImageFetcher(fetcher, 'ua').fetchImage('https://covers.openlibrary.org/b/id/1-L.jpg'),
    ).resolves.toBeNull();
  });

  it('gives up rather than following a redirect loop forever', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => redirectTo('https://covers.openlibrary.org/b/id/1-L.jpg')),
    };

    await expect(
      new HttpImageFetcher(fetcher, 'ua').fetchImage('https://covers.openlibrary.org/b/id/1-L.jpg'),
    ).resolves.toBeNull();
    expect((fetcher.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBeLessThan(10);
  });

  it('strips the charset a source tacks onto the content type', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(
        async () =>
          new Response(JPEG, {
            status: 200,
            headers: { 'content-type': 'image/jpeg; charset=UTF-8' },
          }),
      ),
    };

    const image = await new HttpImageFetcher(fetcher, 'ua').fetchImage(
      'https://covers.openlibrary.org/b/id/1-L.jpg',
    );

    expect(image?.contentType).toBe('image/jpeg');
  });
});
