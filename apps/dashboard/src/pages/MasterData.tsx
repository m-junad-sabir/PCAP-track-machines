import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface District { id: number; name: string }
interface Staff {
  id: string;
  username: string;
  fullName: string;
  role: string;
  activities: string[];
  active: boolean;
  districts: District[];
}

interface Certificate {
  id: number;
  districtId: number;
  district: string;
  allotteeName: string;
  cnic: string;
  mailingAddress: string;
  tehsil: string;
  uniqueId: string;
  punchedCode: string;
  imei: string;
}

const DISTRICT_CODES: Record<string, string> = {
  'Bahawalnagar': 'BWN', 'Bahawalpur': 'BWP', 'Bakhar': 'BKR', 'Chiniot': 'CHN',
  'D.G. Khan': 'DGK', 'Faisalabad': 'FSD', 'Gujranwala': 'GUJ', 'Gujrat': 'GRT',
  'Hafizabad': 'HFZ', 'Jhang': 'JHG', 'Kasur': 'KSR', 'Khushab': 'KHB',
  'Kot Adu': 'KTA', 'Lahore': 'LHR', 'Layyah': 'LYH', 'Lodhran': 'LDN',
  'M/Garh': 'MGH', 'Mandi B. Din': 'MBD', 'Mianwali': 'MWI', 'Multan': 'MLT',
  'Nankana': 'NNK', 'Narowal': 'NRW', 'Okara': 'OKR', 'Pakpattan': 'PKP',
  'Rahimyar Khan': 'RYK', 'Rajanpur': 'RJP', 'Sahiwal': 'SWL', 'Sargodha': 'SGD',
  'Sheikhupura': 'SKP', 'Sialkot': 'SKT', 'Toba Tek Singh': 'TTS', 'Vehari': 'VHR',
  'Wazirabad': 'WZD', 'Jhelum': 'JHL',
};

export default function MasterData() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtSearch, setDistrictSearch] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', fullName: '', password: '', activities: ['QIC'], districtIds: [] as number[], active: true });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [certificateForm, setCertificateForm] = useState({
    districtId: '', allotteeName: '', cnic: '', mailingAddress: '', tehsil: '',
    uniqueId: '', punchedCode: '', imei: '',
  });
  const [certificateDistrictFilter, setCertificateDistrictFilter] = useState('');
  const [staffActivityFilter, setStaffActivityFilter] = useState<'All' | 'QIC' | 'DIC'>('All');

  const load = () => {
    Promise.all([api<Staff[]>('/admin/users'), api<District[]>('/meta/districts'), api<Certificate[]>('/admin/certificates')])
      .then(([users, districts, certificateRows]) => { setStaff(users); setDistricts(districts); setCertificates(certificateRows); })
      .catch((e: Error) => setError(e.message));
  };
  useEffect(load, []);

  function reset() {
    setEditing(null);
    setShowPassword(false);
    setDistrictSearch('');
    setForm({ username: '', fullName: '', password: '', activities: ['QIC'], districtIds: [], active: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api(`/admin/users/${editing.id}`, {
          method: 'PATCH',
          json: { fullName: form.fullName, password: form.password || undefined, activities: form.activities, districtIds: form.districtIds, active: form.active },
        });
      } else {
        await api('/admin/users', {
          method: 'POST',
          json: { username: form.username, fullName: form.fullName, password: form.password, activities: form.activities, districtIds: form.districtIds },
        });
      }
      reset();
      load();
    } catch (e) { setError((e as Error).message); }
  }

  async function remove(row: Staff) {
    if (!window.confirm(`Deactivate ${row.fullName}?`)) return;
    await api(`/admin/users/${row.id}`, { method: 'DELETE' }).then(load).catch((e: Error) => setError(e.message));
  }

  function edit(row: Staff) {
    setEditing(row);
    setShowPassword(false);
    setDistrictSearch('');
    setForm({
      username: row.username,
      fullName: row.fullName,
      password: '',
      activities: row.activities,
      districtIds: row.districts.map((district) => district.id),
      active: row.active,
    });
  }

  function editCertificate(row: Certificate) {
    setEditingCertificate(row);
    setCertificateForm({
      districtId: String(row.districtId), allotteeName: row.allotteeName, cnic: row.cnic,
      mailingAddress: row.mailingAddress ?? '', tehsil: row.tehsil ?? '',
      uniqueId: row.uniqueId ?? '', punchedCode: row.punchedCode ?? '', imei: row.imei,
    });
  }

  function resetCertificate() {
    setEditingCertificate(null);
    setCertificateForm({
      districtId: '', allotteeName: '', cnic: '', mailingAddress: '', tehsil: '',
      uniqueId: '', punchedCode: '', imei: '',
    });
  }

  async function submitCertificate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const json = { ...certificateForm, districtId: Number(certificateForm.districtId) };
      if (editingCertificate) {
        await api(`/admin/certificates/${editingCertificate.id}`, { method: 'PATCH', json });
      } else {
        await api('/admin/certificates', { method: 'POST', json });
      }
      resetCertificate();
      load();
    } catch (e) { setError((e as Error).message); }
  }

  async function removeCertificate(row: Certificate) {
    if (!window.confirm(`Delete certificate record for ${row.allotteeName}?`)) return;
    try {
      await api(`/admin/certificates/${row.id}`, { method: 'DELETE' });
      if (editingCertificate?.id === row.id) resetCertificate();
      load();
    } catch (e) { setError((e as Error).message); }
  }

  function changeCertificateDistrict(value: string) {
    const district = districts.find((row) => String(row.id) === value);
    const code = district ? DISTRICT_CODES[district.name] : undefined;
    setCertificateForm((current) => ({
      ...current,
      districtId: value,
      uniqueId: !editingCertificate && code
        ? `${code}-${current.uniqueId.replace(/^[A-Z]{3}-?/, '')}`
        : current.uniqueId,
    }));
  }

  const filteredStaff = staff.filter((row) =>
    staffActivityFilter === 'All' || row.activities.includes(staffActivityFilter),
  );
  const selectedCertificateDistrict = districts.find((row) => String(row.id) === certificateForm.districtId);
  const selectedDistrictCode = selectedCertificateDistrict ? DISTRICT_CODES[selectedCertificateDistrict.name] : '';

  return (
    <div className="space-y-4">
      <section className="panel">
        <h2>Staff master data ({staff.length})</h2>
        <div className="two-column mt-3">
      <section className="panel">
        <div className="mb-3 flex gap-2">
          {(['All', 'QIC', 'DIC'] as const).map((activity) => (
            <button
              key={activity}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                staffActivityFilter === activity ? 'bg-brand text-white' : 'border border-slate-300 bg-white text-slate-600'
              }`}
              onClick={() => setStaffActivityFilter(activity)}
            >
              {activity === 'All' ? 'All staff' : `${activity} staff`} (
              {activity === 'All' ? staff.length : staff.filter((row) => row.activities.includes(activity)).length})
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <div className="table-scroll max-h-[420px] overflow-y-auto">
          <table className="dark-table mt-3">
            <thead><tr><th>Name</th><th>Username</th><th>Activity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredStaff.map((row) => (
                <tr key={row.id}>
                  <td>{row.fullName}</td><td>{row.username}</td><td>{row.activities.join(', ')}</td>
                  <td className={row.active ? 'positive' : 'negative'}>{row.active ? 'Active' : 'Inactive'}</td>
                  <td className="flex gap-1"><button className="secondary-button" onClick={() => edit(row)}>Edit</button><button className="danger-button" onClick={() => remove(row)}>Remove</button></td>
                </tr>
              ))}
              {!filteredStaff.length && (
                <tr><td colSpan={5} className="muted py-8 text-center">No {staffActivityFilter === 'All' ? '' : staffActivityFilter + ' '}staff found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>{editing ? 'Edit staff' : 'Add staff'}</h2>
        <form className="mt-3 space-y-3" onSubmit={submit}>
          <input className="input w-full" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input className="input w-full" placeholder="Username" value={form.username} disabled={!!editing} onChange={(e) => setForm({ ...form, username: e.target.value })} required={!editing} />
          <div className="relative">
            <input className="input w-full pr-12" type={showPassword ? 'text' : 'password'} placeholder={editing ? 'New password (optional)' : 'Password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} autoComplete={editing ? 'new-password' : 'new-password'} />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-0 top-0 flex h-[38px] w-12 items-center justify-center text-slate-500 transition hover:text-[#1f5d5a]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5 0 9 5 9 8a9 9 0 01-2.1 3.6M6.1 6.1A10.8 10.8 0 003 12c0 3 4 8 9 8a9.8 9.8 0 004-.9" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
          <div>
            <p className="muted mb-2 text-sm">Activities</p>
            {['QIC', 'DIC'].map((activity) => (
              <label key={activity} className="mr-4 text-sm"><input className="mr-2" type="checkbox" checked={form.activities.includes(activity)} onChange={(e) => setForm({ ...form, activities: e.target.checked ? [...form.activities, activity] : form.activities.filter((value) => value !== activity) })} />{activity}</label>
            ))}
          </div>
          <div>
            <p className="muted mb-2 text-sm">District assignments</p>
            <input
              className="input w-full mb-2"
              type="search"
              placeholder="Search districts"
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
            />
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {[...districts]
                  .filter((district) => district.name.toLowerCase().includes(districtSearch.toLowerCase().trim()))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((district) => (
                    <label key={district.id} className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                      <input
                        className="mr-2"
                        type="checkbox"
                        checked={form.districtIds.includes(district.id)}
                        onChange={(e) => setForm({
                          ...form,
                          districtIds: e.target.checked
                            ? [...form.districtIds, district.id]
                            : form.districtIds.filter((id) => id !== district.id),
                        })}
                      />
                      {district.name}
                    </label>
                  ))}
              </div>
              {!districts.some((district) => district.name.toLowerCase().includes(districtSearch.toLowerCase().trim())) && (
                <p className="px-2 py-2 text-sm text-slate-500">No districts found</p>
              )}
            </div>
          </div>
          <div className="flex gap-2"><button className="action-button" type="submit">{editing ? 'Save changes' : 'Add staff'}</button>{editing && <button className="secondary-button" type="button" onClick={reset}>Cancel</button>}</div>
        </form>
      </section>
      </div>
      </section>
      <details className="panel" open>
        <summary className="cursor-pointer select-none font-semibold">QIC certificate master data ({certificates.length})</summary>
        <div className="two-column mt-3">
        <section className="panel">
          <label className="mb-3 block">
            <span className="muted mb-1 block text-sm">Select district</span>
            <select
              className="input w-full"
              value={certificateDistrictFilter}
              onChange={(e) => setCertificateDistrictFilter(e.target.value)}
            >
              <option value="">Select district</option>
              {[...districts].sort((a, b) => a.name.localeCompare(b.name)).map((district) => (
                <option key={district.id} value={district.name}>{district.name}</option>
              ))}
            </select>
          </label>
          {certificateDistrictFilter && [...new Set(certificates.map((row) => row.district))]
            .filter((district) => district === certificateDistrictFilter)
            .map((district) => {
              const rows = certificates.filter((row) => row.district === district);
              return (
                <details key={district} className="mb-2 rounded-lg border border-slate-200 bg-white">
                  <summary className="cursor-pointer select-none px-3 py-2 font-semibold">
                    {district} ({rows.length})
                  </summary>
                  <div className="table-scroll px-2 pb-2">
                    <table className="dark-table">
                      <thead><tr><th>Allottee name</th><th>CNIC</th><th>Unique ID</th><th>Punched code</th><th>IMEI</th><th>Actions</th></tr></thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.allotteeName}</td><td>{row.cnic}</td>
                            <td>{row.uniqueId ?? '—'}</td><td>{row.punchedCode ?? '—'}</td><td>{row.imei}</td>
                            <td className="flex gap-1"><button className="secondary-button" onClick={() => editCertificate(row)}>Edit</button><button className="danger-button" onClick={() => removeCertificate(row)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          {!certificateDistrictFilter && <p className="muted py-8 text-center text-sm">Select a district to view its certificate records</p>}
          {certificateDistrictFilter && !certificates.some((row) => row.district === certificateDistrictFilter) && <p className="muted py-4 text-center text-sm">No certificate records for {certificateDistrictFilter}</p>}
        </section>
        <section className="panel">
          <h2>{editingCertificate ? 'Edit QIC certificate' : 'Add QIC certificate'}</h2>
          <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={submitCertificate}>
            <select className="input w-full" value={certificateForm.districtId} onChange={(e) => changeCertificateDistrict(e.target.value)} required>
              <option value="">District</option>{[...districts].sort((a, b) => a.name.localeCompare(b.name)).map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
            </select>
            <input className="input w-full" placeholder="Allottee name" value={certificateForm.allotteeName} onChange={(e) => setCertificateForm({ ...certificateForm, allotteeName: e.target.value })} required />
            <input className="input w-full" placeholder="CNIC" value={certificateForm.cnic} onChange={(e) => setCertificateForm({ ...certificateForm, cnic: e.target.value })} required />
            <input className="input w-full" placeholder="Mailing address" value={certificateForm.mailingAddress} onChange={(e) => setCertificateForm({ ...certificateForm, mailingAddress: e.target.value })} />
            <input className="input w-full" placeholder="Tehsil" value={certificateForm.tehsil} onChange={(e) => setCertificateForm({ ...certificateForm, tehsil: e.target.value })} />
            <input
              className="input w-full"
              placeholder={selectedDistrictCode ? `${selectedDistrictCode}-Y01-2004228-SS1/1` : 'Unique ID (district short code required)'}
              title="Unique ID must begin with the selected district short code, for example OKR for Okara"
              value={certificateForm.uniqueId}
              onChange={(e) => setCertificateForm({ ...certificateForm, uniqueId: e.target.value })}
              required
            />
            <input className="input w-full" placeholder="Punched 7-digit code" maxLength={7} value={certificateForm.punchedCode} onChange={(e) => setCertificateForm({ ...certificateForm, punchedCode: e.target.value.replace(/\D/g, '') })} required />
            <input className="input w-full md:col-span-2" placeholder="Tracker IMEI" value={certificateForm.imei} onChange={(e) => setCertificateForm({ ...certificateForm, imei: e.target.value })} required />
            <div className="flex gap-2 md:col-span-2"><button className="action-button" type="submit">{editingCertificate ? 'Save certificate' : 'Add certificate'}</button>{editingCertificate && <button className="secondary-button" type="button" onClick={resetCertificate}>Cancel</button>}</div>
          </form>
        </section>
      </div>
      </details>
    </div>
  );
}
