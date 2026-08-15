'use client';

import { useEffect, useState } from 'react';
import { PluginRegistry, activeSourceProviders, type SourceProviderPlugin } from '@golden/plugins';
import { listCustomSources } from './custom-source-providers';

/**
 * The reader's enabled custom sources, resolved into plugins each time `active` becomes true.
 *
 * Reads `localStorage` in an effect rather than during render, same reasoning as `useAddons`: this
 * runs during SSR too, where `window` does not exist, so the list starts empty and fills in once
 * the component is on the client.
 *
 * Re-reads on every `active` transition rather than once per mount because `Sheet` — the edition
 * links panel this renders inside — deliberately keeps its children mounted after the first open,
 * to avoid re-fetching the server-side links on every toggle. That is the right call for those
 * (network, rate-limited); a `localStorage` read is neither, so caching it for the panel's whole
 * lifetime would mean a source added after the first open never appears without a full page reload.
 */
export function useCustomSourceProviders(active: boolean): readonly SourceProviderPlugin[] {
  const [providers, setProviders] = useState<readonly SourceProviderPlugin[]>([]);

  useEffect(() => {
    if (!active) return;
    setProviders(new PluginRegistry(activeSourceProviders(listCustomSources())).all());
  }, [active]);

  return providers;
}
