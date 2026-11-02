import { useState } from 'react';
import { download } from '../lib/api';

export default function Reports() {
  const [active, setActive] = useState('QIC summary');
  const [period, setPeriod] = useState('Monthly');
  const [error, setError] = useState('');
  const tabs = ['QIC summary', 'DIC summary', 'QIC progress', 'DIC progress'];

  return (
    <section className="panel">
      <div className="tabs">
        {tabs.map((tab) => <button key={tab} className={`tab ${active === tab ? 'active' : ''}`} onClick={() => setActive(tab)}>{tab}</button>)}
      </div>
      <div className="toolbar">
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option>Monthly</option><option>Quarterly</option><option>Annual</option>
        </select>
        <button className="action-button" onClick={() => download('/reports/qic.xlsx', 'pcap-qic-report.xlsx').catch((e: Error) => setError(e.message))}>Export Excel</button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <p className="muted text-sm">{active} · {period}</p>
      <div className="table-scroll">
        <table className="dark-table mt-3">
          <thead><tr><th>Division / district</th><th>Meetings / records</th><th>Inspected</th><th>Approved</th><th>Deferred</th><th>Reason</th></tr></thead>
          <tbody><tr><td colSpan={6} className="muted py-8 text-center">Select Export Excel to download live uploaded QIC data.</td></tr></tbody>
        </table>
      </div>
    </section>
  );
}
