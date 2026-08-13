/**
 * The only legitimate source of "now" for domain/application code (docs/rules.md §3) — direct
 * `Date.now()`/`new Date()` calls there are non-deterministic and untestable.
 */
export interface Clock {
  now(): Date;
}
