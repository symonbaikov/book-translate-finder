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
  // Where *this* instance's operator publishes ready-made custom-source templates — a Telegram
  // channel, a wiki page, a gist. Optional, and unset in this repository on purpose: the project
  // links to no catalogue of sources, which is a property of the code rather than a sentence in
  // the README, and it is what keeps the runtime legal to publish (ADR-0009, legal-policy.md
  // §I-3). Unset means the panel is not rendered and the onboarding tour skips that step; whoever
  // sets it is choosing what their own readers are pointed at.
  NEXT_PUBLIC_COMMUNITY_PRESETS_URL: z.string().url().optional(),
});

export const webEnv = webEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  // Spelled out rather than read from a variable: Next.js inlines `NEXT_PUBLIC_*` into the browser
  // bundle by matching this exact text, and `process.env[name]` would arrive as undefined there.
  NEXT_PUBLIC_COMMUNITY_PRESETS_URL: process.env.NEXT_PUBLIC_COMMUNITY_PRESETS_URL,
});
