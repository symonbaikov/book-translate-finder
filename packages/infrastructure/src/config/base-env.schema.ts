import { z } from 'zod';

/**
 * Variables every long-running process (api, worker) needs, regardless of its own extras.
 * apps/web is intentionally excluded — it must not depend on packages/infrastructure
 * (docs/architecture.md §2.5) and only needs a couple of NEXT_PUBLIC_* values of its own.
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CONTACT_URL: z.string().url(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

/**
 * Parses `source` against `schema` and either returns a fully typed, validated config or throws
 * a single readable error listing every problem at once. Call this exactly once per process, at
 * startup — see docs/rules.md §3 "Явное над неявным": nothing else in the codebase reads
 * `process.env` directly.
 */
export function loadEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  source: Record<string, string | undefined> = process.env,
): z.infer<TSchema> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}
