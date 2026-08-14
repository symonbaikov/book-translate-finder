/**
 * Human-facing labels for every link (docs/legal-policy.md, brief requirement I-4: explicit
 * badges for "public domain" / "buy" / "borrow from a library"). Every `SourceLinkDto` carries
 * its own `rightsStatus` — the UI must never infer legality from a link merely existing.
 */

export const LINK_TYPE_LABELS: Record<string, string> = {
  download: 'Download',
  buy: 'Buy',
  borrow: 'Borrow from a library',
  listen: 'Listen (audiobook)',
};

export const RIGHTS_STATUS_LABELS: Record<string, string> = {
  public_domain: 'Public domain',
  open_license: 'Open license',
  copyrighted: 'Copyrighted',
  unknown: 'Status unknown',
};

export const RIGHTS_STATUS_TONE: Record<string, 'positive' | 'neutral' | 'caution'> = {
  public_domain: 'positive',
  open_license: 'positive',
  copyrighted: 'neutral',
  unknown: 'caution',
};

export function linkTypeLabel(type: string): string {
  return LINK_TYPE_LABELS[type] ?? type;
}

export function rightsStatusLabel(status: string): string {
  return RIGHTS_STATUS_LABELS[status] ?? status;
}

export function rightsStatusTone(status: string): 'positive' | 'neutral' | 'caution' {
  return RIGHTS_STATUS_TONE[status] ?? 'neutral';
}
