import { Actions, Banner, Check } from '../../../components/ui';
import type { StepProps } from '../stepProps';

export default function Eligibility({ draft, update, next, back }: StepProps) {
  const e = draft.eligibility;
  const set = (p: Partial<typeof e>) => update({ eligibility: { ...e, ...p } });
  const ok = e.uidPlate && e.punchedCode && e.tracker;
  return (
    <>
      <p className="text-sm text-slate-500">A machine is not entertained if any of the following parameters does not comply and is not checked.</p>
      <Check checked={e.uidPlate} onChange={(v) => set({ uidPlate: v })}>UID plate with QR code is installed</Check>
      <Check checked={e.punchedCode} onChange={(v) => set({ punchedCode: v })}>7-digit punched code is present and same as digits on UID plate (after Y01, before SS1/1)</Check>
      <Check checked={e.tracker} onChange={(v) => set({ tracker: v })}>Tracking device installed under the mast frame</Check>
      {ok ? <Banner tone="ok">Machine is eligible.</Banner> : <Banner tone="danger">Blocked. Inform the convener.</Banner>}
      <Actions onBack={back} onNext={next} canNext={ok} />
    </>
  );
}
