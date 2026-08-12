import { z } from 'zod';

// apps/web must not depend on packages/infrastructure (docs/architecture.md §2.5), so it parses
// its own tiny, client-safe env surface here instead of reusing loadEnv/baseEnvSchema.
const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const webEnv = webEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
