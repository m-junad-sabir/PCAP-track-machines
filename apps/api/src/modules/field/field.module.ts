import { Controller, Get, Module } from '@nestjs/common';
import { Db } from '../../database/db.service';
import { AuthUser, CurrentUser, Roles } from '../auth/decorators';

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

@Controller('field')
@Roles('field_engineer')
export class FieldController {
  constructor(private db: Db) {}

  /** Assignment progress shown on the field app home screen. */
  @Get('home')
  async home(@CurrentUser() u: AuthUser) {
    const user = await this.db.one('SELECT username, full_name FROM users WHERE id=$1', [u.sub]);
    const rows = await this.db.query(
      `SELECT d.id AS "districtId", d.name AS district, a.machine_type AS "machineType", a.total_machines AS "totalMachines",
              (SELECT count(*) FROM manufacturers m WHERE m.district_id = d.id)::int AS manufacturers,
              (SELECT count(DISTINCT i.manufacturer_id) FROM qic_inspections i
                WHERE i.engineer_id = a.user_id AND i.district_id = d.id AND i.decision = 'pass')::int AS done
         FROM assignments a JOIN districts d ON d.id = a.district_id
        WHERE a.user_id = $1 ORDER BY d.name`,
      [u.sub],
    );
    return {
      user: { username: user!.username, fullName: user!.full_name },
      assignments: rows.map((r) => ({ ...r, toBeDone: Math.max(r.manufacturers - r.done, 0) })),
    };
  }

  /** Reference data the app caches for offline use. */
  @Get('lookups')
  async lookups(@CurrentUser() u: AuthUser) {
    const districts = await this.db.query(
      `SELECT d.id, d.name, d.division, d.convener,
              COALESCE(json_agg(json_build_object('id', m.id, 'name', m.name) ORDER BY m.name)
                       FILTER (WHERE m.id IS NOT NULL), '[]') AS manufacturers
         FROM districts d
         JOIN assignments a ON a.district_id = d.id AND a.user_id = $1
         LEFT JOIN manufacturers m ON m.district_id = d.id
        GROUP BY d.id ORDER BY d.name`,
      [u.sub],
    );
    const certificates = await this.db.query(
      `SELECT c.id, c.district_id AS "districtId", c.allottee_name AS "allotteeName", c.cnic,
              c.mailing_address AS "mailingAddress", c.tehsil,
              c.unique_id AS "uniqueId", c.punched_code AS "punchedCode", c.imei
         FROM certificates c JOIN assignments a ON a.district_id = c.district_id AND a.user_id = $1
         JOIN districts d ON d.id = c.district_id
        ORDER BY c.machine_id`,
      [u.sub],
    );
    const certificatesWithDistrict = certificates.map((row: Record<string, unknown>) => {
      const district = districts.find((item: { id: number }) => item.id === row.districtId);
      return {
        ...row,
        districtCode: DISTRICT_CODES[(district?.name as string) ?? ''] ?? '',
      };
    });
    return {
      districts: districts.map((row: Record<string, unknown>) => ({
        ...row,
        districtCode: DISTRICT_CODES[(row.name as string) ?? ''] ?? '',
      })),
      certificates: certificatesWithDistrict,
    };
  }
}

@Controller('meta')
export class MetaController {
  constructor(private db: Db) {}
  @Get('districts') districts() { return this.db.query('SELECT id, name FROM districts ORDER BY name'); }
}

@Module({ controllers: [FieldController, MetaController] })
export class FieldModule {}
