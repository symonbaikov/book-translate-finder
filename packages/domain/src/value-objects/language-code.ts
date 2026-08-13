import { InvalidInputError } from '../errors/domain-error.js';
import { ISO_639_2B_TO_1 } from './iso-639-2-to-1.js';
import { LANGUAGE_NAMES, type LanguageNames } from './language-names.js';

/**
 * A validated language code, canonically stored as ISO 639-1 (2-letter) — but `create` also
 * accepts ISO 639-2/B (3-letter, e.g. `"eng"`, `"rus"`) and normalizes it, since that's what
 * Open Library and MARC records actually report (see the comment on `ISO_639_2B_TO_1`).
 * Construction is the only place that validates or normalizes — once you hold a `LanguageCode`,
 * every other layer can trust it's the canonical 2-letter form without re-checking
 * (docs/rules.md §3).
 */
export class LanguageCode {
  private constructor(private readonly code: string) {}

  static create(input: string): LanguageCode {
    const normalized = input.trim().toLowerCase();
    if (LANGUAGE_NAMES.has(normalized)) {
      return new LanguageCode(normalized);
    }
    const mapped = ISO_639_2B_TO_1.get(normalized);
    if (mapped) {
      return new LanguageCode(mapped);
    }
    throw new InvalidInputError(`Unknown ISO 639-1/639-2 language code: ${JSON.stringify(input)}`);
  }

  get value(): string {
    return this.code;
  }

  get names(): LanguageNames {
    // Safe: constructor already guarantees `code` is a key of LANGUAGE_NAMES.
    return LANGUAGE_NAMES.get(this.code) as LanguageNames;
  }

  equals(other: LanguageCode): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }
}
