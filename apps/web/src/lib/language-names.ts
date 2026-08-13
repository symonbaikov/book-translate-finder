/**
 * Human-readable Russian language names for ISO 639-1 codes via the platform's own
 * `Intl.DisplayNames` — no dependency on `packages/domain`'s LANGUAGE_NAMES (apps/web may only
 * import `@btf/contracts`, docs/architecture.md §2 boundaries) and no hand-maintained copy of the
 * same table. Works identically in Node (SSR) and the browser. Falls back to the raw code for
 * anything the runtime can't name, so an unexpected code degrades to exactly what the UI showed
 * before this existed.
 */
const displayNames = new Intl.DisplayNames(['ru'], { type: 'language' });

export function languageName(code: string): string {
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}
