import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner, Card, Chip, PrimaryBtn, Shell, SoftBtn } from '../../components/ui';
import { session } from '../../lib/api';
import { deleteInspection, InspectionRec, listInspections } from '../../lib/db';
import { retryFailed, syncAll, SYNC_EVENT } from '../../lib/sync';
import { uuid } from '../../lib/uuid';
import { useFieldData } from './useData';

export function logout(nav: (p: string) => void) { session.clear(); nav('/'); }

export function HomePage() {
  const nav = useNavigate();
  const { home, offline, loading } = useFieldData();
  const [recs, setRecs] = useState<InspectionRec[]>([]);
  const refresh = useCallback(async () => setRecs(session.user ? await listInspections(session.user.id) : []), []);

  useEffect(() => {
    void refresh();
    window.addEventListener(SYNC_EVENT, refresh);
    void syncAll();
    return () => window.removeEventListener(SYNC_EVENT, refresh);
  }, [refresh]);

  const count = (s: string) => recs.filter((r) => r.syncStatus === s).length;
  const drafts = recs.filter((r) => r.syncStatus === 'draft');

  return (
    <Shell title="QIC · Quality Inspection" right={<SoftBtn onClick={() => logout(nav)} className="!px-3 !py-1 text-xs">Logout</SoftBtn>}>
      {offline && <Banner tone="warn">Offline: showing saved data. Inspections will upload when you are back online.</Banner>}
      <Card>
        <div className="text-xs text-slate-500">Signed in as</div>
        <b>{home?.user.fullName ?? session.user?.fullName}</b> · {session.user?.username}
      </Card>
      <PrimaryBtn onClick={() => nav(`/qic/new/${uuid()}`)} disabled={loading && !home}>Start new QIC inspection</PrimaryBtn>

      {drafts.map((d) => (
        <Card key={d.id}>
          <div className="flex items-center justify-between">
            <span>Unfinished inspection · step {d.step + 1}/7</span>
            <span className="flex gap-2">
              <SoftBtn onClick={() => nav(`/qic/new/${d.id}`)} className="!px-3 !py-1 text-xs">Resume</SoftBtn>
              <SoftBtn onClick={async () => { if (confirm('Discard this draft?')) { await deleteInspection(d.id); void refresh(); } }} className="!px-3 !py-1 text-xs">Discard</SoftBtn>
            </span>
          </div>
        </Card>
      ))}

      <div className="text-xs font-semibold text-slate-500">Assignment details</div>
      {home?.assignments.map((a) => (
        <Card key={a.districtId}>
          <div className="flex justify-between"><b>{a.district}</b><span className="text-xs text-slate-500">FE: {home.user.fullName}</span></div>
          <div className="mt-1 text-xs text-slate-500">Assigned: {a.manufacturers} manufacturers · {a.totalMachines} machines</div>
          <div className="mt-2 flex justify-between"><Chip tone="ok">Done: {a.done}</Chip><Chip tone="warn">To be done: {a.toBeDone}</Chip></div>
        </Card>
      ))}
      {home?.assignments[0] && <Card><div className="text-xs text-slate-500">Machine type</div><b>{home.assignments[0].machineType}</b></Card>}

      <div className="text-xs font-semibold text-slate-500">Upload status</div>
      <Card>
        <div className="flex items-center justify-between">
          <span>Synced {count('synced')} · Pending {count('pending')} · Failed {count('failed')}</span>
          <SoftBtn onClick={async () => { await retryFailed(); void refresh(); }} className="!px-3 !py-1 text-xs">Sync now</SoftBtn>
        </div>
        {recs.filter((r) => r.syncStatus === 'failed').map((r) => (
          <div key={r.id} className="mt-2 text-xs text-red-700">Failed: {r.error}</div>
        ))}
      </Card>
    </Shell>
  );
}

export function ComingSoon({ name }: { name: string }) {
  const nav = useNavigate();
  return (
    <Shell title={name} right={<SoftBtn onClick={() => logout(nav)} className="!px-3 !py-1 text-xs">Logout</SoftBtn>}>
      <Banner tone="warn">{name} is built in the next phase. QIC is complete.</Banner>
    </Shell>
  );
}
