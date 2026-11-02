import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface QicRow {
  id: string;
  status: string;
  decision: string;
  engineer: string;
  district: string;
  manufacturer: string;
}

export default function Dashboard() {
  const [rows, setRows] = useState<QicRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<QicRow[]>('/qic').then(setRows).catch((e: Error) => setError(e.message));
  }, []);

  const metrics = useMemo(() => [
    { value: rows.length, label: 'Machines tracked' },
    { value: rows.filter((r) => r.status === 'approved').length, label: 'QIC inspected' },
    { value: rows.filter((r) => r.status === 'submitted' || r.status === 'under_review').length, label: 'Awaiting delivery' },
    { value: rows.filter((r) => r.status === 'approved').length, label: 'DIC approved' },
    { value: rows.filter((r) => r.status === 'flagged' || r.decision === 'defer').length, label: 'Open discrepancies' },
  ], [rows]);

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
      <section className="metric-grid" aria-label="Dashboard summary">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>
      <section className="two-column">
        <article className="panel">
          <h2>Machine lifecycle (Inspected → Delivered)</h2>
          <div className="table-scroll">
            <table className="dark-table mt-3">
              <thead><tr><th>Machine</th><th>Farmer</th><th>District</th><th>Firm</th><th>QIC</th><th>DIC</th></tr></thead>
              <tbody>
                {rows.slice(0, 12).map((row) => (
                  <tr key={row.id}>
                    <td><Link className="text-cyan-300" to={`/records/${row.id}`}>{row.id.slice(0, 8).toUpperCase()}</Link></td>
                    <td>—</td><td>{row.district}</td><td>{row.manufacturer}</td>
                    <td className={row.decision === 'pass' ? 'positive' : 'negative'}>{row.status === 'approved' ? 'Approved' : row.status}</td>
                    <td>—</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} className="muted py-8 text-center">No records uploaded yet</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
        <article className="panel">
          <h2>Machines by division</h2>
          <div className="muted mt-3 text-sm">
            {Object.entries(rows.reduce<Record<string, number>>((counts, row) => {
              counts[row.district] = (counts[row.district] ?? 0) + 1;
              return counts;
            }, {})).slice(0, 10).map(([district, count]) => (
              <div key={district} className="mb-2 flex items-center gap-2">
                <span className="min-w-24 text-slate-200">{district}</span>
                <span className="h-4 rounded-sm bg-cyan-300" style={{ width: `${Math.max(20, count * 18)}px` }} />
                <span>{count}</span>
              </div>
            ))}
            {!rows.length && <p>No upload data available.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
