/**
 * Filling a reader-authored URL template with the fields of one book.
 *
 * **Why a template and not a function.** A reader configuring a custom source has no access to
 * this codebase — they can paste a string into a form, nothing more. `https://{domain}/isbn/{isbn}`
 * is the entire surface area they need to learn, and it is the same shape `bookstore-catalog.ts`
 * already uses internally for the ~90 shipped stores (see the `store()` helper there), just with
 * more than one placeholder and no closure to write.
 *
 * **Why an unresolved placeholder means `null` and not a half-built URL.** A link that lands on
 * `https://example.com/isbn/{isbn}` because the edition has no ISBN is worse than no link at all —
 * it looks like a real result until it is clicked. `formatUrlTemplate` refuses to hand back a
 * string with an unfilled `{token}` still in it.
 */

const TOKEN_PATTERN = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

/** Values available to fill `{tokens}` in a template. `null`/`undefined`/`''` all count as absent. */
export type UrlTemplateTokens = Readonly<Record<string, string | null | undefined>>;

/** Every `{token}` name a template references, in order of first appearance. */
export function urlTemplateTokenNames(template: string): string[] {
  return [...template.matchAll(TOKEN_PATTERN)].map((match) => match[1] as string);
}

/**
 * Fills every `{token}` in `template` from `tokens`. Each substituted value is percent-encoded —
 * the same reasoning as `bookstore-catalog.ts`: a title like "Le Petit Prince, Saint-Exupéry" has
 * spaces, commas and accents that would otherwise break the URL. Returns `null` if any placeholder
 * the template actually uses has no value, rather than emitting a URL with a literal `{isbn}` in
 * it — see the module doc.
 */
export function formatUrlTemplate(template: string, tokens: UrlTemplateTokens): string | null {
  let complete = true;
  const filled = template.replace(TOKEN_PATTERN, (whole, name: string) => {
    const value = tokens[name];
    if (!value) {
      complete = false;
      return whole;
    }
    return encodeURIComponent(value);
  });
  return complete ? filled : null;
}

export class InvalidUrlTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlTemplateError';
  }
}

/**
 * Transport check only, exactly like `assertFetchableFeedUrl` in `opds-client.ts`: an absolute
 * `http`/`https` URL once the `{tokens}` are stripped out, nothing more. Whether the destination is
 * one this project would have shipped itself is not a question asked here — a reader pointing their
 * own browser at their own choice of link is not something this instance vets or fetches on their
 * behalf (docs/adr/0009-blind-core-link-policy-scope.md draws the same line for OPDS catalogs).
 */
export function assertHttpUrlTemplate(template: string): void {
  const probe = template.replace(TOKEN_PATTERN, 'x');
  let parsed: URL;
  try {
    parsed = new URL(probe);
  } catch {
    throw new InvalidUrlTemplateError(`Not a valid absolute URL template: ${template}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new InvalidUrlTemplateError(`Unsupported URL scheme in template: ${parsed.protocol}`);
  }
}
