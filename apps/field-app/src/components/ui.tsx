import type { ReactNode } from 'react';

export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

export function Shell({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white shadow-sm">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-brand px-4 py-3 text-white">
        <h1 className="text-sm font-semibold">{title}</h1>
        {right ?? <span className="text-[11px] opacity-80">NESPAK · PCAP</span>}
      </header>
      <main className="space-y-3 p-4 pb-10">{children}</main>
    </div>
  );
}

export const Label = ({ children }: { children: ReactNode }) => <label className="mb-1 block text-xs text-slate-500">{children}</label>;

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 py-1 text-sm">
      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1f4d3a]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

export function Banner({ tone, children }: { tone: 'warn' | 'danger' | 'ok'; children: ReactNode }) {
  const cls = { warn: 'bg-warn text-amber-800', danger: 'bg-danger text-red-700', ok: 'bg-brand-light text-brand' }[tone];
  return <div className={`rounded-lg px-3 py-2.5 text-sm ${cls}`}>{children}</div>;
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-slate-200 p-3 text-sm">{children}</div>;
}

export function Chip({ tone, children }: { tone: 'ok' | 'warn' | 'danger'; children: ReactNode }) {
  const cls = { ok: 'bg-brand-light text-brand', warn: 'bg-warn text-amber-800', danger: 'bg-danger text-red-700' }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

export function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white disabled:bg-slate-300 ${props.className ?? ''}`} />;
}
export function SoftBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand disabled:opacity-50 ${props.className ?? ''}`} />;
}

export function Actions({ onBack, onNext, canNext, backLabel = 'Back', nextLabel = 'Continue' }:
  { onBack: () => void; onNext: () => void; canNext: boolean; backLabel?: string; nextLabel?: string }) {
  return (
    <div className="flex gap-2 pt-2">
      <SoftBtn onClick={onBack} className="px-5">{backLabel}</SoftBtn>
      <PrimaryBtn type="button" disabled={!canNext} onClick={onNext} className="flex-1">{nextLabel}</PrimaryBtn>
    </div>
  );
}
