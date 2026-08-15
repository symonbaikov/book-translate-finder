'use client';

import { Toaster } from 'sonner';

/**
 * Where every settings popup appears. Mounted once, in the root layout, because preferences are
 * changed from the header, from a work card and from the shelf — three places that must not each
 * grow their own notification area.
 *
 * `richColors` is on so the four outcomes in `setting-change.ts` are told apart by colour before
 * a word is read; the status word is still there for anyone who cannot use the colour, and the
 * `aria-live` region `sonner` renders means a screen reader hears the change announced rather
 * than having to go looking for it.
 */
export function SettingsToaster({ dir }: { dir: 'ltr' | 'rtl' }) {
  return (
    <Toaster
      // Bottom, not top: the header holds the language selector, and a popup that covers the
      // control the reader just used hides the thing they may want to correct.
      position="bottom-right"
      dir={dir}
      theme="system"
      richColors
      closeButton
      // Two settings changed in quick succession are two separate facts and both are worth
      // reading; beyond that the stack is noise covering the page.
      visibleToasts={3}
    />
  );
}
