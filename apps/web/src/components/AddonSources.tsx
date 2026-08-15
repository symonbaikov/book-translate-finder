'use client';

import { useEffect, useState } from 'react';
import { settleAddons, type AddonOutcome, type AddonSource } from '@golden/addons';
import { useT } from '../i18n/I18nProvider';
import { useAddons } from '../lib/use-addons';
import { Badge, Section } from '../ui';
import styles from './AddonResults.module.css';

/** How long the whole row waits. One slow addon must not hold the page (ADR-0010 §7). */
const TIMEOUT_MS = 12_000;

/**
 * Ways to get this book that came from the reader's own addons.
 *
 * Rendered apart from the instance's own links, and every row under the name of the addon that
 * produced it. That attribution is the safety property of this section, not decoration: the engine
 * does not look at what an addon returns (ADR-0009), so an unlabelled row would be this instance
 * appearing to vouch for something it knows nothing about.
 *
 * `ids` are candidates rather than one id, because addons identify books differently and this
 * application's own work id means nothing to any of them. Whichever candidate an addon's declared
 * `idPrefixes` accept is the one it is asked about; an addon that declares none is asked with the
 * first.
 */
export function AddonSources({ ids }: { ids: readonly string[] }) {
  const t = useT();
  const { registry, loading } = useAddons();
  const [outcomes, setOutcomes] = useState<
    AddonOutcome<{ sources: readonly AddonSource[]; dropped: number }>[]
  >([]);

  useEffect(() => {
    if (loading || ids.length === 0) return;
    let live = true;

    const asked = ids
      .flatMap((id) => registry.supporting('source', 'book', id).map((addon) => ({ addon, id })))
      // One question per addon: the first id it accepts. Asking the same addon about the same book
      // under three spellings would triple its traffic for one answer.
      .filter(
        (candidate, index, all) =>
          all.findIndex(
            (other) => other.addon.transport.manifest.id === candidate.addon.transport.manifest.id,
          ) === index,
      );

    void settleAddons(
      asked.map((candidate) => candidate.addon),
      async (addon) => {
        const match = asked.find((candidate) => candidate.addon === addon);
        return addon.transport.getSources('book', match?.id ?? ids[0] ?? '');
      },
      { timeoutMs: TIMEOUT_MS },
    ).then((settled) => {
      if (live) setOutcomes(settled);
    });

    return () => {
      live = false;
    };
  }, [registry, loading, ids]);

  const answered = outcomes.filter(
    (outcome) => outcome.status === 'failed' || outcome.value.sources.length > 0,
  );
  // No addons, or none of them had anything: no section at all. An empty heading is furniture.
  if (answered.length === 0) return null;

  return (
    <Section title={t('addons.sourcesTitle')}>
      {answered.map((outcome) => (
        <div key={outcome.addonId} className={styles.group}>
          <p className={styles.attribution}>
            <Badge tone="neutral">{t('addons.via', { name: outcome.addonName })}</Badge>
          </p>
          {outcome.status === 'failed' ? (
            <p className={styles.failure}>
              {t('addons.failedToStart', { name: outcome.addonName, reason: outcome.reason })}
            </p>
          ) : (
            <>
              <ul className={styles.sources}>
                {outcome.value.sources.map((source) => (
                  <li key={source.url} className={styles.source}>
                    {/* `noreferrer` as well as `noopener`: which page the reader came from is not
                        the addon's business, and this is the one link we hand them. */}
                    <a
                      className={styles.sourceName}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.name}
                    </a>
                    {source.title ? (
                      <span className={styles.sourceTitle}>{source.title}</span>
                    ) : null}
                    {source.format ? <Badge tone="neutral">{source.format}</Badge> : null}
                  </li>
                ))}
              </ul>
              {outcome.value.dropped > 0 ? (
                <p className={styles.note}>
                  {t('addons.unreadable', { count: outcome.value.dropped })}
                </p>
              ) : null}
            </>
          )}
        </div>
      ))}
    </Section>
  );
}
