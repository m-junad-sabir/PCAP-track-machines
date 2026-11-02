import { useEffect, useMemo, useRef, useState } from 'react';
import { Actions, Banner, Card, SoftBtn } from '../../../components/ui';
import { deleteFile, putFile } from '../../../lib/db';
import { compressImage } from '../../../lib/gps';
import type { StepProps } from '../stepProps';
import { useFiles } from '../useFiles';

export default function Worksheet({ draft, next, back }: StepProps) {
  const { files, reload } = useFiles(draft.id, 'worksheet');
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f.blob)), [files]);
  useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);

  async function add(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    let slot = Math.max(0, ...files.map((f) => f.slot));
    for (const f of Array.from(list)) {
      if (!f.type.startsWith('image/') && f.type !== 'application/pdf') continue;
      const blob = f.type === 'application/pdf' ? f : await compressImage(f, 2200, 0.85);
      await putFile({ inspectionId: draft.id, kind: 'worksheet', slot: ++slot, blob, capturedAt: new Date().toISOString() });
    }
    if (input.current) input.current.value = '';
    await reload(); setBusy(false);
  }

  return (
    <>
      <p className="text-sm text-slate-500">The FE shall upload the status of inspection recorded on the worksheet, duly signed by the convener of the QIC and by him. Take a clear photo of each page of the completed, signed sheet.</p>
      <Card>
        <input ref={input} type="file" accept="image/*,.pdf,application/pdf" multiple className="hidden" onChange={(e) => add(e.target.files)} />
        <SoftBtn onClick={() => input.current?.click()} disabled={busy} className="w-full">{busy ? 'Processing…' : 'Add worksheet page(s)'}</SoftBtn>
      </Card>
      {files.map((f, i) => (
        <Card key={f.key}>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Worksheet page {i + 1} of {files.length}</span>
            <button className="text-red-700" onClick={async () => { await deleteFile(f.key); await reload(); }}>Remove</button>
          </div>
          {f.blob.type === 'application/pdf'
            ? <a href={urls[i]} target="_blank" rel="noreferrer" className="block rounded border border-slate-200 p-3 text-center text-brand underline">Open worksheet PDF</a>
            : <img src={urls[i]} alt={`Worksheet page ${i + 1}`} className="w-full rounded border border-slate-200" />}
        </Card>
      ))}
      <Banner tone="warn">The admin can view and download these images from the MIS portal.</Banner>
      <Actions onBack={back} onNext={next} canNext={files.length > 0} />
    </>
  );
}
