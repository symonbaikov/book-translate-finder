import { languageName } from '../lib/language-names';
import { ButtonLink } from '../ui';
import type { Translate } from '../i18n/dictionary';
import styles from './TranslationAnswer.module.css';

/**
 * The one question this project exists to answer, answered for the reader personally rather than
 * as a list of forty-seven language names they have to scan.
 *
 * "Translated into: Arabic, Bulgarian, Chinese, …" is a fact about the book. "There is a Ukrainian
 * translation" is an answer to the person reading, and it is the reason they opened the page. The
 * list stays right below — this only says which entry in it is theirs.
 *
 * Three cases, and the third is not a failure to report: a reader who learns in one line that no
 * translation into their language exists has been served just as well as one who learns it does.
 * What would fail them is a page that makes them work it out themselves.
 */
export function TranslationAnswer({
  readerLanguage,
  originalLanguage,
  translatedLanguages,
  editionsHref,
  locale,
  t,
}: {
  /** The language this reader wants the book *in* — not the language of the interface. */
  readerLanguage: string;
  originalLanguage: string;
  translatedLanguages: readonly string[];
  /** The edition list already filtered to `readerLanguage`. */
  editionsHref: string;
  locale: string;
  t: Translate;
}) {
  const name = languageName(readerLanguage, locale);
  const isOriginal = readerLanguage === originalLanguage;
  const isTranslated = translatedLanguages.includes(readerLanguage);

  // The original counts as available even when no translation exists: someone whose language is
  // the book's own language can read it, and telling them "no translation found" would be true
  // and useless.
  const available = isOriginal || isTranslated;

  return (
    <p className={available ? styles.answer : styles.answerMissing}>
      <span className={styles.sentence}>
        {isOriginal
          ? t('work.yourLanguage.original', { language: name })
          : isTranslated
            ? t('work.yourLanguage.yes', { language: name })
            : t('work.yourLanguage.no', { language: name })}
      </span>
      {available && (
        <ButtonLink variant="primary" size="sm" href={editionsHref}>
          {t('work.yourLanguage.show', { language: name })}
        </ButtonLink>
      )}
    </p>
  );
}
