import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Db } from '../../database/db.service';
import { AuthUser } from '../auth/decorators';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ['under_review', 'approved', 'flagged'];

export interface ListQuery { status?: string; districtId?: string; engineerId?: string; from?: string; to?: string; q?: string }

@Injectable()
export class QicService {
  constructor(private db: Db) {}

  /** Idempotent upload of one inspection (the phone retries until it succeeds). */
  async sync(user: AuthUser, id: string, d: any) {
    if (!UUID.test(id ?? '') || !d) throw new BadRequestException('Invalid inspection');
    const districtId = Number(d.districtId), manufacturerId = Number(d.manufacturerId);
    const decision = d.signoff?.decision;
    if (!districtId || !manufacturerId) throw new BadRequestException('District and manufacturer are required');
    if (!['pass', 'defer'].includes(decision)) throw new BadRequestException('Committee decision is required');

    const assigned = await this.db.one('SELECT 1 FROM assignments WHERE user_id=$1 AND district_id=$2', [user.sub, districtId]);
    if (!assigned) throw new ForbiddenException('District is not assigned to this engineer');
    const firm = await this.db.one('SELECT 1 FROM manufacturers WHERE id=$1 AND district_id=$2', [manufacturerId, districtId]);
    if (!firm) throw new BadRequestException('Manufacturer does not belong to the district');

    if (decision === 'pass') {
      const e = d.eligibility ?? {};
      if (!(e.uidPlate && e.punchedCode && e.tracker)) throw new BadRequestException('Eligibility gate not satisfied');
      if (!d.certificateId) throw new BadRequestException('Certificate check is missing');
      if (Object.values(d.certCheck ?? {}).some((v) => v !== 'match')) throw new BadRequestException('Certificate mismatch: lot cannot pass');
      if (!String(d.signoff?.certificateNo ?? '').trim()) throw new BadRequestException('QIC certificate number is required');
    }

    const hasLoc = d.firmLat != null && d.firmLng != null;
    await this.db.query(
      `INSERT INTO qic_inspections
         (id, engineer_id, district_id, manufacturer_id, lot_size, firm_location, intimation, eligibility,
          certificate_id, cert_check, decision, qic_certificate_no, signoff, client_created_at)
       VALUES ($1,$2,$3,$4,$5, CASE WHEN $6::boolean THEN ST_SetSRID(ST_MakePoint($7::float8,$8::float8),4326) END,
               $9::jsonb,$10::jsonb,$11,$12::jsonb,$13,$14,$15::jsonb,$16)
       ON CONFLICT (id) DO UPDATE SET
         lot_size = EXCLUDED.lot_size, firm_location = EXCLUDED.firm_location, intimation = EXCLUDED.intimation,
         eligibility = EXCLUDED.eligibility, certificate_id = EXCLUDED.certificate_id, cert_check = EXCLUDED.cert_check,
         decision = EXCLUDED.decision, qic_certificate_no = EXCLUDED.qic_certificate_no, signoff = EXCLUDED.signoff
       WHERE qic_inspections.engineer_id = EXCLUDED.engineer_id AND qic_inspections.status = 'submitted'`,
      [
        id, user.sub, districtId, manufacturerId, d.lotSize ?? null, hasLoc, d.firmLng ?? null, d.firmLat ?? null,
        JSON.stringify(d.intimation ?? {}), JSON.stringify(d.eligibility ?? {}), d.certificateId ?? null,
        JSON.stringify(d.certCheck ?? {}), decision, d.signoff?.certificateNo ?? null, JSON.stringify(d.signoff ?? {}),
        d.createdAt ?? null,
      ],
    );
    await this.db.audit(user.sub, 'qic.sync', 'qic', id, { decision });
    return { ok: true, id };
  }

  async saveFile(user: AuthUser, id: string, file: Express.Multer.File, b: any) {
    if (!UUID.test(id)) throw new BadRequestException('Invalid inspection');
    const allowedWorksheet = b.kind === 'worksheet' && file?.mimetype === 'application/pdf';
    if (!file?.mimetype?.startsWith('image/') && !allowedWorksheet) {
      throw new BadRequestException('An image or PDF worksheet is required');
    }
    const kind = b.kind, slot = parseInt(b.slot, 10);
    if (!['photo', 'worksheet'].includes(kind)) throw new BadRequestException('Invalid kind');
    if (!(slot >= 1 && slot <= (kind === 'photo' ? 8 : 30))) throw new BadRequestException('Invalid slot');
    const owner = await this.db.one('SELECT engineer_id FROM qic_inspections WHERE id=$1', [id]);
    if (!owner) throw new NotFoundException('Upload the inspection record first');
    if (owner.engineer_id !== user.sub) throw new ForbiddenException();

    const ext = file.mimetype === 'application/pdf' ? 'pdf' : file.mimetype === 'image/png' ? 'png' : 'jpg';
    const rel = `qic/${id}/${kind}-${slot}.${ext}`;
    await mkdir(join(process.env.UPLOAD_DIR!, 'qic', id), { recursive: true });
    await writeFile(join(process.env.UPLOAD_DIR!, rel), file.buffer);

    const lat = parseFloat(b.lat), lng = parseFloat(b.lng);
    const hasLoc = Number.isFinite(lat) && Number.isFinite(lng);
    await this.db.query(
      `INSERT INTO attachments (inspection_id, kind, slot, file_path, mime, location, captured_at)
       VALUES ($1,$2,$3,$4,$5, CASE WHEN $6::boolean THEN ST_SetSRID(ST_MakePoint($7::float8,$8::float8),4326) END, $9)
       ON CONFLICT (inspection_id, kind, slot) DO UPDATE
         SET file_path = EXCLUDED.file_path, mime = EXCLUDED.mime, location = EXCLUDED.location, captured_at = EXCLUDED.captured_at`,
      [id, kind, slot, rel, file.mimetype, hasLoc, hasLoc ? lng : null, hasLoc ? lat : null, b.capturedAt || null],
    );
    return { ok: true };
  }

  list(q: ListQuery) {
    const where: string[] = [];
    const p: unknown[] = [];
    const add = (sql: string, v: unknown) => { p.push(v); where.push(sql.replace('?', `$${p.length}`)); };
    if (q.status) add('i.status = ?', q.status);
    if (q.districtId) add('i.district_id = ?', Number(q.districtId));
    if (q.engineerId) add('i.engineer_id = ?', q.engineerId);
    if (q.from) add('i.submitted_at >= ?', q.from);
    if (q.to) add("i.submitted_at < (?::date + 1)", q.to);
    if (q.q) {
      p.push(`%${q.q}%`);
      const n = p.length;
      where.push(`(u.full_name ILIKE $${n} OR m.name ILIKE $${n} OR i.qic_certificate_no ILIKE $${n})`);
    }
    const sqlWhere = where.length ? 'WHERE ' + where.join(' AND ') : '';
    return this.db.query(
      `SELECT i.id, i.status, i.decision, i.lot_size AS "lotSize", i.qic_certificate_no AS "certificateNo",
              i.submitted_at AS "submittedAt", i.review_remarks AS "reviewRemarks",
              u.full_name AS engineer, d.name AS district, m.name AS manufacturer,
              ST_Y(i.firm_location) AS lat, ST_X(i.firm_location) AS lng,
              (SELECT count(*) FROM attachments a WHERE a.inspection_id = i.id AND a.kind = 'photo')::int AS photos,
              (SELECT count(*) FROM attachments a WHERE a.inspection_id = i.id AND a.kind = 'worksheet')::int AS worksheets
         FROM qic_inspections i
         JOIN users u ON u.id = i.engineer_id
         JOIN districts d ON d.id = i.district_id
         JOIN manufacturers m ON m.id = i.manufacturer_id
         ${sqlWhere}
        ORDER BY i.submitted_at DESC LIMIT 2000`,
      p,
    );
  }

  async detail(id: string) {
    if (!UUID.test(id)) throw new NotFoundException();
    const row = await this.db.one(
      `SELECT i.id, i.status, i.decision, i.lot_size AS "lotSize", i.intimation, i.eligibility, i.cert_check AS "certCheck",
              i.signoff, i.qic_certificate_no AS "certificateNo", i.review_remarks AS "reviewRemarks",
              i.submitted_at AS "submittedAt", i.reviewed_at AS "reviewedAt",
              u.full_name AS engineer, d.name AS district, d.division, m.name AS manufacturer,
              ST_Y(i.firm_location) AS lat, ST_X(i.firm_location) AS lng,
              CASE WHEN d.geom IS NULL OR i.firm_location IS NULL THEN NULL ELSE ST_Contains(d.geom, i.firm_location) END AS "insideDistrict",
              to_jsonb(c) - 'district_id' AS certificate
         FROM qic_inspections i
         JOIN users u ON u.id = i.engineer_id
         JOIN districts d ON d.id = i.district_id
         JOIN manufacturers m ON m.id = i.manufacturer_id
         LEFT JOIN certificates c ON c.id = i.certificate_id
        WHERE i.id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException();
    const attachments = await this.db.query(
      `SELECT id, kind, slot, file_path AS "filePath", mime,
              captured_at AS "capturedAt", ST_Y(location) AS lat, ST_X(location) AS lng
         FROM attachments WHERE inspection_id = $1 ORDER BY kind, slot`,
      [id],
    );
    return { ...row, attachments };
  }

  async review(user: AuthUser, id: string, b: { status?: string; remarks?: string }) {
    if (!STATUSES.includes(b?.status ?? '')) throw new BadRequestException('Invalid status');
    if (b.status === 'flagged' && !b.remarks?.trim()) throw new BadRequestException('Remarks are required when flagging');
    const r = await this.db.one(
      `UPDATE qic_inspections SET status=$2, review_remarks=$3, reviewed_by=$4, reviewed_at=now() WHERE id=$1 RETURNING id`,
      [id, b.status, b.remarks ?? null, user.sub],
    );
    if (!r) throw new NotFoundException();
    await this.db.audit(user.sub, 'qic.review', 'qic', id, { status: b.status, remarks: b.remarks });
    return { ok: true };
  }

  async fileInfo(id: string) {
    if (!UUID.test(id)) throw new NotFoundException();
    const a = await this.db.one('SELECT file_path, mime FROM attachments WHERE id=$1', [id]);
    if (!a) throw new NotFoundException();
    return { abs: join(process.env.UPLOAD_DIR!, a.file_path), mime: a.mime as string };
  }

  async attachmentFiles(inspectionId?: string) {
    const ids = inspectionId ? [inspectionId] : null;
    const rows = ids
      ? await this.db.query(
          `SELECT a.id, a.inspection_id AS "inspectionId", a.kind, a.slot, a.file_path AS "filePath", a.mime
             FROM attachments a WHERE a.inspection_id = $1 ORDER BY a.kind, a.slot`,
          ids,
        )
      : await this.db.query(
          `SELECT a.id, a.inspection_id AS "inspectionId", a.kind, a.slot, a.file_path AS "filePath", a.mime
             FROM attachments a ORDER BY a.inspection_id, a.kind, a.slot`,
        );
    return rows;
  }

  /** Firm locations as GeoJSON for the Map View. */
  async locations() {
    const rows = await this.db.query(
      `SELECT i.id, i.decision, i.status, i.lot_size AS "lotSize", d.name AS district, m.name AS manufacturer,
              u.full_name AS engineer, ST_X(i.firm_location) AS lng, ST_Y(i.firm_location) AS lat,
              CASE WHEN d.geom IS NULL THEN NULL ELSE ST_Contains(d.geom, i.firm_location) END AS "insideDistrict"
         FROM qic_inspections i
         JOIN users u ON u.id = i.engineer_id JOIN districts d ON d.id = i.district_id
         JOIN manufacturers m ON m.id = i.manufacturer_id
        WHERE i.firm_location IS NOT NULL`,
    );
    return {
      type: 'FeatureCollection',
      features: rows.map(({ lat, lng, ...props }) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { kind: 'QIC', ...props },
      })),
    };
  }
}
