'use client';

import { useEffect, useState } from 'react';
import { AddonRegistry } from '@golden/addons';
import { loadAddons, type AddonLoadFailure } from './addon-runtime';

/**
 * The reader's addons, started once per mount of whatever asked for them.
 *
 * Deliberately not a context or a module-level singleton. A local addon holds an iframe and a
 * worker; keeping them alive for the lifetime of the tab would mean a page the reader is no longer
 * looking at still has a stranger's code running in it. Starting them where they are used, and
 * letting them go when that unmounts, costs a moment and is much easier to reason about.
 *
 * Returns an empty registry until the load settles, so a caller can render its own section as
 * "nothing yet" rather than branching on `null`.
 */
export function useAddons(): {
  registry: AddonRegistry;
  failures: readonly AddonLoadFailure[];
  loading: boolean;
} {
  const [state, setState] = useState<{
    registry: AddonRegistry;
    failures: readonly AddonLoadFailure[];
    loading: boolean;
  }>({ registry: new AddonRegistry([]), failures: [], loading: true });

  useEffect(() => {
    let live = true;
    void loadAddons().then((loaded) => {
      if (live) setState({ ...loaded, loading: false });
    });
    return () => {
      live = false;
    };
  }, []);

  return state;
}
