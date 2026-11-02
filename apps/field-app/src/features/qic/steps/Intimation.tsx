import { Actions, Check, inputCls, Label } from '../../../components/ui';
import { INTIMATION_METHODS } from '../../../lib/types';
import type { StepProps } from '../stepProps';

export default function Intimation({ draft, update, next, back }: StepProps) {
  const i = draft.intimation;
  const set = (p: Partial<typeof i>) => update({ intimation: { ...i, ...p } });
  return (
    <>
      <div><Label>Form in which meeting notification was received</Label>
        <select className={inputCls} value={i.method} onChange={(e) => set({ method: e.target.value })}>
          <option value="">Select…</option>
          {INTIMATION_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <Check checked={i.proofSent} onChange={(v) => set({ proofSent: v })}>Notice / proof sent to PM/TL</Check>
      <Check checked={i.inConvenerDivision} onChange={(v) => set({ inConvenerDivision: v })}>Manufacturer is in the convener's division</Check>
      <Actions onBack={back} backLabel="Cancel" onNext={next} canNext={!!i.method && i.proofSent} />
    </>
  );
}
