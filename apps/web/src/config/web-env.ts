import { z } from 'zod';

// apps/web must not depend on packages/infrastructure (docs/architecture.md §2.5), so it parses
// its own tiny, client-safe env surface here instead of reusing loadEnv/baseEnvSchema.
const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Optional, server-only (deliberately NOT NEXT_PUBLIC_-prefixed, so it's never inlined into the
  // browser bundle — Next.js reads it fresh from the real process.env on every server-side
  // request instead). Needed only when the browser-facing URL and the server-to-server URL
  // genuinely differ, which is exactly the self-host Docker case: NEXT_PUBLIC_API_URL must be
  // reachable from the user's browser (e.g. the public domain), but the web container's own SSR
  // fetches need the api *service name* inside the compose network (`http://api:3001`) — found
  // live, docs/plan.md §1.6: the SSR work-card page silently failed in the self-host compose
  // because it was reusing NEXT_PUBLIC_API_URL and resolving `localhost:3001` to the web
  // container itself. Local dev doesn't need this at all: web and api both run on the host there,
  // so NEXT_PUBLIC_API_URL already resolves correctly from both contexts.
  INTERNAL_API_URL: z.string().url().optional(),
});

export const webEnv = webEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
});
