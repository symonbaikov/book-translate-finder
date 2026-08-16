# Interface languages

The site interface is available in the languages listed in `locales.ts`. Adding one is a single
file plus one line — no build step, no translation service, no API key.

## Adding a language

1. Copy `dictionaries/en.ts` to `dictionaries/<code>.ts`, rename the export, and translate every
   value. Change the type annotation to `Dictionary`.
2. Add the code to `LOCALES` and its own-language name to `LOCALE_NAMES` in `locales.ts`.
3. Add a loader line to `load-dictionary.ts`.

TypeScript will not compile until every key is present. That is deliberate: a dictionary missing
half its keys renders a page half in English, which is worse than not offering the language at all.

## Why the list is not "every language"

Because a language in the menu is a promise that the page will be in that language. Listing a
hundred locales that silently fall back to English would make the menu a lie — the same reason
this project does not show a shop it cannot link to or a price it does not know.

The European block — the 24 official EU languages, the rest of geographic Europe, and the
regional languages with a literature of their own — is in the list because each one has a
complete dictionary, not because of where it is spoken. The same bar applies to the next
language anyone adds.

## Notes for translators

- `{placeholders}` must survive translation; the names are meaningful (`{count}`, `{country}`).
- Some strings are sentence fragments that follow a link — `search.signInPrompt` continues after
  "Sign in", `bookmarks.signedOut` likewise. Translate them as continuations, and adjust the
  leading punctuation to what your language needs.
- Right-to-left scripts need no special markup; add the code to `RTL_LOCALES` in `locales.ts` and
  the page sets `dir="rtl"` itself.
- Book data — titles, authors, publishers, subjects — is never translated. It comes from the
  sources as it is, and inventing a translation of a book's title would be inventing data.
