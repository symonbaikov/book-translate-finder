import { z } from 'zod';
import { AddonError } from '../errors.js';
import type { FetchLike } from '../transport.js';
import { parseWebUrl } from '../url.js';

/**
 * The addon's only way to reach the network, and the place where its declared hosts stop being
 * documentation.
 *
 * The sandbox is deliberately arranged so that this function is unavoidable: the frame's CSP says
 * `connect-src 'none'`, and the worker's ambient `fetch` is removed before the addon's first
 * statement runs. An addon cannot open a socket; it can only ask, and this is what answers.
 *
 * Enforcement lives here, in a plain function a unit test can call, rather than in a
 * per-installation CSP. That was a deliberate trade (docs/adr/0010-addon-engine.md §3): a generated
 * CSP would have to come from the server, and asking the server for it would tell the server which
 * addons the reader has installed — losing the property the whole design exists to keep.
 */

export class AddonPermissionError extends AddonError {
  constructor(readonly host: string) {
    super(`This addon did not ask for permission to contact ${host}.`);
  }
}

/**
 * What an addon may say about a request.
 *
 * Narrow on purpose. `credentials` and `referrerPolicy` are absent because they are not the addon's
 * to choose — they are pinned below. `Cookie` and `Authorization` are dropped: the first the browser
 * refuses anyway, and the second would let an addon replay a credential it should never have been
 * holding. An addon that legitimately needs auth against the reader's own server gets it from its
 * own configuration, in its own request, which is exactly what this shape allows.
 */
export const AddonRequestInitSchema = z.object({
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string().max(200)).optional(),
  body: z
    .string()
    .max(64 * 1024)
    .optional(),
});
export type AddonRequestInit = z.infer<typeof AddonRequestInitSchema>;

const DROPPED_HEADERS: ReadonlySet<string> = new Set(['cookie', 'set-cookie', 'authorization']);

export interface MediatedFetchOptions {
  /** Exactly the hosts from the addon's manifest. Matched whole; there is no subdomain wildcard. */
  readonly allowedHosts: readonly string[];
  readonly fetchImpl: FetchLike;
  readonly timeoutMs: number;
  readonly maxChars: number;
}

/**
 * Performs one request on an addon's behalf, or refuses.
 *
 * Refusals are of two kinds and the messages say which: a URL that is not an `http(s)` address at
 * all, and a host the addon never declared. The second is the one the reader cares about — it means
 * the addon is trying to reach somewhere they did not agree to — so it names the host.
 */
export async function mediatedFetch(
  rawUrl: string,
  init: AddonRequestInit | null,
  options: MediatedFetchOptions,
): Promise<string> {
  const url = parseWebUrl(rawUrl);
  if (!url) {
    throw new AddonError(`Not an address an addon may request: ${rawUrl.slice(0, 200)}`);
  }

  const host = url.hostname.toLowerCase();
  if (!options.allowedHosts.some((allowed) => allowed.toLowerCase() === host)) {
    throw new AddonPermissionError(host);
  }

  const request = init ? AddonRequestInitSchema.parse(init) : {};
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(request.headers ?? {})) {
    if (!DROPPED_HEADERS.has(name.toLowerCase())) headers[name] = value;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await options.fetchImpl(url.toString(), {
      headers,
      signal: controller.signal,
      redirect: 'follow',
      // Not the addon's to choose. Whatever session this browser holds for this instance, or for
      // the addon's own host, is not part of what the reader agreed to when they installed it.
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      ...(request.method ? { method: request.method } : {}),
      ...(request.body !== undefined ? { body: request.body } : {}),
    });

    if (!response.ok) {
      throw new AddonError(`${host} answered ${response.status}.`);
    }
    const text = await response.text();
    if (text.length > options.maxChars) {
      throw new AddonError(`The answer from ${host} is too large to read.`);
    }
    return text;
  } catch (error) {
    if (error instanceof AddonError) throw error;
    if (controller.signal.aborted) {
      throw new AddonError(`${host} did not answer within ${options.timeoutMs}ms.`);
    }
    throw new AddonError(
      `Could not reach ${host} — it may be offline, or may not allow browsers to read its responses (CORS).`,
    );
  } finally {
    clearTimeout(timer);
  }
}
