/**
 * Join class names, dropping anything falsy.
 *
 * Exists because CSS Modules are typed as an index signature: under `noUncheckedIndexedAccess`
 * every `styles.foo` is `string | undefined`, and a template literal would happily paste the word
 * "undefined" into the class list. One function beats a non-null assertion at every call site.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
