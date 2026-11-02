import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Row {
  id: string;
  district: string;
  engineer: string;
  manufacturer: string;
  decision: string;
  status: string;
  submittedAt: string;
}

export default function Discrepancies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api<Row[]>('/qic').then((data) => setRows(data.filter((row) => row.status === 'flagged' || row.decision === 'defer')))
      .catch((e: Error) => setError(e.message));
  }, []);
  const unresolved = useMemo(() => rows.filter((row) => row.status !== 'approved'), [rows]);

  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <h2>Discrepancies ({unresolved.length})</h2>
      </div>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <div className="table-scroll">
        <table className="dark-table mt-3">
          <thead><tr><th>Machine / record</th><th>District</th><th>Engineer</th><th>Manufacturer</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>
            {unresolved.map((row) => (
              <tr key={row.id}>
                <td><Link className="text-cyan-300" to={`/records/${row.id}`}>{row.id.slice(0, 8).toUpperCase()}</Link></td>
                <td>{row.district}</td><td>{row.engineer}</td><td>{row.manufacturer}</td>
                <td>{row.decision === 'defer' ? 'Deferred / requires review' : 'Flagged by reviewer'}</td>
                <td>{row.status}</td>
              </tr>
            ))}
            {!unresolved.length && <tr><td colSpan={6} className="muted py-8 text-center">No open discrepancies</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
