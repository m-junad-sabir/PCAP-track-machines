import { Actions, Banner, Card, inputCls, Label, SoftBtn } from '../../../components/ui';
import { CERT_GROUPS, CERT_KEYS } from '../../../lib/types';
import type { StepProps } from '../stepProps';

export default function CertCheck({ draft, update, next, back, lookups }: StepProps) {
  const certs = (lookups?.certificates ?? []).filter((c) => !draft.districtId || c.districtId === draft.districtId);
  const cert = certs.find((c) => c.id === draft.certificateId);
  const r = draft.certCheck;
  const setAll = (keys: string[], v: 'match' | 'mismatch') => update({ certCheck: { ...r, ...Object.fromEntries(keys.map((k) => [k, v])) } });
  const answered = CERT_KEYS.every((k) => r[k]);
  const mismatch = CERT_KEYS.some((k) => r[k] === 'mismatch');

  return (
    <>
      <div><Label>Certificate row (machine) to cross-check</Label>
        <select className={inputCls} value={draft.certificateId ?? ''} onChange={(e) => update({ certificateId: Number(e.target.value) || undefined, certCheck: {} })}>
          <option value="">Select…</option>
          {certs.map((c) => <option key={c.id} value={c.id}>{c.districtCode ? `${c.districtCode} · ` : ''}{c.uniqueId} · {c.allotteeName}</option>)}
        </select>
      </div>
      {!cert ? <Banner tone="danger">Select a machine.</Banner> : (
        <>
          <Card>
            <div className="mb-1 font-semibold">Downloaded QIC Certificate</div>
            <div><b>District:</b> {(lookups?.districts ?? []).find((district) => district.id === cert.districtId)?.name ?? '—'}</div>
            <div><b>District Code:</b> {cert.districtCode ?? (lookups?.districts ?? []).find((district) => district.id === cert.districtId)?.districtCode ?? '—'}</div>
            <div><b>Allottee Name:</b> {cert.allotteeName}</div><div><b>CNIC:</b> {cert.cnic}</div>
            <div><b>Mailing Address:</b> {cert.mailingAddress}</div><div><b>Tehsil:</b> {cert.tehsil}</div>
            <div><b>Unique ID:</b> {cert.uniqueId}</div>
            <div><b>Punched 7-digit code:</b> {cert.punchedCode}</div>
            <div><b>Tracker IMEI:</b> {cert.imei}</div>
          </Card>
          <div className="flex gap-2">
            <SoftBtn className="flex-1 !text-xs" onClick={() => setAll(CERT_KEYS, 'match')}>Everything matches</SoftBtn>
          </div>
          <p className="text-xs text-slate-500">For each source, compare with the certificate and choose. Tehsil is ignored; mailing address cannot be verified at QIC.</p>
          {CERT_GROUPS.map((g) => {
            const keys = g.sources.map(([s]) => `${g.key}.${s}`);
            return (
              <Card key={g.key}>
                <div className="flex items-center justify-between"><b>{g.title}</b><SoftBtn className="!px-2 !py-1 text-xs" onClick={() => setAll(keys, 'match')}>All match</SoftBtn></div>
                {g.cert(cert) && <div className="mb-1 text-xs text-slate-500">Certificate: {g.cert(cert)}</div>}
                {g.sources.map(([s, label]) => (
                  <div key={s} className="mt-2"><Label>{label}</Label>
                    <select className={inputCls} value={r[`${g.key}.${s}`] ?? ''} onChange={(e) => update({ certCheck: { ...r, [`${g.key}.${s}`]: e.target.value as 'match' } })}>
                      <option value="">Select…</option><option value="match">Matches</option><option value="mismatch">Does not match</option>
                    </select>
                  </div>
                ))}
              </Card>
            );
          })}
          {mismatch && <Banner tone="danger">Mismatch found. Use "Information mismatch: defer complete lot" below.</Banner>}
        </>
      )}
      <Actions onBack={back} onNext={next} canNext={!!cert && answered && !mismatch} />
    </>
  );
}
