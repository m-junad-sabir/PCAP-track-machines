export interface QicDraft {
  id: string;
  districtId?: number;
  manufacturerId?: number;
  lotSize?: number;
  firmLat?: number;
  firmLng?: number;
  intimation: { method: string; proofSent: boolean; inConvenerDivision: boolean };
  eligibility: { uidPlate: boolean; punchedCode: boolean; tracker: boolean };
  certificateId?: number;
  /** key "group.source" -> 'match' | 'mismatch' */
  certCheck: Record<string, 'match' | 'mismatch'>;
  signoff: {
    decision?: 'pass' | 'defer';
    certificateNo: string;
    deferReason: string;
    checks: { intimation: boolean; worksheet: boolean; machines: boolean; uidSigned: boolean; photos: boolean };
  };
  createdAt: string;
}

export interface Manufacturer { id: number; name: string }
export interface DistrictInfo { id: number; name: string; districtCode: string; division: string; convener: string; manufacturers: Manufacturer[] }
export interface Certificate {
  id: number; districtId: number; allotteeName: string; cnic: string;
  mailingAddress: string; tehsil: string; uniqueId: string; punchedCode: string; imei: string;
  districtCode?: string;
}
export interface Lookups { districts: DistrictInfo[]; certificates: Certificate[] }
export interface Assignment {
  districtId: number; district: string; machineType: string; totalMachines: number;
  manufacturers: number; done: number; toBeDone: number;
}
export interface HomeData { user: { username: string; fullName: string }; assignments: Assignment[] }

export const INTIMATION_METHODS = [
  'Official letter / meeting notice', 'E-mail', 'WhatsApp', 'Handwritten memo with official stamp', 'Telephone call', 'Voice message',
];
export const LOT_SIZES = [25, 50, 75, 100];

export const PHOTO_SLOTS = [
  'Sign board of manufacturing firm',
  'Machine with tracker under mast frame (nobody beside it)',
  'UID plate with FE signature',
  'Punched 7-digit code',
  'Decoded UID-plate QR (farmer, father, CNIC, mobile, implement, firm, district)',
  'Decoded tracker QR (farmer, CNIC, implement)',
  'Decoded tracker QR (location + lat/long of firm)',
  'QIC members with manufacturer, in front of machine',
];

/** Certificate cross-check: what the engineer compares against the downloaded certificate. */
export const CERT_GROUPS: { key: string; title: string; cert: (c: Certificate) => string; sources: [string, string][] }[] = [
  { key: 'farmerName', title: 'Farmer name', cert: (c) => c.allotteeName,
    sources: [['uidPlate', 'Printed on UID plate'], ['uidQr', 'Decoded UID-plate QR'], ['trackerQr', 'Decoded tracker QR']] },
  { key: 'cnic', title: 'CNIC number', cert: (c) => c.cnic,
    sources: [['uidQr', 'Decoded UID-plate QR'], ['trackerQr', 'Decoded tracker QR']] },
  { key: 'uniqueId', title: 'Unique ID', cert: (c) => c.uniqueId,
    sources: [['uidPlate', 'Printed UID-plate Unique ID'], ['uidQr', 'Decoded UID-plate QR']] },
  { key: 'imei', title: 'Tracker IMEI', cert: (c) => c.imei, sources: [['label', 'Label on tracking device']] },
  { key: 'punchedCode', title: '7-digit punched code', cert: () => '',
    sources: [['uidPlate', 'Machine code vs digits on UID plate (after Y01, before SS1/1)']] },
];
export const CERT_KEYS = CERT_GROUPS.flatMap((g) => g.sources.map(([s]) => `${g.key}.${s}`));

export function newDraft(id: string): QicDraft {
  return {
    id,
    intimation: { method: '', proofSent: false, inConvenerDivision: false },
    eligibility: { uidPlate: false, punchedCode: false, tracker: false },
    certCheck: {},
    signoff: { certificateNo: '', deferReason: '', checks: { intimation: false, worksheet: false, machines: false, uidSigned: false, photos: false } },
    createdAt: new Date().toISOString(),
  };
}
