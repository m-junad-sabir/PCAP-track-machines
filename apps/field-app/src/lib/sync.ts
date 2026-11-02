import { api, ApiError, session } from './api';
import { getFiles, listInspections, markUploaded, saveInspection } from './db';

let running = false;
export const SYNC_EVENT = 'pcap-sync';

/** Uploads every pending inspection (record first, then its files). Network failures stay 'pending'. */
export async function syncAll() {
  const user = session.user;
  if (running || !navigator.onLine || !session.token || !user) return;
  running = true;
  try {
    const items = (await listInspections(user.id)).filter((i) => i.syncStatus === 'pending');
    for (const it of items) {
      try {
        await api('/qic/sync', { method: 'POST', json: { id: it.id, data: it.data } });
        for (const f of (await getFiles(it.id)).filter((f) => !f.uploaded)) {
          const fd = new FormData();
          fd.append('kind', f.kind);
          fd.append('slot', String(f.slot));
          fd.append('capturedAt', f.capturedAt);
          if (f.lat != null && f.lng != null) { fd.append('lat', String(f.lat)); fd.append('lng', String(f.lng)); }
          fd.append('file', f.blob, `${f.kind}-${f.slot}.jpg`);
          await api(`/qic/${it.id}/files`, { method: 'POST', body: fd });
          await markUploaded(f.key);
        }
        await saveInspection({ ...it, syncStatus: 'synced', error: undefined });
      } catch (e) {
        if (e instanceof ApiError && e.status === 0) break; // offline: try again later
        if (e instanceof ApiError && e.status === 401) break;
        await saveInspection({ ...it, syncStatus: 'failed', error: (e as Error).message });
      }
    }
  } finally {
    running = false;
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

export async function retryFailed() {
  const user = session.user;
  if (!user) return;
  for (const i of await listInspections(user.id))
    if (i.syncStatus === 'failed') await saveInspection({ ...i, syncStatus: 'pending', error: undefined });
  await syncAll();
}

export function startAutoSync() {
  window.addEventListener('online', () => void syncAll());
  setInterval(() => void syncAll(), 30000);
  void syncAll();
}
