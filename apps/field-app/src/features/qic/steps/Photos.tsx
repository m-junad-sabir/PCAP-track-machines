import { useRef, useState } from 'react';
import { Actions, Banner } from '../../../components/ui';
import { putFile } from '../../../lib/db';
import { compressImage, getPosition } from '../../../lib/gps';
import { PHOTO_SLOTS } from '../../../lib/types';
import type { StepProps } from '../stepProps';
import { useFiles } from '../useFiles';

export default function Photos({ draft, next, back }: StepProps) {
  const { files, reload } = useFiles(draft.id, 'photo');
  const input = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onFile(f?: File) {
    if (!f || !slot) return;
    setBusy(true); setErr('');
    try {
      const pos = await getPosition(); // photo is only accepted with a GPS fix
      await putFile({ inspectionId: draft.id, kind: 'photo', slot, blob: await compressImage(f), lat: pos.lat, lng: pos.lng, capturedAt: new Date().toISOString() });
      await reload();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }

  return (
    <>
      <p className="text-sm text-slate-500">Tap to capture with GPS. {files.length}/8 taken.</p>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="grid grid-cols-2 gap-2">
        {PHOTO_SLOTS.map((label, i) => {
          const f = files.find((x) => x.slot === i + 1);
          return (
            <button key={i} disabled={busy} onClick={() => { setSlot(i + 1); setTimeout(() => input.current?.click(), 0); }}
              className={`rounded-lg border p-2 text-left text-xs ${f ? 'border-brand bg-brand-light' : 'border-dashed border-slate-300 bg-stone-50'}`}>
              <b>{i + 1}.</b> {label}
              {f && <div className="mt-1 text-[10px] text-brand">✓ {f.lat?.toFixed(5)}N, {f.lng?.toFixed(5)}E · {new Date(f.capturedAt).toTimeString().slice(0, 5)}</div>}
            </button>
          );
        })}
      </div>
      {busy && <Banner tone="warn">Saving photo with GPS…</Banner>}
      {err && <Banner tone="danger">{err}</Banner>}
      <Actions onBack={back} onNext={next} canNext={files.length === 8} />
    </>
  );
}
