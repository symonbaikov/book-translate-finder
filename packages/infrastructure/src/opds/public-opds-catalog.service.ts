import { NotFoundError, InvalidInputError, type CachePort } from '@golden/domain';
import {
  BUILT_IN_OPDS_FEEDS,
  OpdsClient,
  type OpdsFeed,
  type OpdsFeedPlugin,
  type PluginManifest,
} from '@golden/plugins';

/**
 * Server-side reader for the catalogs shipped with the app.
 *
 * **Why a relay exists at all.** Project Gutenberg and Standard Ebooks send no CORS headers, so a
 * browser physically cannot read their feeds; without this the built-in catalogs would be dead
 * links. The reader's *own* servers are the opposite case — they are on private networks and are
 * fetched by the browser only, never here (docs/adr/0007).
 *
 * **Why it is not a URL proxy.** It takes a feed id and, optionally, a URL that must live under
 * that feed's own origin — never an arbitrary address. That is the whole defence against turning
 * the API into an SSRF gadget: there is no input that makes it fetch a host the operator did not
 * ship. Pagination and sub-catalog links still work, because those are same-origin by construction.
 */
export class PublicOpdsCatalog {
  private readonly feeds: ReadonlyMap<string, OpdsFeedPlugin>;

  constructor(
    private readonly client: OpdsClient,
    private readonly cache: CachePort,
    feeds: readonly OpdsFeedPlugin[] = BUILT_IN_OPDS_FEEDS,
    private readonly ttlSeconds = 60 * 60,
  ) {
    this.feeds = new Map(feeds.map((feed) => [feed.manifest.id, feed]));
  }

  listFeeds(): readonly PluginManifest[] {
    return [...this.feeds.values()].map((feed) => feed.manifest);
  }

  /**
   * @param href a URL taken from a previously returned feed (pagination or a sub-catalog).
   *             Rejected unless it is on the registered feed's own origin.
   */
  async fetchFeed(feedId: string, href?: string | null): Promise<OpdsFeed> {
    const feed = this.feeds.get(feedId);
    if (!feed) throw new NotFoundError(`Unknown OPDS catalog: ${feedId}`);

    const url = href ? this.assertAllowedOrigin(feed, href) : feed.url;
    const cacheKey = `opds:feed:${feedId}:${url}`;
    const cached = await this.cache.get<OpdsFeed>(cacheKey);
    if (cached) return cached;

    const result = await this.client.fetchFeed({ url });
    await this.cache.set(cacheKey, result, this.ttlSeconds);
    return result;
  }

  /**
   * `href` must land on one of the origins the registered feed declares — its own, plus any it
   * lists in `allowedOrigins`. Anything else is refused, which is what keeps this from being an
   * open proxy: the set of reachable hosts is fixed by the operator's feed list, not by the caller.
   */
  private assertAllowedOrigin(feed: OpdsFeedPlugin, href: string): string {
    let target: URL;
    try {
      target = new URL(href, feed.url);
    } catch {
      throw new InvalidInputError(`Not a valid catalog URL: ${href}`);
    }

    const allowed = [...new Set([new URL(feed.url).origin, ...(feed.allowedOrigins ?? [])])];
    if (!allowed.includes(target.origin)) {
      throw new InvalidInputError(
        `Catalog URL must stay on ${allowed.join(' or ')}, got ${target.origin}`,
      );
    }
    return target.toString();
  }
}
