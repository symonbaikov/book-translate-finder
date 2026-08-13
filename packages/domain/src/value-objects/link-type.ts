/** How a reader can obtain the book from this link, per docs/architecture.md §3.1. */
export const LINK_TYPES = ['download', 'buy', 'borrow'] as const;

export type LinkType = (typeof LINK_TYPES)[number];

export function isLinkType(value: string): value is LinkType {
  return (LINK_TYPES as readonly string[]).includes(value);
}
