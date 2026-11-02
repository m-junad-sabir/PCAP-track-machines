import { useState } from 'react';
import { Actions, Banner, Check, inputCls, Label } from '../../../components/ui';
import type { StepProps } from '../stepProps';
import { useFiles } from '../useFiles';

const CHECKS: [keyof StepProps['draft']['signoff']['checks'], string][] = [
  ['intimation', 'Intimation notice attached'],
  ['worksheet', 'Handwritten technical sheets uploaded and are correct'],
  ['machines', 'All machines have UID plates, tracker device, and 7-digit punch code'],
  ['uidSigned', 'All UID plates are signed by the FE'],
  ['photos', '8 sample geo-tagged images uploaded'],
];

export default function SignOff({ draft, update, back, submit }: StepProps) {
  const s = draft.signoff;
  const set = (p: Partial<typeof s>) => update({ signoff: { ...s, ...p } });
  const photos = useFiles(draft.id, 'photo').files.length;
  const sheets = useFiles(draft.id, 'worksheet').files.length;
  const [busy, setBusy] = useState(false);

  const pass = s.decision === 'pass';
  const complete = photos === 8 && sheets > 0;
  const mismatch = Object.values(draft.certCheck).includes('mismatch');
  const canSubmit = pass
    ? complete && !mismatch && !!s.certificateNo.trim() && Object.values(s.checks).every(Boolean)
    : s.decision === 'defer' && !!s.deferReason.trim();

  return (
    <>
      <div><Label>Committee decision</Label>
        <div className="grid grid-cols-2 gap-2">
          {(['pass', 'defer'] as const).map((d) => (
            <button key={d} onClick={() => set({ decision: d })}
              className={`rounded-lg border py-2.5 text-sm capitalize ${s.decision === d ? 'border-brand bg-brand-light font-semibold' : 'border-slate-300'}`}>{d}</button>
          ))}
        </div>
      </div>
      {pass && (
        <>
          <div><Label>QIC certificate # (only typed entry)</Label>
            <input className={inputCls} inputMode="numeric" placeholder="e.g. 305" value={s.certificateNo} onChange={(e) => set({ certificateNo: e.target.value })} /></div>
          {CHECKS.map(([k, label]) => <Check key={k} checked={s.checks[k]} onChange={(v) => set({ checks: { ...s.checks, [k]: v } })}>{label}</Check>)}
          {!complete && <Banner tone="danger">Missing evidence: {photos}/8 photos, {sheets} worksheet page(s). Go back and complete them.</Banner>}
          {mismatch && <Banner tone="danger">A certificate mismatch was recorded. This lot cannot pass.</Banner>}
          <p className="text-xs text-slate-500">Summary and progress reports are generated automatically (Excel only).</p>
        </>
      )}
      {s.decision === 'defer' && (
        <div><Label>Reason for deferring the lot</Label>
          <textarea className={inputCls} rows={3} value={s.deferReason} onChange={(e) => set({ deferReason: e.target.value })} /></div>
      )}
      <Actions onBack={back} onNext={async () => { setBusy(true); await submit(); }} canNext={canSubmit && !busy} nextLabel={busy ? 'Saving…' : 'Submit'} />
    </>
  );
}
