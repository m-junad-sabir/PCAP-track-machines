import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, session } from '../lib/api';
import nespakLogo from '../assets/nespak-logo.jpg';
import loginBackground from '../assets/pcap-login-art.jpg';

export default function Login() {
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { const r = await api('/auth/login', { method: 'POST', json: { username, password, portal: 'dashboard' } }); session.set(r.token, r.user); nav('/'); }
    catch (e) { setErr((e as Error).message); }
  }
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf2f5] bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-[-12px] bg-cover bg-center blur-[3px]" style={{ backgroundImage: `url(${loginBackground})` }} />
      <div className="absolute inset-0 bg-[#12304a]/5" />
      <div className="relative z-10 w-full max-w-[390px] rounded-2xl border border-white/50 bg-white/82 p-7 shadow-[0_24px_70px_rgba(15,38,63,.32)] backdrop-blur-xl sm:p-8">
        <form onSubmit={go} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#173d5d]">PCAP MIS Dashboard</h1>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="dashboard-username" className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
                <input id="dashboard-username" className="w-full rounded-lg border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1f5d5a] focus:ring-2 focus:ring-[#1f5d5a]/15" placeholder="Enter username" value={username} autoComplete="username" onChange={(e) => setU(e.target.value)} />
              </div>
              <div>
                <label htmlFor="dashboard-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input id="dashboard-password" className="w-full rounded-lg border border-white/70 bg-white/80 px-3 py-2.5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1f5d5a] focus:ring-2 focus:ring-[#1f5d5a]/15" type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} autoComplete="current-password" onChange={(e) => setP(e.target.value)} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-[#1f5d5a]"
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
            </div>
            {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
            <button disabled={!username || !password} className="w-full rounded-lg bg-[#1f5d5a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#174c49] disabled:cursor-not-allowed disabled:opacity-50">Sign in</button>
            <div className="flex flex-col items-center border-t border-slate-300/60 pt-4 text-center">
              <span className="text-xs text-slate-500">developed by</span>
              <img src={nespakLogo} alt="NESPAK - National Engineering Services Pakistan" className="mt-2 max-h-12 w-auto max-w-[220px] object-contain" />
            </div>
        </form>
      </div>
    </main>
  );
}
