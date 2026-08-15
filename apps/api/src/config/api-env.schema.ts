import { baseEnvSchema } from '@golden/infrastructure';
import { z } from 'zod';

export const apiEnvSchema = baseEnvSchema.extend({
  API_PORT: z.coerce.number().int().positive().default(3001),
  PUBLIC_URL: z.string().url(),
  ADMIN_TOKEN: z
    .string()
    .min(16, 'ADMIN_TOKEN must be at least 16 characters — guards POST /api/sync/:source'),
  // Optional: an instance without these keys still runs, just with the corresponding
  // provider unregistered (docs/architecture.md §9.2) — this is normal for self-hosting.
  GOOGLE_BOOKS_API_KEY: z.string().optional(),
  WORLDCAT_API_KEY: z.string().optional(),
  /**
   * Google sign-in. Both are needed or neither is used: an instance with only half configured
   * would render a button that always fails, so the button is hidden unless both are present.
   * A Docker self-host with no Google project therefore simply offers email + password.
   */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /** SMTP connection string. Unset means no welcome email is sent — registration still works. */
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default('Golden Library <noreply@localhost>'),
  /** Where the browser lives, for OAuth redirects back out of this API. */
  WEB_BASE_URL: z.string().url().default('http://localhost:3000'),
  /**
   * Module B's server-side bookshop lookup (`GET /api/stores/nearby`). Off by default, and that
   * default is the privacy decision, not a convenience: the web app already runs the same lookup
   * in the reader's browser so their coordinates never arrive here (docs/adr/0007). Turning this
   * on means accepting locations into this instance's logs and its outbound requests — worth it
   * only for a client that cannot do the lookup itself.
   */
  ENABLE_SERVER_GEO_LOOKUP: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  /**
   * Global per-IP request budget (docs/plan.md §1.4), counted across every /api route. A single
   * active browsing session already fires several of these per action — search polling, cover
   * images, edition links, prices — so the default is set well above one session's worst case
   * rather than tuned to a single endpoint.
   */
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
