import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shell, SoftBtn } from '../../components/ui';
import { session } from '../../lib/api';
import { getInspection, saveInspection } from '../../lib/db';
import { syncAll } from '../../lib/sync';
import { newDraft, QicDraft } from '../../lib/types';
import { logout } from '../home/HomePage';
import { useFieldData } from '../home/useData';
import CertCheck from './steps/CertCheck';
import Eligibility from './steps/Eligibility';
import Intimation from './steps/Intimation';
import LotFirm from './steps/LotFirm';
import Photos from './steps/Photos';
import SignOff from './steps/SignOff';
import Worksheet from './steps/Worksheet';
import type { StepProps } from './stepProps';

const STEPS: [string, (p: StepProps) => JSX.Element][] = [
  ['Intimation', Intimation], ['Lot and firm', LotFirm], ['Eligibility gate', Eligibility],
  ['WorkSheet For Compliance of Approval Technical Specification', Worksheet],
  ['Certificate check', CertCheck], ['Geo-tagged photos', Photos], ['Sign-off', SignOff],
];

export default function QicWizard() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { home, lookups } = useFieldData();
  const [draft, setDraft] = useState<QicDraft>();
  const [step, setStep] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const rec = await getInspection(id);
      if (rec && rec.syncStatus !== 'draft') return nav('/qic', { replace: true });
      setDraft(rec?.data ?? newDraft(id)); setStep(rec?.step ?? 0); loaded.current = true;
    })();
  }, [id, nav]);

  // autosave every change so a dropped battery/connection loses nothing
  useEffect(() => {
    if (!draft || !loaded.current || !session.user) return;
    void saveInspection({ id, ownerId: session.user.id, data: draft, step, syncStatus: 'draft', updatedAt: new Date().toISOString() });
  }, [draft, step, id]);

  if (!draft) return null;
  const update = (patch: Partial<QicDraft>) => setDraft((d) => ({ ...d!, ...patch }));
  const go = (n: number) => { setStep(n); window.scrollTo(0, 0); };

  async function submit() {
    await saveInspection({ id, ownerId: session.user!.id, data: draft!, step: 6, syncStatus: 'pending', updatedAt: new Date().toISOString() });
    void syncAll();
    nav('/qic', { replace: true });
  }

  function deferLot() {
    if (!confirm('Information mismatch: defer the complete lot?')) return;
    update({ signoff: { ...draft!.signoff, decision: 'defer' } });
    go(6);
  }

  const [title, Step] = STEPS[step];
  return (
    <Shell title="QIC · at manufacturer" right={<SoftBtn onClick={() => logout(nav)} className="!px-3 !py-1 text-xs">Logout</SoftBtn>}>
      <div className="flex gap-1">{STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-brand' : 'bg-slate-200'}`} />)}</div>
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">{step + 1}/7 {title}</h2>
      </div>
      <Step draft={draft} update={update} lookups={lookups} home={home} submit={submit}
        next={() => go(Math.min(step + 1, 6))} back={() => (step === 0 ? nav('/qic') : go(step - 1))} />
      {step < 6 && (
        <button onClick={deferLot} className="w-full rounded-lg border border-red-300 bg-danger px-3 py-2.5 text-sm font-semibold text-red-700">
          ⚠ Information mismatch: defer complete lot
        </button>
      )}
    </Shell>
  );
}
