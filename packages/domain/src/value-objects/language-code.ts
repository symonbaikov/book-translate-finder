import { InvalidInputError } from '../errors/domain-error.js';
import { LANGUAGE_NAMES, type LanguageNames } from './language-names.js';

/**
 * A validated ISO 639-1 language code. Construction is the only place that validates — once you
 * hold a `LanguageCode`, every other layer can trust it without re-checking (docs/rules.md §3).
 */
export class LanguageCode {
  private constructor(private readonly code: string) {}

  static create(input: string): LanguageCode {
    const normalized = input.trim().toLowerCase();
    if (!LANGUAGE_NAMES.has(normalized)) {
      throw new InvalidInputError(`Unknown ISO 639-1 language code: ${JSON.stringify(input)}`);
    }
    return new LanguageCode(normalized);
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
