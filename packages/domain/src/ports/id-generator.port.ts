/**
 * The only legitimate source of new entity ids for domain/application code (docs/rules.md §3) —
 * direct `crypto.randomUUID()` calls there are non-deterministic and untestable. The real
 * implementation generates UUIDv7 (time-sortable without exposing a raw sequence,
 * docs/architecture.md §8); nothing about this interface requires that specific format, so a
 * fake can hand out simple incrementing ids in tests.
 */
export interface IdGenerator {
  newId(): string;
}
