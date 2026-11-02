import '../config/env';
import * as bcrypt from 'bcryptjs';
import { Client } from 'pg';

const DISTRICTS: [string, string][] = [
  ['Faisalabad', 'Faisalabad'], ['Multan', 'Multan'], ['Vehari', 'Multan'], ['Kasur', 'Lahore'],
  ['Lahore', 'Lahore'], ['Okara', 'Sahiwal'], ['Gujranwala', 'Gujranwala'], ['Hafizabad', 'Gujranwala'],
  ['Sialkot', 'Gujranwala'], ['M/Garh', 'Dera Ghazi Khan'], ['Kot Adu', 'Dera Ghazi Khan'],
  ['Layyah', 'Dera Ghazi Khan'], ['Sargodha', 'Sargodha'], ['Lodhran', 'Multan'],
  ['Khanewal', 'Multan'], ['D.G. Khan', 'Dera Ghazi Khan'], ['Rajanpur', 'Dera Ghazi Khan'],
  ['Gujrat', 'Gujranwala'], ['Mandi B. Din', 'Gujranwala'], ['Wazirabad', 'Gujranwala'],
  ['Jhang', 'Faisalabad'], ['Chiniot', 'Faisalabad'], ['Sheikhupura', 'Lahore'],
  ['Nankana', 'Lahore'], ['Sahiwal', 'Sahiwal'], ['Pakpattan', 'Sahiwal'],
  ['Rahimyar Khan', 'Bahawalpur'], ['Bahawalnagar', 'Bahawalpur'], ['Narowal', 'Gujranwala'],
  ['Toba Tek Singh', 'Faisalabad'], ['Khushab', 'Sargodha'], ['Bakhar', 'Sargodha'],
  ['Mianwali', 'Sargodha'], ['Jhelum', 'Rawalpindi'], ['Bahawalpur', 'Bahawalpur'],
];
const DISTRICT_CODES: Record<string, string> = {
  Bahawalnagar: 'BWN', Bahawalpur: 'BWP', Bakhar: 'BKR', Chiniot: 'CHN',
  'D.G. Khan': 'DGK', Faisalabad: 'FSD', Gujranwala: 'GUJ', Gujrat: 'GRT',
  Hafizabad: 'HFZ', Jhang: 'JHG', Kasur: 'KSR', Khanewal: 'KWL', Khushab: 'KHB',
  'Kot Adu': 'KTA', Lahore: 'LHR', Layyah: 'LYH', Lodhran: 'LDN',
  'M/Garh': 'MGH', 'Mandi B. Din': 'MBD', Mianwali: 'MWI', Multan: 'MLT',
  Nankana: 'NNK', Narowal: 'NRW', Okara: 'OKR', Pakpattan: 'PKP',
  'Rahimyar Khan': 'RYK', Rajanpur: 'RJP', Sahiwal: 'SWL', Sargodha: 'SGD',
  Sheikhupura: 'SKP', Sialkot: 'SKT', 'Toba Tek Singh': 'TTS', Vehari: 'VHR',
  Wazirabad: 'WZD', Jhelum: 'JHL',
};
const QIC_ENGINEERS: [string, string, string[]][] = [
  ['qic01', 'Dr. Muhammad Ashraf', ['Faisalabad']],
  ['qic02', 'Abdul Aleem', ['Multan']],
  ['qic03', 'Ishtiaq Ali', ['Vehari']],
  ['qic04', 'Muhammad Akram', ['Kasur']],
  ['qic05', 'Rizwan ur Rehman', ['Lahore']],
  ['qic06', 'Mohsin Masood', ['Okara']],
  ['qic07', 'Abdul Mannan Ghaffar', ['Gujranwala', 'Hafizabad']],
  ['qic08', 'Muhammad Zubair', ['Sialkot']],
];
const DIC_ENGINEERS: [string, string, string[]][] = [
  ['dic01', 'Dr. Alamgir Akhter Khan', ['M/Garh', 'Kot Adu', 'Layyah']],
  ['dic02', 'Abdul Waheed Zafar', ['Sargodha']],
  ['dic03', 'Ghulam Siddique', ['Khanewal']],
  ['dic04', 'Dr. Usama Bin Ajmal', ['D.G. Khan', 'Rajanpur']],
  ['dic05', 'Mian Haroon Ahmad', ['Mandi B. Din', 'Wazirabad']],
  ['dic06', 'Muhammad Ahmed', ['Jhang', 'Chiniot']],
  ['dic07', 'Amir Nazir', ['Sheikhupura', 'Nankana']],
  ['dic08', 'Muhammad Naeem', ['Sahiwal', 'Pakpattan']],
  ['dic09', 'Altaf Hussain', ['Rahimyar Khan']],
  ['dic10', 'Shah Rasool', ['Bahawalnagar']],
  ['dic11', 'Faizan Khan', ['Narowal']],
  ['dic12', 'Abdul Ghaffar', ['Toba Tek Singh']],
  ['dic13', 'Abid Hussain Jaffery', ['Khushab', 'Bakhar', 'Mianwali', 'Jhelum']],
  ['dic14', 'Abid Ali', ['Bahawalpur']],
];
const NAMES = ['Shahid Ali', 'Muhammad Bilal', 'Imran Khan', 'Ghulam Abbas', 'Rashid Mehmood', 'Tariq Hussain'];

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const DEMO_PASSWORD = 'pcap123';
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10); // DEMO password - change before go-live

  for (const [name, division] of DISTRICTS)
    await c.query(
      'INSERT INTO districts (name, division, convener) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING',
      [name, division, `Director Agri. Engineering, ${division} Division`],
    );
  const dist: Record<string, number> = {};
  for (const r of (await c.query('SELECT id, name FROM districts')).rows) dist[r.name] = r.id;

  for (const [name] of DISTRICTS) {
    const firms = name === 'Faisalabad' ? ['Amjad Brothers', 'Supreme Agri Implements'] : [`${name} Agro Works`, `${name} Farm Implements`];
    for (const f of firms)
      await c.query('INSERT INTO manufacturers (name, district_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [f, dist[name]]);
  }

  const upsertUser = async (username: string, full: string, role: string, acts: string[]) =>
    (await c.query(
      `INSERT INTO users (username, full_name, password_hash, role, activities) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING id`,
      [username, full, hash, role, acts],
    )).rows[0].id as string;

  for (const [u, full, districts] of QIC_ENGINEERS) {
    const id = await upsertUser(u, full, 'field_engineer', ['QIC']);
    for (const d of districts)
      await c.query(
        'INSERT INTO assignments (user_id, district_id, total_machines) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, dist[d], u === 'qic01' ? 102 : 60],
      );
  }
  for (const [u, full, districts] of DIC_ENGINEERS) {
    const id = await upsertUser(u, full, 'field_engineer', ['DIC']);
    for (const d of districts)
      await c.query(
        'INSERT INTO assignments (user_id, district_id, total_machines) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, dist[d], 60],
      );
  }

  // Accounts shared by QIC and DIC must retain both activities and all assigned districts.
  const SHARED_DIC_ACCOUNTS: [string, string, string[]][] = [
    ['qic01', 'Dr. Muhammad Ashraf', ['Faisalabad']],
    ['qic02', 'Abdul Aleem', ['Multan', 'Lodhran']],
    ['qic03', 'Ishtiaq Ali', ['Vehari']],
    ['qic04', 'Muhammad Akram', ['Kasur']],
    ['qic05', 'Rizwan ur Rehman', ['Lahore']],
    ['qic06', 'Mohsin Masood', ['Okara']],
    ['qic07', 'Abdul Mannan Ghaffar', ['Gujranwala', 'Hafizabad', 'Gujrat']],
    ['qic08', 'Muhammad Zubair', ['Sialkot']],
  ];
  for (const [u, full, districts] of SHARED_DIC_ACCOUNTS) {
    const result = await c.query(
      `SELECT id FROM users WHERE username = $1`,
      [u],
    );
    const id = result.rows[0].id as string;
    await c.query(
      `UPDATE users SET activities = ARRAY['QIC','DIC'] WHERE id = $1`,
      [id],
    );
    for (const d of districts)
      await c.query(
        'INSERT INTO assignments (user_id, district_id, total_machines) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, dist[d], u === 'qic01' ? 102 : 60],
      );
  }
  await upsertUser('lead01', 'Project Lead (demo)', 'project_lead', []);
  await upsertUser('admin01', 'PCAP Admin (demo)', 'pcap_admin', []);
  await upsertUser('sysadmin01', 'System Administrator (demo)', 'system_admin', []);

  // Demo certificate rows (first one matches the prototype screenshots)
  let n = 0;
  for (const [d] of DISTRICTS)
    for (let i = 0; i < 3; i++, n++) {
      const first = d === 'Faisalabad' && i === 0;
      const code = first ? '3641752' : String(3000000 + n * 7919).slice(0, 7);
      const machineId = `Y01-${code}-SS1/1`;
      const districtCode = DISTRICT_CODES[d] ?? d.slice(0, 3).toUpperCase();
      await c.query(
        `INSERT INTO certificates (district_id, allottee_name, cnic, mailing_address, tehsil, machine_id, unique_id, punched_code, imei)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (machine_id) DO NOTHING`,
        [
          dist[d],
          first ? 'Shahid Ali' : NAMES[(n + i) % NAMES.length],
          first ? '3520245678979' : String(3520000000000 + n * 104729).slice(0, 13),
          first ? 'Chak 47, Mianwali' : `Chak ${10 + n}, ${d}`,
          first ? 'Mianwali' : d,
          machineId,
          `${districtCode}-${machineId}`,
          first ? '3641752' : code,
          first ? '356938035643837' : String(356938000000000 + n * 1299709).slice(0, 15),
        ],
      );
    }
  console.log('Seed complete. Demo logins: qic01..qic08, dic01..dic14, lead01, admin01, sysadmin01 (password: pcap123)');
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
