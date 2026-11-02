export interface User { id: string; username: string; fullName: string; role: string }
export const session = {
  get token() { return localStorage.getItem('pcap.dash.token'); },
  get user(): User | null { const s = localStorage.getItem('pcap.dash.user'); return s ? JSON.parse(s) : null; },
  set(t: string, u: User) { localStorage.setItem('pcap.dash.token', t); localStorage.setItem('pcap.dash.user', JSON.stringify(u)); },
  clear() { localStorage.removeItem('pcap.dash.token'); localStorage.removeItem('pcap.dash.user'); },
};

async function raw(path: string, init: RequestInit & { json?: unknown } = {}) {
  const headers = new Headers(init.headers);
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`);
  let body = init.body;
  if (init.json !== undefined) { headers.set('Content-Type', 'application/json'); body = JSON.stringify(init.json); }
  const res = await fetch('/api' + path, { ...init, headers, body });
  if (res.status === 401 && !path.startsWith('/auth/login')) { session.clear(); window.location.href = '/login'; }
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res;
}
export const api = async <T = any,>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> => (await raw(path, init)).json();
export const apiBlob = async (path: string) => (await raw(path)).blob();

export async function download(path: string, filename: string) {
  const url = URL.createObjectURL(await apiBlob(path));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click(); URL.revokeObjectURL(url);
}
