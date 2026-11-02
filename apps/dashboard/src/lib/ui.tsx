import { useEffect, useState } from 'react';
import { apiBlob } from './api';

export const STATUS_LABEL: Record<string, string> = { submitted: 'Submitted', under_review: 'Under review', approved: 'Approved', flagged: 'Flagged' };
const TONE: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-700', under_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800', flagged: 'bg-red-100 text-red-700',
  pass: 'bg-emerald-100 text-emerald-800', defer: 'bg-red-100 text-red-700',
};
export const Badge = ({ v, label }: { v: string; label?: string }) =>
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[v] ?? ''}`}>{label ?? STATUS_LABEL[v] ?? v}</span>;

export const fmt = (d: string) => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/** <img> that loads through the authenticated API. */
export function AuthImg({ id, alt, className }: { id: string; alt: string; className?: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let url = '';
    apiBlob(`/files/${id}`).then((b) => { url = URL.createObjectURL(b); setSrc(url); }).catch(() => setSrc(''));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return src ? <img src={src} alt={alt} className={className} /> : <div className={`${className} animate-pulse bg-slate-200`} />;
}
