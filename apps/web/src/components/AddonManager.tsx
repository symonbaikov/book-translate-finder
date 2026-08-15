'use client';

import { useCallback, useEffect, useState } from 'react';
import { installHttpAddon, type AddonDescriptor } from '@golden/addons';
import { useT } from '../i18n/I18nProvider';
import { consentFor, previewLocalAddon, type AddonConsent } from '../lib/addon-runtime';
import {
  DuplicateAddonError,
  addAddon,
  listAddons,
  moveAddon,
  removeAddon,
  setAddonEnabled,
  type StoredAddon,
} from '../lib/installed-addons';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { Badge, Button, ButtonLink, Card, Field, Stack, TextInput } from '../ui';
import styles from './AddonManager.module.css';

/**
 * Installing, ordering and removing addons.
 *
 * Three things about this screen are load-bearing rather than decorative.
 *
 * **Installing takes two steps.** Pasting an address reads the manifest and stops; nothing is
 * stored until the reader has seen who the addon will talk to and pressed Install. An addon is
 * somebody else's code or somebody else's server, and "paste, done" would be asking for consent
 * after taking it.
 *
 * **Both transports install through the same two steps and the same consent card.** They differ in
 * one sentence — an HTTP addon's operator sees the reader, a local one cannot — and that sentence is
 * the whole reason a reader might choose one over the other, so it belongs on the card rather than
 * in a document nobody opens.
 *
 * **Every change announces itself.** These preferences live in this browser and take effect with no
 * Save button, so the popup is the only confirmation there is — and it has to distinguish "stored"
 * from "the browser refused to store it", because nothing here keeps the list in memory as a
 * fallback (CLAUDE.md, settings popups).
 */

interface Pending {
  readonly consent: AddonConsent;
  readonly descriptor: AddonDescriptor;
}

export function AddonManager() {
  const t = useT();
  const announce = useSettingChangeToast();
  const [addons, setAddons] = useState<StoredAddon[]>([]);
  const [address, setAddress] = useState('');
  const [bundleUrl, setBundleUrl] = useState('');
  const [integrity, setIntegrity] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => setAddons(listAddons()), []);
  useEffect(refresh, [refresh]);

  function reject(reason: string): void {
    setError(reason);
    announce({
      setting: 'addons',
      outcome: 'failed',
      title: t('settings.addons.title'),
      detail: t('settings.addons.rejected', { reason }),
    });
  }

  /** Both forms end here: read whatever the addon says about itself, then ask the reader. */
  async function propose(read: () => Promise<Pending>): Promise<void> {
    setChecking(true);
    setError(null);
    try {
      setPending(await read());
    } catch (caught) {
      reject(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setChecking(false);
    }
  }

  function install({ consent, descriptor }: Pending): void {
    const { manifest } = consent;
    try {
      const { persisted } = addAddon({
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        descriptor,
        hosts: consent.hosts,
        enabled: true,
      });
      setPending(null);
      setAddress('');
      setBundleUrl('');
      setIntegrity('');
      refresh();
      announce({
        setting: 'addons',
        outcome: outcomeOfWrite(persisted, 'set'),
        title: t('settings.addons.title'),
        detail: t('settings.addons.installed', {
          name: manifest.name,
          hosts: consent.hosts.join(', '),
        }),
      });
    } catch (caught) {
      reject(caught instanceof DuplicateAddonError ? caught.message : String(caught));
    }
  }

  function remove(addon: StoredAddon): void {
    const persisted = removeAddon(addon.id);
    refresh();
    announce({
      setting: 'addons',
      outcome: outcomeOfWrite(persisted, 'clear'),
      title: t('settings.addons.title'),
      detail: t('settings.addons.removed', { name: addon.name }),
    });
  }

  function toggle(addon: StoredAddon): void {
    const next = !addon.enabled;
    const persisted = setAddonEnabled(addon.id, next);
    refresh();
    announce({
      setting: 'addons',
      // Turning one off is not "cleared": the addon and its settings are still there, and telling
      // the reader otherwise would suggest they have to install it again.
      outcome: outcomeOfWrite(persisted, 'set'),
      title: t('settings.addons.title'),
      detail: next
        ? t('settings.addons.enabled', { name: addon.name })
        : t('settings.addons.disabled', { name: addon.name }),
    });
  }

  function move(addon: StoredAddon, direction: -1 | 1): void {
    const result = moveAddon(addon.id, direction);
    // Already at the end it was asked to move towards. Nothing changed, so nothing is announced —
    // a popup that says "no change" is a popup that trains people to ignore popups.
    if (!result) return;
    const reordered = listAddons();
    setAddons(reordered);
    announce({
      setting: 'addons',
      outcome: outcomeOfWrite(result.persisted, 'set'),
      title: t('settings.addons.title'),
      detail: t('settings.addons.reordered', {
        name: addon.name,
        position: reordered.findIndex((candidate) => candidate.id === addon.id) + 1,
        total: reordered.length,
      }),
    });
  }

  return (
    <>
      <p className={styles.intro}>{t('addons.intro')}</p>

      <h2>{t('addons.fromServer')}</h2>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          const url = address.trim();
          void propose(async () => {
            const transport = await installHttpAddon(url);
            return {
              consent: consentFor(transport.manifest, url, 'http'),
              descriptor: { kind: 'http', manifestUrl: url },
            };
          });
        }}
      >
        <Field
          className={styles.address}
          label={t('addons.addressLabel')}
          htmlFor="addon-address"
          hint={t('addons.addressHint')}
        >
          <TextInput
            id="addon-address"
            type="url"
            inputMode="url"
            placeholder="https://addon.example/manifest.json"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
          />
        </Field>
        <Button type="submit" variant="primary" loading={checking}>
          {checking ? t('addons.checking') : t('addons.continue')}
        </Button>
      </form>

      <h2>{t('addons.fromFile')}</h2>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          const url = bundleUrl.trim();
          const hash = integrity.trim();
          void propose(async () => ({
            consent: await previewLocalAddon(url, hash),
            descriptor: { kind: 'local', bundleUrl: url, integrity: hash },
          }));
        }}
      >
        <Field
          className={styles.address}
          label={t('addons.bundleLabel')}
          htmlFor="addon-bundle"
          hint={t('addons.bundleHint')}
        >
          <TextInput
            id="addon-bundle"
            type="url"
            inputMode="url"
            placeholder="https://addon.example/addon.js"
            value={bundleUrl}
            onChange={(event) => setBundleUrl(event.target.value)}
            required
          />
        </Field>
        <Field
          className={styles.address}
          label={t('addons.integrityLabel')}
          htmlFor="addon-integrity"
          hint={t('addons.integrityHint')}
        >
          <TextInput
            id="addon-integrity"
            placeholder="sha256-…"
            value={integrity}
            onChange={(event) => setIntegrity(event.target.value)}
            required
          />
        </Field>
        <Button type="submit" variant="primary" loading={checking}>
          {checking ? t('addons.checking') : t('addons.continue')}
        </Button>
      </form>

      {error ? <p className={styles.failure}>{error}</p> : null}

      {pending ? (
        <Card>
          <div className={styles.consent}>
            <h2>{t('addons.consentTitle', { name: pending.consent.manifest.name })}</h2>
            <ul className={styles.consentPoints}>
              <li>
                {pending.consent.hosts.length > 0
                  ? t('addons.consentHosts', { hosts: pending.consent.hosts.join(', ') })
                  : t('addons.consentNoHosts')}
              </li>
              <li>
                {pending.consent.seesTheReader
                  ? t('addons.consentSeesYou')
                  : t('addons.consentSandboxed')}
              </li>
              <li>{t('addons.consentNotVetted')}</li>
            </ul>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => install(pending)}>
                {t('addons.install')}
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)}>
                {t('addons.cancel')}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Stack>
        <h2>{t('addons.installedHeading')}</h2>
        {addons.length === 0 ? (
          <p className={styles.empty}>{t('addons.none')}</p>
        ) : (
          <>
            <p className={styles.hosts}>{t('addons.priorityHint')}</p>
            <ul className={styles.list}>
              {addons.map((addon, index) => (
                <li key={addon.id}>
                  <Card className={addon.enabled ? undefined : styles.disabled}>
                    <div className={styles.row}>
                      <div className={styles.identity}>
                        <div className={styles.name}>
                          {addon.name}
                          {addon.enabled ? null : <Badge tone="neutral">{t('addons.off')}</Badge>}
                        </div>
                        <div className={styles.version}>
                          {addon.version} ·{' '}
                          {addon.descriptor.kind === 'http'
                            ? t('addons.fromServer')
                            : t('addons.fromFile')}
                        </div>
                        <div className={styles.hosts}>
                          {addon.hosts.length > 0
                            ? t('addons.consentHosts', { hosts: addon.hosts.join(', ') })
                            : t('addons.consentNoHosts')}
                        </div>
                      </div>
                      <div className={styles.actions}>
                        {addon.enabled ? (
                          <ButtonLink variant="ghost" href={`/addons/${addon.id}`}>
                            {t('addons.browse')}
                          </ButtonLink>
                        ) : null}
                        <Button
                          variant="ghost"
                          onClick={() => move(addon, -1)}
                          disabled={index === 0}
                        >
                          {t('addons.moveUp')}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => move(addon, 1)}
                          disabled={index === addons.length - 1}
                        >
                          {t('addons.moveDown')}
                        </Button>
                        <Button variant="ghost" onClick={() => toggle(addon)}>
                          {addon.enabled ? t('addons.disable') : t('addons.enable')}
                        </Button>
                        <Button variant="ghost" onClick={() => remove(addon)}>
                          {t('addons.remove')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </Stack>
    </>
  );
}
