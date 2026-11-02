export interface User { id: string; username: string; fullName: string; role: string }

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const session = {
  get token() { return localStorage.getItem('pcap.token'); },
  get user(): User | null { const s = localStorage.getItem('pcap.user'); return s ? JSON.parse(s) : null; },
  get activity() { return sessionStorage.getItem('pcap.activity'); },
  set(token: string, user: User) { localStorage.setItem('pcap.token', token); localStorage.setItem('pcap.user', JSON.stringify(user)); },
  setActivity(a: string) { sessionStorage.setItem('pcap.activity', a); },
  clear() { localStorage.removeItem('pcap.token'); localStorage.removeItem('pcap.user'); sessionStorage.removeItem('pcap.activity'); },
};

export async function api<T = any>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`);
  let body = init.body;
  if (init.json !== undefined) { headers.set('Content-Type', 'application/json'); body = JSON.stringify(init.json); }
  let res: Response;
  try { res = await fetch('/api' + path, { ...init, headers, body }); }
  catch { throw new ApiError(0, 'No connection'); }
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    session.clear();
    window.location.href = '/';
    throw new ApiError(401, 'Session expired');
  }
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg; } catch { /* ignore */ }
    throw new ApiError(res.status, msg);
  }
  return res.json();
}
