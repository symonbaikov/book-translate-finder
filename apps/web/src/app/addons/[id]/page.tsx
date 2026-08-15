import type { Metadata } from 'next';
import { AddonCatalogBrowser } from '../../../components/AddonCatalogBrowser';
import { Page } from '../../../ui';

/**
 * Client-side end to end, same reasoning as `/addons` itself: which addon is installed, and
 * everything its catalog returns, must never reach this server (docs/adr/0010-addon-engine.md
 * §6). The addon's own name isn't known until the browser starts its transport, so the title
 * here stays generic rather than guessing.
 */
export const metadata: Metadata = {
  title: 'Addon catalog · Golden Library',
};

export default function AddonCatalogPage({ params }: { params: { id: string } }) {
  return (
    <Page>
      <AddonCatalogBrowser addonId={params.id} />
    </Page>
  );
}
