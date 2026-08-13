import { InvalidInputError } from '../errors/domain-error.js';

const PROVIDER_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Identifies a data source or link provider (e.g. `"open-library"`, `"internet-archive"`,
 * `"amazon"`). Deliberately NOT a closed enum: metadata sources are a small fixed set, but "buy"
 * and "borrow" providers are effectively open-ended (any retailer or library). The closed,
 * code-reviewed allowlist that actually matters for safety lives in `LinkPolicy`
 * (docs/legal-policy.md §2.1), not here — this VO only enforces a consistent kebab-case format.
 */
export class ProviderId {
  private constructor(private readonly id: string) {}

  static create(input: string): ProviderId {
    const normalized = input.trim().toLowerCase();
    if (!PROVIDER_ID_PATTERN.test(normalized)) {
      throw new InvalidInputError(
        `Provider id must be lowercase kebab-case (e.g. "open-library"), got: ${JSON.stringify(input)}`,
      );
    }
    return new ProviderId(normalized);
  }

  get value(): string {
    return this.id;
  }

  equals(other: ProviderId): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return this.id;
  }
}
