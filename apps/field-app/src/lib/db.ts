import { DBSchema, openDB } from 'idb';
import type { QicDraft } from './types';

export type SyncStatus = 'draft' | 'pending' | 'synced' | 'failed';
export interface InspectionRec { id: string; ownerId: string; data: QicDraft; step: number; syncStatus: SyncStatus; error?: string; updatedAt: string }
export interface FileRec {
  key: string; inspectionId: string; kind: 'photo' | 'worksheet'; slot: number; blob: Blob;
  lat?: number; lng?: number; capturedAt: string; uploaded: boolean;
}
interface Schema extends DBSchema {
  inspections: { key: string; value: InspectionRec };
  files: { key: string; value: FileRec; indexes: { 'by-inspection': string } };
  cache: { key: string; value: { key: string; value: unknown } };
}

const dbp = openDB<Schema>('pcap-field', 1, {
  upgrade(db) {
    db.createObjectStore('inspections', { keyPath: 'id' });
    db.createObjectStore('files', { keyPath: 'key' }).createIndex('by-inspection', 'inspectionId');
    db.createObjectStore('cache', { keyPath: 'key' });
  },
});

export const saveInspection = async (r: InspectionRec) => { await (await dbp).put('inspections', r); };
export const getInspection = async (id: string) => (await dbp).get('inspections', id);
export const listInspections = async (ownerId: string) =>
  (await (await dbp).getAll('inspections')).filter((r) => r.ownerId === ownerId);

export async function deleteInspection(id: string) {
  const db = await dbp;
  for (const f of await db.getAllFromIndex('files', 'by-inspection', id)) await db.delete('files', f.key);
  await db.delete('inspections', id);
}

export const fileKey = (id: string, kind: string, slot: number) => `${id}|${kind}|${slot}`;
export const putFile = async (f: Omit<FileRec, 'key' | 'uploaded'>) => {
  await (await dbp).put('files', { ...f, key: fileKey(f.inspectionId, f.kind, f.slot), uploaded: false });
};
export const getFiles = async (id: string) => (await dbp).getAllFromIndex('files', 'by-inspection', id);
export const deleteFile = async (key: string) => { await (await dbp).delete('files', key); };
export const markUploaded = async (key: string) => {
  const db = await dbp; const f = await db.get('files', key);
  if (f) await db.put('files', { ...f, uploaded: true });
};

export const cacheSet = async (key: string, value: unknown) => { await (await dbp).put('cache', { key, value }); };
export const cacheGet = async <T,>(key: string) => ((await (await dbp).get('cache', key))?.value as T | undefined);
