import { InvalidInputError } from '../errors/domain-error.js';

/**
 * Links our id for a `work` or `edition` to the id it has in one external source (e.g. Open
 * Library's `/works/OL267096W`). `(sourceName, externalId)` is unique in `external_ref`
 * (docs/architecture.md §3.2) — this is the join key idempotent sync upserts on.
 */
export class ExternalRef {
  private constructor(
    readonly sourceName: string,
    readonly externalId: string,
  ) {}

  static create(sourceName: string, externalId: string): ExternalRef {
    if (!sourceName.trim()) throw new InvalidInputError('ExternalRef.sourceName must not be empty');
    if (!externalId.trim()) throw new InvalidInputError('ExternalRef.externalId must not be empty');
    return new ExternalRef(sourceName.trim(), externalId.trim());
  }

  equals(other: ExternalRef): boolean {
    return this.sourceName === other.sourceName && this.externalId === other.externalId;
  }

  toString(): string {
    return `${this.sourceName}:${this.externalId}`;
  }
}
