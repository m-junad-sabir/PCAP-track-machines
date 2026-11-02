import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, apiBlob, download } from '../lib/api';
import { AuthImg, Badge, fmt } from '../lib/ui';

const PHOTO_LABELS = ['Sign board of firm', 'Machine with tracker under mast frame', 'UID plate with FE signature', 'Punched 7-digit code',
  'Decoded UID-plate QR', 'Decoded tracker QR (farmer, CNIC, implement)', 'Decoded tracker QR (location)', 'QIC members with manufacturer'];

export default function RecordDetail() {
  const { id } = useParams();
  const [d, setD] = useState<any>();
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');
  const load = () => api('/qic/' + id).then((r) => { setD(r); setRemarks(r.reviewRemarks ?? ''); }).catch((e) => setErr(e.message));
  useEffect(() => { void load(); }, [id]);

  async function review(status: string) {
    setErr('');
    try { await api(`/qic/${id}/review`, { method: 'PATCH', json: { status, remarks } }); await load(); } catch (e) { setErr((e as Error).message); }
  }
  if (err && !d) return <p className="text-red-700">{err}</p>;
  if (!d) return null;

  const photos = d.attachments.filter((a: any) => a.kind === 'photo');
  const sheets = d.attachments.filter((a: any) => a.kind === 'worksheet');
  const mism = Object.entries(d.certCheck ?? {}).filter(([, v]) => v !== 'match');
  const Row = ({ k, v }: { k: string; v: any }) => <div className="flex justify-between border-b py-1 text-sm"><span className="text-slate-500">{k}</span><span>{v ?? '—'}</span></div>;

  return (
    <div className="space-y-4">
      <Link to="/qic" className="text-sm text-cyan-300 underline">← All records</Link>
      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white" onClick={() => download(`/reports/qic/${id}.pdf`, `qic-${id?.slice(0, 8)}.pdf`)}>Download PDF</button>
        <button className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700" onClick={() => download(`/reports/qic/${id}/files.zip`, `qic-${id?.slice(0, 8)}-files.zip`)}>Download photos & worksheets</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2"><h2 className="font-semibold">{d.manufacturer}</h2><Badge v={d.decision} label={d.decision} /><Badge v={d.status} /></div>
          <Row k="Engineer" v={d.engineer} /><Row k="District / division" v={`${d.district} / ${d.division}`} /><Row k="Submitted" v={fmt(d.submittedAt)} />
          <Row k="Lot size" v={d.lotSize} /><Row k="QIC certificate #" v={d.certificateNo} />
          <Row k="Intimation" v={d.intimation?.method} /><Row k="Firm GPS" v={d.lat != null ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : null} />
          <Row k="Inside district boundary" v={d.insideDistrict == null ? 'not checked (no boundary loaded)' : d.insideDistrict ? 'Yes' : 'NO — outside district'} />
          {d.signoff?.deferReason && <Row k="Defer reason" v={d.signoff.deferReason} />}
        </section>
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Certificate check</h2>
          {d.certificate ? <>
            <Row k="Allottee name" v={d.certificate.allotteeName ?? d.certificate.allottee_name} />
            <Row k="CNIC" v={d.certificate.cnic} />
            <Row k="Mailing address" v={d.certificate.mailingAddress ?? d.certificate.mailing_address} />
            <Row k="Tehsil" v={d.certificate.tehsil} />
            <Row k="Unique ID" v={d.certificate.uniqueId ?? d.certificate.unique_id} />
            <Row k="Punched 7-digit code" v={d.certificate.punchedCode ?? d.certificate.punched_code} />
            <Row k="Tracker IMEI" v={d.certificate.imei} />
          </> : <p className="text-sm text-slate-500">None recorded.</p>}
          <p className={`mt-2 text-sm ${mism.length ? 'font-semibold text-red-700' : 'text-emerald-700'}`}>{mism.length ? `${mism.length} mismatch(es): ${mism.map(([k]) => k).join(', ')}` : 'All sources matched'}</p>
          <h2 className="mb-1 mt-4 font-semibold">Review</h2>
          <textarea className="w-full rounded border p-2 text-sm" rows={3} placeholder="Remarks for the field team" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          {err && <p className="text-sm text-red-700">{err}</p>}
          <div className="mt-2 flex gap-2 text-sm">
            <button className="rounded bg-emerald-700 px-3 py-1.5 text-white" onClick={() => review('approved')}>Approve</button>
            <button className="rounded bg-amber-600 px-3 py-1.5 text-white" onClick={() => review('under_review')}>Under review</button>
            <button className="rounded bg-red-700 px-3 py-1.5 text-white" onClick={() => review('flagged')}>Flag for re-inspection</button>
          </div>
        </section>
      </div>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Geo-tagged photos ({photos.length}/8)</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p: any) => (
            <figure key={p.id}><AuthImg id={p.id} alt={PHOTO_LABELS[p.slot - 1]} className="h-40 w-full rounded object-cover" />
              <figcaption className="mt-1 text-xs"><b>{p.slot}.</b> {PHOTO_LABELS[p.slot - 1]}<br /><span className="text-slate-500">{p.lat?.toFixed(5)}, {p.lng?.toFixed(5)}</span></figcaption></figure>
          ))}
        </div>
      </section>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Technical worksheet ({sheets.length} page{sheets.length === 1 ? '' : 's'})</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {sheets.map((s: any) => (
            <a key={s.id} href="#" onClick={async (e) => { e.preventDefault(); window.open(URL.createObjectURL(await apiBlob('/files/' + s.id))); }}>
              <AuthImg id={s.id} alt={`Worksheet page ${s.slot}`} className="w-full rounded border" /><div className="text-xs">Page {s.slot} (click to open full size)</div></a>
          ))}
        </div>
      </section>
    </div>
  );
}
