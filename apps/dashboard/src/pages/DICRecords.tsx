import { useEffect, useState } from 'react';
import { api, download } from '../lib/api';

interface DICRow {
  id: string;
  status: string;
  submittedAt: string;
  engineer: string;
  qicInspectionId?: string;
}

export default function DICRecords() {
  const [rows, setRows] = useState<DICRow[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { api<DICRow[]>('/dic').then(setRows).catch((e: Error) => setError(e.message)); }, []);

  return (
    <div className="two-column">
      <section className="panel">
        <h2>DIC records ({rows.length})</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white" onClick={() => download('/dic/reports/dic.xlsx', 'dic-report.xlsx')}>Export Excel</button>
          <button className="rounded border border-brand px-3 py-1.5 text-sm font-semibold text-brand" onClick={() => download('/dic/reports/dic.pdf', 'dic-report.pdf')}>Export PDF</button>
          <button className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700" onClick={() => download('/dic/reports/dic-files.zip', 'dic-survey-files.zip')}>Download files</button>
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <div className="table-scroll">
          <table className="dark-table mt-3">
            <thead><tr><th>Record</th><th>Linked QIC</th><th>Status</th><th>Date</th><th>FE</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id.slice(0, 8).toUpperCase()}</td>
                  <td>{row.qicInspectionId ?? '—'}</td>
                  <td>{row.status}</td>
                  <td>{new Date(row.submittedAt).toLocaleDateString()}</td>
                  <td>{row.engineer}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="muted py-8 text-center">No DIC records uploaded yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <aside className="panel muted">
        Select a record to view the linked QIC/DIC chain, certificate columns, sampling sheet, and log.
      </aside>
    </div>
  );
}
