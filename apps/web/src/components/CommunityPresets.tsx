'use client';

import { useT } from '../i18n/I18nProvider';
import { tourTarget } from '../lib/tour-targets';
import { ButtonLink } from '../ui';
import styles from './CommunityPresets.module.css';

/**
 * A way out of the blank form: wherever this instance's operator publishes ready-made templates.
 *
 * The address is configuration, not code — `NEXT_PUBLIC_COMMUNITY_PRESETS_URL` — and when it is
 * unset nothing is rendered and the onboarding tour skips the step. That is the whole reason it is
 * an environment variable: this repository links to no catalogue of sources, and the argument that
 * keeps the project legal to publish is exactly that structural absence, not a promise in prose
 * ([ADR-0009](docs/adr/0009-blind-core-link-policy-scope.md), legal-policy.md §I-3). Whoever runs a
 * copy chooses what their readers are pointed at, and answers for it.
 *
 * The caption says so plainly rather than tastefully. A reader about to paste a stranger's URL
 * template into their own browser is owed the two facts that matter: nobody here checked it, and
 * it will search from their machine.
 */
export function CommunityPresets({ url }: { url: string }) {
  const t = useT();

  return (
    <div className={styles.panel}>
      <ButtonLink
        {...tourTarget('communityPresets')}
        className={styles.link}
        variant="secondary"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <TelegramMark />
        {t('customSources.presets')}
      </ButtonLink>
      <p className={styles.caption}>{t('customSources.presetsCaption')}</p>
    </div>
  );
}

/** Inlined for the same reason as the footer's GitHub mark: no third-party request for one glyph. */
function TelegramMark() {
  return (
    <svg
      className={styles.mark}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.94 4.3 18.9 19.1c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.26 2.18c-.25.25-.46.46-.94.46l.33-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19L6.98 13.02l-4.63-1.45c-1-.32-1.03-1.01.21-1.5l18.1-6.98c.84-.3 1.57.2 1.28 1.2Z" />
    </svg>
  );
}
