import { cookies } from 'next/headers';
import { BOOK_LANGUAGE_COOKIE, parseBookLanguage } from './book-language';

/** Server-only half of `book-language.ts` — see the note there on why they are separate files. */
export async function readBookLanguageFromCookie(): Promise<string | undefined> {
  return parseBookLanguage((await cookies()).get(BOOK_LANGUAGE_COOKIE)?.value);
}
