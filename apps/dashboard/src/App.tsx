import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { session } from './lib/api';
import Dashboard from './pages/Dashboard';
import DICRecords from './pages/DICRecords';
import Discrepancies from './pages/Discrepancies';
import Login from './pages/Login';
import MapView from './pages/MapView';
import MasterData from './pages/MasterData';
import MachineConfig from './pages/MachineConfig';
import RecordDetail from './pages/RecordDetail';
import Records from './pages/Records';
import Reports from './pages/Reports';

function Layout() {
  const nav = useNavigate();
  if (!session.token) return <Navigate to="/login" replace />;
  const links = [
    ['Dashboard', '/'],
    ['QIC records', '/qic'],
    ['DIC records', '/dic'],
    ['Discrepancies', '/discrepancies'],
    ['Reports', '/reports'],
    ['Machine-type config', '/machine-config'],
    ['Master data', '/master-data'],
  ];
  return (
    <div className="min-h-screen">
      <header className="topbar">
        <Link to="/" className="brand">PCAP Farm Machinery Monitoring</Link>
        <div className="top-actions">
          <span className="current-user">{session.user?.fullName}</span>
          <button className="top-button logout-button" onClick={() => { session.clear(); nav('/login'); }}>Logout</button>
        </div>
      </header>
      <main className="workspace">
        <nav className="nav-row" aria-label="Dashboard navigation">
          <div className="nav-links">
            {links.map(([label, path]) => (
              <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </div>
          <Link to="/map" className="nav-link map-link"><span aria-hidden="true">&#9679;</span> Map view</Link>
        </nav>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/qic" element={<Records />} />
        <Route path="/records/:id" element={<RecordDetail />} />
        <Route path="/dic" element={<DICRecords />} />
        <Route path="/discrepancies" element={<Discrepancies />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/machine-config" element={<MachineConfig />} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/map" element={<MapView />} />
      </Route>
    </Routes>
  );
}
