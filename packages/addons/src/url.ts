/**
 * The one thing this engine checks about a URL, and the reason it is not a policy.
 *
 * ADR-0009 removed every judgement about *where* an addon's links point. What survives is a
 * judgement about what kind of string may be put into an `href` or handed to `fetch` at all:
 * `javascript:` executes in this origin, `data:` and `blob:` can carry a document that then
 * executes in this origin, and `file:` addresses the reader's disk. Rendering any of those because
 * an addon asked would be an injection bug with extra steps.
 *
 * So: `http` and `https`, and nothing else. That rule is about the browser's execution model and
 * says nothing about the host — `https://anything.example` passes, which is the whole point of the
 * blind core.
 */

const FETCHABLE_SCHEMES: ReadonlySet<string> = new Set(['http:', 'https:']);

/** The parsed URL, or `null` if it is not an absolute `http`/`https` address. */
export function parseWebUrl(value: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  return FETCHABLE_SCHEMES.has(parsed.protocol) ? parsed : null;
}

export function isWebUrl(value: string): boolean {
  return parseWebUrl(value) !== null;
}

/**
 * Resolves a possibly-relative reference against a base, keeping the scheme rule. Addons are
 * allowed to return relative paths for their own assets; a relative reference cannot change origin,
 * and one that somehow does (`//evil.example`, an absolute path with a scheme) is re-checked here
 * rather than trusted for having looked relative.
 */
export function resolveWebUrl(reference: string, base: string | URL): URL | null {
  let resolved: URL;
  try {
    resolved = new URL(reference, base);
  } catch {
    return null;
  }
  return FETCHABLE_SCHEMES.has(resolved.protocol) ? resolved : null;
}

/**
 * A bare hostname as it appears in a local addon's declared permissions: lowercase, no scheme, no
 * path, no port, no wildcard. Wildcards are refused because a permission the reader cannot evaluate
 * is not consent — "`*.example.com`" means "some host I have not named yet"
 * (docs/adr/0010-addon-engine.md §4).
 */
export function isBareHostname(value: string): boolean {
  if (value !== value.toLowerCase() || value.length === 0 || value.length > 253) return false;
  if (value.includes('*') || value.includes('/') || value.includes(':') || value.includes(' ')) {
    return false;
  }
  // `new URL` normalises punycode and rejects the malformed, and it is the same parser the fetch
  // path will use — a hostname that survives it is the hostname that will actually be compared.
  const parsed = parseWebUrl(`https://${value}`);
  return parsed !== null && parsed.hostname === value && parsed.pathname === '/';
}
