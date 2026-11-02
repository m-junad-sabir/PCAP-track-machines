import { Navigate, Route, Routes } from 'react-router-dom';
import { ActivityPage, LoginPage } from './features/auth/AuthPages';
import { ComingSoon, HomePage } from './features/home/HomePage';
import QicWizard from './features/qic/QicWizard';
import { session } from './lib/api';

function Private({ children }: { children: JSX.Element }) {
  return session.token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ActivityPage />} />
      <Route path="/login/:activity" element={<LoginPage />} />
      <Route path="/qic" element={<Private><HomePage /></Private>} />
      <Route path="/qic/new/:id" element={<Private><QicWizard /></Private>} />
      <Route path="/dic" element={<Private><ComingSoon name="DIC · Delivery Verification" /></Private>} />
      <Route path="/survey" element={<Private><ComingSoon name="Socio Economic Survey" /></Private>} />
      <Route path="/tpv" element={<Private><ComingSoon name="Rental Subsidy TPV" /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
