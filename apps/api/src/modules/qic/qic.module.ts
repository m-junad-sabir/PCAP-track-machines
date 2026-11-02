import { BadRequestException, Body, Controller, Get, Module, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { memoryStorage } from 'multer';
import PDFDocument = require('pdfkit');
import { createReadStream, existsSync, readFileSync } from 'fs';
import { basename, join } from 'path';
const createArchive = require('archiver') as (format: 'zip', options: { zlib: { level: number } }) => any;
import { AuthUser, CurrentUser, REVIEWERS, Roles } from '../auth/decorators';
import { ListQuery, QicService } from './qic.service';
import { Db } from '../../database/db.service';

@Controller('qic')
export class QicController {
  constructor(private svc: QicService) {}

  // ---- field engineers ----
  @Post('sync') @Roles('field_engineer')
  sync(@CurrentUser() u: AuthUser, @Body() b: any) { return this.svc.sync(u, b?.id, b?.data); }

  @Post(':id/files') @Roles('field_engineer')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }))
  files(@CurrentUser() u: AuthUser, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() b: any) {
    return this.svc.saveFile(u, id, file, b);
  }

  // ---- dashboard ----
  @Get() @Roles(...REVIEWERS) list(@Query() q: ListQuery) { return this.svc.list(q); }
  @Get(':id') @Roles(...REVIEWERS) detail(@Param('id') id: string) { return this.svc.detail(id); }
  @Patch(':id/review') @Roles(...REVIEWERS)
  review(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() b: any) { return this.svc.review(u, id, b); }
}

@Controller('files')
export class FilesController {
  constructor(private svc: QicService) {}
  @Get(':id') @Roles(...REVIEWERS)
  async file(@Param('id') id: string, @Res() res: Response) {
    const f = await this.svc.fileInfo(id);
    res.type(f.mime ?? 'image/jpeg');
    res.sendFile(f.abs, (err) => { if (err && !res.headersSent) res.status(404).end(); });
  }
}

@Controller('gis')
export class GisController {
  constructor(private svc: QicService) {}
  @Get('locations') @Roles(...REVIEWERS) locations() { return this.svc.locations(); }
}

@Controller('reports')
export class ReportsController {
  constructor(private svc: QicService) {}

  @Get('qic.xlsx') @Roles(...REVIEWERS)
  async qic(@Query() q: ListQuery, @Res() res: Response) {
    const rows = await this.svc.list(q);
    if (rows.length > 20000) throw new BadRequestException('Too many rows; narrow the filters');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('QIC inspections');
    ws.columns = [
      { header: 'Submitted', key: 'submittedAt', width: 20 }, { header: 'Engineer', key: 'engineer', width: 24 },
      { header: 'District', key: 'district', width: 14 }, { header: 'Manufacturer', key: 'manufacturer', width: 26 },
      { header: 'Lot size', key: 'lotSize', width: 10 }, { header: 'Decision', key: 'decision', width: 10 },
      { header: 'QIC certificate #', key: 'certificateNo', width: 16 }, { header: 'Photos (of 8)', key: 'photos', width: 12 },
      { header: 'Worksheet pages', key: 'worksheets', width: 14 }, { header: 'Status', key: 'status', width: 14 },
      { header: 'Latitude', key: 'lat', width: 12 }, { header: 'Longitude', key: 'lng', width: 12 },
      { header: 'Review remarks', key: 'reviewRemarks', width: 40 },
    ];
    ws.getRow(1).font = { bold: true };
    rows.forEach((r) => ws.addRow({ ...r, submittedAt: new Date(r.submittedAt).toISOString().slice(0, 16).replace('T', ' ') }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="qic-report.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  }

  @Get('qic.pdf') @Roles(...REVIEWERS)
  async qicPdf(@Query() q: ListQuery, @Res() res: Response) {
    const rows = await this.svc.list(q);
    if (rows.length > 2000) throw new BadRequestException('Too many rows; narrow the filters');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qic-report.pdf"');
    const pdf = new PDFDocument({ margin: 40, size: 'A4' });
    pdf.pipe(res);
    pdf.fontSize(18).text('PCAP QIC Survey Report');
    pdf.moveDown().fontSize(10);
    for (const row of rows) {
      pdf.text(`${row.submittedAt ? new Date(row.submittedAt).toLocaleString() : ''} | ${row.engineer} | ${row.district} | ${row.manufacturer}`);
      pdf.text(`Lot: ${row.lotSize ?? '-'} | Certificate: ${row.certificateNo ?? '-'} | Decision: ${row.decision} | Status: ${row.status}`);
      pdf.text(`Evidence: ${row.photos}/8 photos, ${row.worksheets} worksheet pages | Record ID: ${row.id}`);
      pdf.moveDown(0.35);
    }
    pdf.end();
  }

  @Get('qic/:id.pdf') @Roles(...REVIEWERS)
  async qicRecordPdf(@Param('id') id: string, @Res() res: Response) {
    const d = await this.svc.detail(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="qic-${id.slice(0, 8)}.pdf"`);
    const pdf = new PDFDocument({ margin: 40, size: 'A4' });
    pdf.pipe(res);
    pdf.fontSize(18).text('PCAP QIC Survey Record');
    pdf.moveDown().fontSize(11);
    const fields: [string, any][] = [
      ['Record ID', d.id], ['Engineer', d.engineer], ['District / division', `${d.district} / ${d.division}`],
      ['Manufacturer', d.manufacturer], ['Submitted', d.submittedAt], ['Lot size', d.lotSize],
      ['Decision', d.decision], ['Status', d.status], ['QIC certificate', d.certificateNo],
      ['GPS', d.lat != null ? `${d.lat}, ${d.lng}` : 'Not recorded'],
      ['Photos', `${d.attachments.filter((a: any) => a.kind === 'photo').length}/8`],
      ['Worksheet pages', d.attachments.filter((a: any) => a.kind === 'worksheet').length],
      ['Review remarks', d.reviewRemarks ?? 'None'],
    ];
    fields.forEach(([k, v]) => pdf.text(`${k}: ${v ?? '-'}`));
    pdf.moveDown().fontSize(14).text('Survey evidence');
    for (const a of d.attachments as any[]) {
      const abs = join(process.env.UPLOAD_DIR!, a.filePath);
      const isImage = String(a.mime ?? '').startsWith('image/');
      if (!existsSync(abs)) {
        pdf.moveDown().fontSize(10).text(`${a.kind} ${a.slot}: File not available on server`);
        continue;
      }
      if (!isImage) {
        pdf.moveDown().fontSize(10).text(`${a.kind} ${a.slot}: PDF worksheet stored separately. Download the attachment ZIP to open the original PDF.`);
        continue;
      }
      try {
        pdf.addPage();
        pdf.fontSize(12).text(a.kind === 'photo'
          ? `Geo-tagged photo ${a.slot}`
          : `Technical worksheet page ${a.slot}`, { continued: false });
        if (a.kind === 'photo' && a.lat != null && a.lng != null) {
          pdf.fontSize(9).text(`GPS: ${a.lat}, ${a.lng}`);
        }
        pdf.image(readFileSync(abs), { fit: [515, 650], align: 'center', valign: 'center' });
      } catch {
        pdf.moveDown().fontSize(10).text(`${a.kind} ${a.slot}: Image could not be rendered`);
      }
    }
    pdf.end();
  }

  @Get('qic-files.zip') @Roles(...REVIEWERS)
  async qicFiles(@Query() q: ListQuery, @Res() res: Response) {
    const rows = await this.svc.list(q);
    if (rows.length > 2000) throw new BadRequestException('Too many rows; narrow the filters');
    const files = (await Promise.all(rows.map((row: any) => this.svc.attachmentFiles(row.id))))
      .flat();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="qic-survey-files.zip"');
    const archive = createArchive('zip', { zlib: { level: 9 } });
    archive.on('error', (error: Error) => { if (!res.headersSent) res.status(500).end(error.message); });
    archive.pipe(res);
    files.forEach((file: any) => {
      const abs = join(process.env.UPLOAD_DIR!, file.filePath);
      if (existsSync(abs)) {
        const folder = file.kind === 'worksheet' ? 'worksheets' : 'photos';
        const ext = basename(file.filePath);
        archive.append(createReadStream(abs), { name: `${file.inspectionId}/${folder}/${ext}` });
      }
    });
    await archive.finalize();
  }

  @Get('qic/:id/files.zip') @Roles(...REVIEWERS)
  async qicRecordFiles(@Param('id') id: string, @Res() res: Response) {
    const files = await this.svc.attachmentFiles(id);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="qic-${id.slice(0, 8)}-files.zip"`);
    const archive = createArchive('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    files.forEach((file: any) => {
      const abs = join(process.env.UPLOAD_DIR!, file.filePath);
      if (existsSync(abs)) {
        const folder = file.kind === 'worksheet' ? 'worksheets' : 'photos';
        archive.append(createReadStream(abs), { name: `${folder}/${basename(file.filePath)}` });
      }
    });
    await archive.finalize();
  }
}

@Controller('dic')
@Roles(...REVIEWERS)
export class DicController {
  constructor(private db: Db) {}

  @Get()
  async list() {
    return this.db.query(
      `SELECT d.id, d.qic_inspection_id AS "qicInspectionId", d.status,
              d.submitted_at AS "submittedAt",
              u.full_name AS engineer,
              COALESCE(q.district_id, NULL)::text AS "districtId"
         FROM dic_inspections d
         JOIN users u ON u.id = d.engineer_id
         LEFT JOIN qic_inspections q ON q.id = d.qic_inspection_id
         ORDER BY d.submitted_at DESC`,
    );
  }

  @Get('/reports/dic.xlsx')
  async excel(@Res() res: Response) {
    const rows = await this.list();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('DIC inspections');
    ws.columns = [
      { header: 'Record ID', key: 'id', width: 38 },
      { header: 'Linked QIC', key: 'qicInspectionId', width: 38 },
      { header: 'Engineer', key: 'engineer', width: 24 },
      { header: 'District ID', key: 'districtId', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Submitted', key: 'submittedAt', width: 20 },
    ];
    ws.getRow(1).font = { bold: true };
    rows.forEach((row: any) => ws.addRow({
      ...row,
      submittedAt: row.submittedAt ? new Date(row.submittedAt).toISOString().slice(0, 16).replace('T', ' ') : '',
    }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="dic-report.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  }

  @Get('/reports/dic.pdf')
  async pdf(@Res() res: Response) {
    const rows = await this.list();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="dic-report.pdf"');
    const pdf = new PDFDocument({ margin: 40, size: 'A4' });
    pdf.pipe(res);
    pdf.fontSize(18).text('PCAP DIC Survey Report');
    pdf.moveDown().fontSize(10);
    rows.forEach((row: any) => {
      pdf.text(`${row.submittedAt ? new Date(row.submittedAt).toLocaleString() : ''} | ${row.engineer} | ${row.status}`);
      pdf.text(`Record: ${row.id} | Linked QIC: ${row.qicInspectionId ?? '-'}`);
      pdf.moveDown(0.35);
    });
    pdf.end();
  }

  @Get('/reports/dic-files.zip')
  async files(@Res() res: Response) {
    const rows = await this.db.query(
      `SELECT a.inspection_id AS "inspectionId", a.kind, a.file_path AS "filePath"
         FROM dic_attachments a ORDER BY a.inspection_id, a.kind, a.slot`,
    );
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="dic-survey-files.zip"');
    const archive = createArchive('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    rows.forEach((file: any) => {
      const abs = join(process.env.UPLOAD_DIR!, file.filePath);
      if (existsSync(abs)) {
        const folder = file.kind === 'worksheet' ? 'worksheets' : 'photos';
        archive.append(createReadStream(abs), { name: `${file.inspectionId}/${folder}/${basename(file.filePath)}` });
      }
    });
    await archive.finalize();
  }
}

@Module({
  controllers: [QicController, FilesController, GisController, ReportsController, DicController],
  providers: [QicService],
})
export class QicModule {}
