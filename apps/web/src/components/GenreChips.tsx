import { SubjectsResponseSchema } from '@golden/contracts';
import { webEnv } from '../config/web-env';
import { getT } from '../i18n/server';
import { ChipLink, Cluster, Section } from '../ui';

/** One row of chips, not a tag cloud: past a dozen the reader is reading a list, not choosing. */
const HOME_CHIPS = 12;
/** The API caches this list for fifteen minutes; there is nothing to gain by asking more often. */
const REVALIDATE_SECONDS = 15 * 60;

/**
 * The genres above the catalogue, as a row of chips.
 *
 * Every chip opens the genre catalogue at `/subjects/{tag}`, which applies the reader's book
 * language on its own — so this row stays a plain list of links and does not ask a question that
 * page has already answered.
 *
 * Server-rendered, unlike the book rows below it: the tags come from what this instance has
 * already fetched, they change on the scale of a sync rather than a page view, and a row of
 * navigation that appears a moment after the page does is a row that moves the search box.
 *
 * Genres the reader hid from their recommendations are deliberately still shown. Hiding one says
 * "stop suggesting books because of this", not "pretend this shelf does not exist" — and a
 * catalogue that quietly omits shelves is a catalogue that cannot be trusted to be complete.
 */
export async function GenreChips() {
  const t = await getT();
  const subjects = await fetchSubjects();
  if (subjects.length === 0) return null;

  return (
    <Section title={t('home.genres')} note={t('home.genresBlurb')}>
      <Cluster>
        {subjects.map((entry) => (
          <ChipLink
            key={entry.subject}
            href={`/subjects/${encodeURIComponent(entry.subject)}`}
            count={entry.workCount}
          >
            {entry.subject}
          </ChipLink>
        ))}
      </Cluster>
    </Section>
  );
}

/**
 * An empty list on every failure: a fresh instance has no tags yet, and neither that nor an API
 * that did not answer is worth an error box above the search field.
 */
async function fetchSubjects(): Promise<{ subject: string; workCount: number }[]> {
  try {
    const url = new URL('/api/subjects', webEnv.INTERNAL_API_URL ?? webEnv.NEXT_PUBLIC_API_URL);
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const parsed = SubjectsResponseSchema.parse(await res.json());
    return parsed.subjects.slice(0, HOME_CHIPS);
  } catch {
    return [];
  }
}
