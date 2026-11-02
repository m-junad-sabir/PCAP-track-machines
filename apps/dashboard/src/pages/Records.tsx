import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, download } from '../lib/api';
import { Badge, fmt, STATUS_LABEL } from '../lib/ui';

interface Row {
  id: string; status: string; decision: string; lotSize: number; certificateNo: string; submittedAt: string;
  engineer: string; district: string; manufacturer: string; photos: number; worksheets: number;
}

export default function Records() {
  const [rows, setRows] = useState<Row[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [f, setF] = useState({ status: '', districtId: '', from: '', to: '', q: '' });
  const [err, setErr] = useState('');
  const qs = useMemo(() => new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString(), [f]);

  useEffect(() => { api('/meta/districts').then(setDistricts).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => api<Row[]>('/qic?' + qs).then((r) => { setRows(r); setErr(''); }).catch((e) => setErr(e.message)), 250);
    return () => clearTimeout(t);
  }, [qs]);

  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const incomplete = (r: Row) => r.decision === 'pass' && (r.photos < 8 || r.worksheets < 1);

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[['Total', rows.length], ...Object.keys(STATUS_LABEL).map((s) => [STATUS_LABEL[s], count(s)])].map(([l, n]) => (
          <div key={l} className="rounded-lg bg-white p-3 shadow-sm"><div className="text-xs text-slate-500">{l}</div><div className="text-2xl font-semibold">{n}</div></div>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-white p-3 shadow-sm text-sm">
        <input className="rounded border p-1.5" placeholder="Search engineer / firm / cert #" value={f.q} onChange={set('q')} />
        <select className="rounded border p-1.5" value={f.status} onChange={set('status')}><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="rounded border p-1.5" value={f.districtId} onChange={set('districtId')}><option value="">All districts</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <input type="date" className="rounded border p-1.5" value={f.from} onChange={set('from')} />
        <input type="date" className="rounded border p-1.5" value={f.to} onChange={set('to')} />
        <button className="rounded bg-brand px-3 py-1.5 font-semibold text-white" onClick={() => download('/reports/qic.xlsx?' + qs, 'qic-report.xlsx').catch((e) => setErr(e.message))}>Export Excel</button>
        <button className="rounded border border-brand px-3 py-1.5 font-semibold text-brand" onClick={() => download('/reports/qic.pdf?' + qs, 'qic-report.pdf').catch((e) => setErr(e.message))}>Export PDF</button>
        <button className="ml-auto rounded border border-slate-300 px-3 py-1.5 font-semibold text-slate-700" onClick={() => download('/reports/qic-files.zip?' + qs, 'qic-survey-files.zip').catch((e) => setErr(e.message))}>Download files</button>
      </div>
      {err && <p className="mb-2 text-sm text-red-700">{err}</p>}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Submitted', 'Engineer', 'District', 'Manufacturer', 'Lot', 'Decision', 'Cert #', 'Evidence', 'Status'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2"><Link className="text-brand underline" to={`/records/${r.id}`}>{fmt(r.submittedAt)}</Link></td>
                <td className="px-3 py-2">{r.engineer}</td><td className="px-3 py-2">{r.district}</td><td className="px-3 py-2">{r.manufacturer}</td>
                <td className="px-3 py-2">{r.lotSize}</td><td className="px-3 py-2"><Badge v={r.decision} label={r.decision} /></td><td className="px-3 py-2">{r.certificateNo}</td>
                <td className={`px-3 py-2 ${incomplete(r) ? 'text-red-700' : ''}`}>{r.photos}/8 photos · {r.worksheets} sheets</td>
                <td className="px-3 py-2"><Badge v={r.status} /></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">No records yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
