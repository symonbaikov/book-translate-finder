/**
 * How a reader can obtain the book from this link, per docs/architecture.md §3.1.
 *
 * `listen` is a page that plays a public domain audiobook (LibriVox) rather than a file to keep.
 * It is a separate type rather than a `download` because the two answer different questions —
 * "can I keep this" vs "can I press play" — and a reader looking for an audiobook should not have
 * to open every download link to find out which ones are audio. `LinkPolicy` gates it exactly as
 * strictly as `download` (docs/legal-policy.md I-1, ADR-0005): allowlisted provider, and public
 * domain or an open licence.
 */
export const LINK_TYPES = ['download', 'buy', 'borrow', 'listen'] as const;

export type LinkType = (typeof LINK_TYPES)[number];

export function isLinkType(value: string): value is LinkType {
  return (LINK_TYPES as readonly string[]).includes(value);
}
