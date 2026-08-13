import { InvalidInputError } from '@btf/domain';
import type { z } from 'zod';

/**
 * Fail-fast-on-input (docs/rules.md §3): every controller validates against a `packages/contracts`
 * Zod schema before calling a use case. Throwing `InvalidInputError` — not letting `ZodError`
 * escape — keeps this on the same `DomainErrorFilter` path every other error goes through,
 * instead of falling into `UnhandledErrorFilter`'s generic 500.
 */
export function parseOrThrow<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new InvalidInputError(`Invalid request: ${issues}`);
  }
  return result.data;
}
