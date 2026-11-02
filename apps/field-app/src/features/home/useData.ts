import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { cacheGet, cacheSet } from '../../lib/db';
import type { HomeData, Lookups } from '../../lib/types';

/** Network first, falls back to the offline cache. */
async function load<T>(path: string, key: string): Promise<{ data?: T; offline: boolean }> {
  try { const d = await api<T>(path); await cacheSet(key, d); return { data: d, offline: false }; }
  catch { return { data: await cacheGet<T>(key), offline: true }; }
}

export function useFieldData() {
  const [home, setHome] = useState<HomeData>();
  const [lookups, setLookups] = useState<Lookups>();
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [h, l] = await Promise.all([load<HomeData>('/field/home', 'home'), load<Lookups>('/field/lookups', 'lookups')]);
      setHome(h.data); setLookups(l.data); setOffline(h.offline || l.offline); setLoading(false);
    })();
  }, []);
  return { home, lookups, offline, loading };
}
