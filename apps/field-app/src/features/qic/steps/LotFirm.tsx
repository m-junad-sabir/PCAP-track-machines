import { useState } from 'react';
import { Actions, Banner, Card, Chip, inputCls, Label, SoftBtn } from '../../../components/ui';
import { getPosition } from '../../../lib/gps';
import { LOT_SIZES } from '../../../lib/types';
import type { StepProps } from '../stepProps';

export default function LotFirm({ draft, update, next, back, lookups, home }: StepProps) {
  const [gpsErr, setGpsErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (!lookups?.districts.length) return <Banner tone="danger">Reference data is not loaded. Connect to the internet once, then reopen the app.</Banner>;

  const district = lookups.districts.find((d) => d.id === draft.districtId) ?? (lookups.districts.length === 1 ? lookups.districts[0] : undefined);
  const a = home?.assignments.find((x) => x.districtId === district?.id);
  const ready = !!district && !!draft.manufacturerId && !!draft.lotSize && draft.firmLat != null;

  async function capture() {
    setBusy(true); setGpsErr('');
    try { const p = await getPosition(); update({ firmLat: p.lat, firmLng: p.lng }); }
    catch (e) { setGpsErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <>
      {lookups.districts.length > 1 && (
        <div><Label>District</Label>
          <select className={inputCls} value={district?.id ?? ''} onChange={(e) => update({ districtId: Number(e.target.value) || undefined, manufacturerId: undefined })}>
            <option value="">Select…</option>
            {lookups.districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      )}
      {district && a && (
        <Card>
          <div className="text-xs text-slate-500">Your assignment</div>
          <div className="flex justify-between"><b>{district.name} ({a.manufacturers})</b><span className="text-xs text-slate-500">FE: {home?.user.fullName}</span></div>
          <div className="my-1 flex gap-2"><Chip tone="ok">Done: {a.done}</Chip><Chip tone="warn">To be done: {a.toBeDone}</Chip></div>
          <div className="text-xs text-slate-500">Total machines assigned: <b>{a.totalMachines}</b></div>
        </Card>
      )}
      {district && (
        <Card>
          <div className="mb-1 font-semibold">Pre-qualified manufacturers by district</div>
          <table className="w-full text-xs"><thead><tr className="text-left text-slate-500"><th>District</th><th>No.</th><th>Manufacturers</th></tr></thead>
            <tbody><tr><td>{district.name}</td><td>{district.manufacturers.length}</td><td>{district.manufacturers.map((m) => m.name).join('; ')}</td></tr></tbody></table>
        </Card>
      )}
      <div><Label>Manufacturer (pre-qualified)</Label>
        <select className={inputCls} disabled={!district} value={draft.manufacturerId ?? ''} onChange={(e) => update({ districtId: district?.id, manufacturerId: Number(e.target.value) || undefined })}>
          <option value="">Select…</option>
          {district?.manufacturers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      {district && draft.manufacturerId && (
        <Card><div className="text-xs text-slate-500">Auto-filled</div><b>{district.name}</b>
          <div className="text-xs text-slate-500">{district.name} district · {district.division} division</div>
          <div className="text-xs text-slate-500">Convener: {district.convener}</div></Card>
      )}
      <div><Label>Size of lot offered</Label>
        <select className={inputCls} value={draft.lotSize ?? ''} onChange={(e) => update({ districtId: district?.id, lotSize: Number(e.target.value) || undefined })}>
          <option value="">Select…</option>
          {LOT_SIZES.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <SoftBtn onClick={capture} disabled={busy} className="w-full">{busy ? 'Getting GPS…' : 'Capture GPS location of Firm'}</SoftBtn>
      {draft.firmLat != null && <div className="text-xs text-slate-500">GPS: {draft.firmLat.toFixed(5)}, {draft.firmLng!.toFixed(5)}</div>}
      {gpsErr && <Banner tone="danger">{gpsErr}</Banner>}
      <Actions onBack={back} onNext={() => { update({ districtId: district?.id }); next(); }} canNext={ready} />
    </>
  );
}
