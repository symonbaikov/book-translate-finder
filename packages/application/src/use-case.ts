/**
 * Marker shape every use case implements: one class, one `execute` method — see docs/rules.md
 * §1 (Single Responsibility) and §2 (idempotency lives inside `execute`, not around it).
 * `TInput`/`TOutput` are the use case's own types, built from domain entities and value
 * objects — never from HTTP DTOs or ORM rows.
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
