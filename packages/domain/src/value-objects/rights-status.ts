/**
 * Legal status of a specific edition, per docs/legal-policy.md §3. `unknown` is a real, distinct
 * value — not a placeholder for "not set yet" — and is always treated as `copyrighted` by
 * `LinkPolicy`: absence of a clear signal is never treated as permission.
 */
export const RIGHTS_STATUSES = ['public_domain', 'open_license', 'copyrighted', 'unknown'] as const;

export type RightsStatus = (typeof RIGHTS_STATUSES)[number];

export function isRightsStatus(value: string): value is RightsStatus {
  return (RIGHTS_STATUSES as readonly string[]).includes(value);
}
