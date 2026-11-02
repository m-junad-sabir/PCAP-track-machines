const QIC_STEPS = [
  'Intimation', 'Lot and firm', 'Eligibility gate', 'Worksheet for compliance of approval technical specification',
  'Certificate check', 'Geo-tagged photos', 'Sign-off',
];
const DIC_STEPS = [
  'Intimation', 'Verification header', 'Tamper gate', 'Chain of custody',
  'Certificate check', 'Handover', 'Geo-tagged photos', 'Sign-off',
];

export default function MachineConfig() {
  return (
    <div>
      <section className="panel mb-4 flex items-center justify-between">
        <div>
          <h2>Super Seeder - v2</h2>
          <p className="muted mt-1 text-sm">Configuration for the active machine type. Uploads are linked to the QIC/DIC workflows below.</p>
        </div>
      </section>
      <div className="two-column">
        <section className="panel">
          <h3>QIC workflow (7 steps)</h3>
          <ol className="mt-3 space-y-3">{QIC_STEPS.map((step, index) => <li key={step}><b>{index + 1}.</b> {step}</li>)}</ol>
          <h3 className="mt-6">DIC workflow (8 steps)</h3>
          <ol className="mt-3 space-y-3">{DIC_STEPS.map((step, index) => <li key={step}><b>{index + 1}.</b> {step}</li>)}</ol>
        </section>
        <section className="panel">
          <h3>Required photos</h3>
          <div className="mt-4">
            <b>QIC</b>
            <ol className="muted mt-2 space-y-2">
              <li>1. Sign board of manufacturing firm</li>
              <li>2. Machine with tracker under mast frame</li>
              <li>3. UID plate with FE signature</li>
              <li>4. Punched 7-digit code</li>
              <li>5. Decoded UID-plate QR</li>
              <li>6. Decoded tracker QR</li>
              <li>7. QIC members with manufacturer</li>
            </ol>
            <b className="mt-5 block">DIC</b>
            <ol className="muted mt-2 space-y-2">
              <li>1. CNIC of farmer or nominee</li>
              <li>2. Machine with tracker under mast</li>
              <li>3. UID plate with FE signature</li>
              <li>4. Punched 7-digit code</li>
              <li>5. Decoded UID-plate QR</li>
              <li>6. Decoded tracker QR</li>
              <li>7. DIC members with farmer</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
