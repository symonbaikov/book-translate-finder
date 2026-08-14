import { z } from 'zod';

/**
 * The password floor mirrors `MIN_PASSWORD_LENGTH` in the application layer. Duplicated rather
 * than imported because `packages/contracts` is shared with the browser and must not depend on
 * the application layer — the value is asserted equal by a test instead.
 */
export const MIN_PASSWORD_LENGTH = 10;

export const RegisterRequestSchema = z.object({
  email: z.string().min(1).max(254),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(512),
  displayName: z.string().max(120).optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().min(1).max(254),
  // No length floor on login: an old account may predate a raised minimum, and rejecting it here
  // would lock people out with a validation error instead of an honest "wrong password".
  password: z.string().min(1).max(512),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const CurrentUserResponseSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      displayName: z.string(),
    })
    .nullable(),
  /** Whether this instance has Google sign-in configured — the button is hidden when it does not. */
  googleEnabled: z.boolean(),
});

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;

export const BookmarkItemSchema = z.object({
  workId: z.string(),
  originalTitle: z.string(),
  author: z.string(),
  coverUrl: z.string().url().nullable(),
  firstPublishedYear: z.number().int().nullable(),
  savedAt: z.string(),
});

export const BookmarksResponseSchema = z.object({
  bookmarks: z.array(BookmarkItemSchema),
});

export type BookmarksResponse = z.infer<typeof BookmarksResponseSchema>;

export const BookmarkStateResponseSchema = z.object({
  workId: z.string(),
  saved: z.boolean(),
});

export type BookmarkStateResponse = z.infer<typeof BookmarkStateResponseSchema>;
