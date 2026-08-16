'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  DuplicateCustomSourceError,
  addCustomSource,
  listCustomSources,
  removeCustomSource,
  setCustomSourceEnabled,
  type StoredCustomSource,
} from '../lib/custom-source-providers';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { tourTarget } from '../lib/tour-targets';
import { useT } from '../i18n/I18nProvider';
import { webEnv } from '../config/web-env';
import { Badge, Button, Card, Field, Stack, TextInput } from '../ui';
import { CommunityPresets } from './CommunityPresets';
import styles from './CustomSourceManager.module.css';

/**
 * Adding, toggling and removing custom sources.
 *
 * One step, not two, unlike `AddonManager`'s install flow: an addon is somebody else's code that
 * will run and talk to hosts the reader has not seen yet, so a consent card is load-bearing there.
 * A custom source is just a URL template the reader wrote themselves — there is nothing about it
 * for this screen to disclose that the form fields did not already show them.
 *
 * Every change announces itself through the same toast as every other setting in this app, for the
 * same reason: these live in `localStorage` with no Save button, so the popup is the only
 * confirmation there is, and it has to say if the browser refused to keep the value.
 */
export function CustomSourceManager() {
  const t = useT();
  const announce = useSettingChangeToast();
  const [sources, setSources] = useState<StoredCustomSource[]>([]);
  const [name, setName] = useState('');
  const [urlTemplate, setUrlTemplate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => setSources(listCustomSources()), []);
  useEffect(refresh, [refresh]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    try {
      const { persisted } = addCustomSource({ name, urlTemplate });
      setName('');
      setUrlTemplate('');
      refresh();
      announce({
        setting: 'customSources',
        outcome: outcomeOfWrite(persisted, 'set'),
        title: t('settings.customSources.title'),
        detail: t('settings.customSources.added', { name }),
      });
    } catch (caught) {
      const message =
        caught instanceof DuplicateCustomSourceError || caught instanceof Error
          ? caught.message
          : String(caught);
      setError(message);
      announce({
        setting: 'customSources',
        outcome: 'failed',
        title: t('settings.customSources.title'),
        detail: t('settings.customSources.rejected', { reason: message }),
      });
    }
  }

  function remove(source: StoredCustomSource): void {
    const persisted = removeCustomSource(source.id);
    refresh();
    announce({
      setting: 'customSources',
      outcome: outcomeOfWrite(persisted, 'clear'),
      title: t('settings.customSources.title'),
      detail: t('settings.customSources.removed', { name: source.name }),
    });
  }

  function toggle(source: StoredCustomSource): void {
    const next = !source.enabled;
    const persisted = setCustomSourceEnabled(source.id, next);
    refresh();
    announce({
      setting: 'customSources',
      outcome: outcomeOfWrite(persisted, 'set'),
      title: t('settings.customSources.title'),
      detail: next
        ? t('settings.customSources.enabled', { name: source.name })
        : t('settings.customSources.disabled', { name: source.name }),
    });
  }

  return (
    <>
      <p className={styles.intro}>{t('customSources.intro')}</p>

      {/* Rendered only where an operator configured somewhere to send readers — see
          CommunityPresets and config/web-env.ts. */}
      {webEnv.NEXT_PUBLIC_COMMUNITY_PRESETS_URL ? (
        <CommunityPresets url={webEnv.NEXT_PUBLIC_COMMUNITY_PRESETS_URL} />
      ) : null}

      <form className={styles.form} onSubmit={submit} {...tourTarget('customSourceForm')}>
        <Field
          className={styles.nameField}
          label={t('customSources.nameLabel')}
          htmlFor="custom-source-name"
        >
          <TextInput
            id="custom-source-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field
          className={styles.templateField}
          label={t('customSources.templateLabel')}
          htmlFor="custom-source-template"
          hint={t('customSources.templateHint')}
        >
          <TextInput
            id="custom-source-template"
            type="url"
            inputMode="url"
            placeholder="https://example.com/search?q={query}"
            value={urlTemplate}
            onChange={(event) => setUrlTemplate(event.target.value)}
            required
          />
        </Field>
        <Button type="submit" variant="primary">
          {t('customSources.add')}
        </Button>
      </form>

      {error ? <p className={styles.failure}>{error}</p> : null}

      <Stack {...tourTarget('customSourceList')}>
        <h2>{t('customSources.listHeading')}</h2>
        {sources.length === 0 ? (
          <p className={styles.empty}>{t('customSources.none')}</p>
        ) : (
          <ul className={styles.list}>
            {sources.map((source) => (
              <li key={source.id}>
                <Card className={source.enabled ? undefined : styles.disabled}>
                  <div className={styles.row}>
                    <div className={styles.identity}>
                      <div className={styles.name}>
                        {source.name}
                        {source.enabled ? null : (
                          <Badge tone="neutral">{t('customSources.off')}</Badge>
                        )}
                      </div>
                      <div className={styles.template}>{source.urlTemplate}</div>
                    </div>
                    <div className={styles.actions}>
                      <Button variant="ghost" onClick={() => toggle(source)}>
                        {source.enabled ? t('customSources.disable') : t('customSources.enable')}
                      </Button>
                      <Button variant="ghost" onClick={() => remove(source)}>
                        {t('customSources.remove')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Stack>
    </>
  );
}
