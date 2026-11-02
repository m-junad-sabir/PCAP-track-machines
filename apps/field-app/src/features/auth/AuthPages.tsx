import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shell, inputCls, Label, PrimaryBtn, SoftBtn, Banner } from '../../components/ui';
import { api, session } from '../../lib/api';

export const ACTIVITIES = [
  { code: 'QIC', title: 'QIC', sub: "Quality inspection at manufacturer's premises", path: '/qic' },
  { code: 'DIC', title: 'DIC', sub: "Delivery verification at farmer's premises", path: '/dic' },
  { code: 'SURVEY', title: 'Socio Economic Survey', sub: 'Baseline · Midline · Endline', path: '/survey' },
  { code: 'TPV', title: 'Rental Subsidy TPV', sub: 'Third-party verification of rental subsidy', path: '/tpv' },
];

export function ActivityPage() {
  const nav = useNavigate();
  return (
    <Shell title="PCAP Field App">
      <h2 className="font-semibold">Select activity</h2>
      <p className="text-sm text-slate-500">Choose your assignment, then sign in.</p>
      {ACTIVITIES.map((a) => (
        <button key={a.code} onClick={() => nav(`/login/${a.code}`)}
          className="flex w-full items-center justify-between rounded-lg border border-l-4 border-slate-200 border-l-brand p-3 text-left">
          <span><span className="block font-semibold">{a.title}</span><span className="text-xs text-slate-500">{a.sub}</span></span>
          <span className="text-slate-400">›</span>
        </button>
      ))}
    </Shell>
  );
}

export function LoginPage() {
  const { activity = 'QIC' } = useParams();
  const info = ACTIVITIES.find((a) => a.code === activity) ?? ACTIVITIES[0];
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await api('/auth/login', { method: 'POST', json: { username, password, activity: info.code } });
      session.set(r.token, r.user);
      session.setActivity(info.code);
      nav(info.path, { replace: true });
    } catch (e) { setErr((e as Error).message === 'No connection' ? 'You must be online to sign in.' : (e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <Shell title="Sign in">
      <h2 className="font-semibold">{info.title} · {info.sub}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Username</Label><input className={inputCls} value={username} autoCapitalize="none" onChange={(e) => setU(e.target.value)} /></div>
        <div>
          <Label>Password</Label>
          <div className="relative">
            <input className={`${inputCls} pr-12`} type={showPassword ? 'text' : 'password'} value={password} autoComplete="current-password" onChange={(e) => setP(e.target.value)} />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5 0 9 5 9 8a9 9 0 01-2.1 3.6M6.1 6.1A10.8 10.8 0 003 12c0 3 4 8 9 8a9.8 9.8 0 004-.9" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {err && <Banner tone="danger">{err}</Banner>}
        <div className="flex gap-2">
          <SoftBtn onClick={() => nav('/')}>Back</SoftBtn>
          <PrimaryBtn type="submit" disabled={busy || !username || !password} className="flex-1">{busy ? 'Signing in…' : 'Sign in'}</PrimaryBtn>
        </div>
      </form>
    </Shell>
  );
}
