import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Injectable, Module, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Db } from '../../database/db.service';
import { AuthGuard } from './auth.guard';
import { AuthUser, CurrentUser, Public, Roles } from './decorators';

const DISTRICT_CODES: Record<string, string> = {
  Bahawalnagar: 'BWN', Bahawalpur: 'BWP', Bakhar: 'BKR', Chiniot: 'CHN',
  'D.G. Khan': 'DGK', Faisalabad: 'FSD', Gujranwala: 'GUJ', Gujrat: 'GRT',
  Hafizabad: 'HFZ', Jhang: 'JHG', Kasur: 'KSR', Khushab: 'KHB',
  'Kot Adu': 'KTA', Lahore: 'LHR', Layyah: 'LYH', Lodhran: 'LDN',
  'M/Garh': 'MGH', 'Mandi B. Din': 'MBD', Mianwali: 'MWI', Multan: 'MLT',
  Nankana: 'NNK', Narowal: 'NRW', Okara: 'OKR', Pakpattan: 'PKP',
  'Rahimyar Khan': 'RYK', Rajanpur: 'RJP', Sahiwal: 'SWL', Sargodha: 'SGD',
  Sheikhupura: 'SKP', Sialkot: 'SKT', 'Toba Tek Singh': 'TTS', Vehari: 'VHR',
  Wazirabad: 'WZD', Jhelum: 'JHL',
};

@Injectable()
export class AuthService {
  constructor(private db: Db, private jwt: JwtService) {}

  async login(b: { username?: string; password?: string; activity?: string; portal?: string }) {
    if (!b?.username || !b?.password) throw new BadRequestException('Username and password are required');
    const u = await this.db.one(`SELECT * FROM users WHERE username = $1`, [b.username.trim().toLowerCase()]);
    if (!u || !u.active || !(await bcrypt.compare(b.password, u.password_hash)))
      throw new UnauthorizedException('Invalid username or password');
    if (b.portal === 'dashboard' && u.role === 'field_engineer')
      throw new ForbiddenException('Field engineers use the field app');
    if (b.portal !== 'dashboard' && u.role !== 'field_engineer')
      throw new ForbiddenException('Use the MIS dashboard to sign in with this account');
    if (b.activity && u.role === 'field_engineer' && !u.activities.includes(b.activity))
      throw new ForbiddenException(`This account is not assigned to ${b.activity}`);

    await this.db.audit(u.id, 'login', 'user', u.id);
    const token = await this.jwt.signAsync({ sub: u.id, username: u.username, role: u.role });
    return { token, user: { id: u.id, username: u.username, fullName: u.full_name, role: u.role } };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}
  @Public() @Post('login') login(@Body() body: any) { return this.svc.login(body); }
  @Get('me') me(@CurrentUser() u: AuthUser) { return u; }
}

@Controller('admin')
@Roles('pcap_admin', 'system_admin')
export class AdminController {
  constructor(private db: Db) {}

  @Get('users')
  async users() {
    return this.db.query(
      `SELECT u.id, u.username, u.full_name AS "fullName", u.role, u.activities, u.active,
              COALESCE(
                json_agg(json_build_object('id', d.id, 'name', d.name) ORDER BY d.name)
                  FILTER (WHERE d.id IS NOT NULL),
                '[]'
              ) AS districts
         FROM users u
         LEFT JOIN assignments a ON a.user_id = u.id
         LEFT JOIN districts d ON d.id = a.district_id
         WHERE u.role = 'field_engineer'
         GROUP BY u.id
         ORDER BY u.full_name`,
    );
  }

  @Post('users')
  async createUser(@Body() b: {
    username: string; fullName: string; password: string; activities: string[]; districtIds: number[];
  }, @CurrentUser() admin: AuthUser) {
    if (!b.username?.trim() || !b.fullName?.trim() || !b.password)
      throw new BadRequestException('Full name, username, and password are required');
    const activities = [...new Set((b.activities ?? []).filter((v) => v === 'QIC' || v === 'DIC'))];
    if (!activities.length) throw new BadRequestException('Select at least one activity');

    const hash = await bcrypt.hash(b.password, 10);
    const existing = await this.db.one('SELECT id FROM users WHERE username = $1', [b.username.trim().toLowerCase()]);
    if (existing) throw new BadRequestException('Username already exists');

    const user = await this.db.one(
      `INSERT INTO users (username, full_name, password_hash, role, activities, active)
       VALUES ($1,$2,$3,'field_engineer',$4,true)
       RETURNING id`,
      [b.username.trim().toLowerCase(), b.fullName.trim(), hash, activities],
    );
    if (!user) throw new BadRequestException('Unable to create user');

    for (const districtId of [...new Set(b.districtIds ?? [])]) {
      await this.db.exec(
        'INSERT INTO assignments (user_id, district_id, machine_type, total_machines) VALUES ($1,$2,$3,0) ON CONFLICT DO NOTHING',
        [user.id, districtId, 'Super Seeder'],
      );
    }
    await this.db.audit(admin.sub, 'create_staff', 'user', user.id);
    return { id: user.id, username: b.username.trim().toLowerCase(), fullName: b.fullName.trim(), role: 'field_engineer', activities, active: true };
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() b: {
    fullName?: string; password?: string; activities?: string[]; districtIds?: number[]; active?: boolean;
  }, @CurrentUser() admin: AuthUser) {
    const user = await this.db.one('SELECT id FROM users WHERE id=$1', [id]);
    if (!user) throw new BadRequestException('User not found');

    const set: string[] = [];
    const values: unknown[] = [];
    let index = 1;
    if (b.fullName !== undefined) { set.push(`full_name = $${index++}`); values.push(b.fullName.trim()); }
    if (b.password) { set.push(`password_hash = $${index++}`); values.push(await bcrypt.hash(b.password, 10)); }
    if (b.activities !== undefined) {
      const activities = [...new Set(b.activities.filter((v) => v === 'QIC' || v === 'DIC'))];
      if (!activities.length) throw new BadRequestException('Select at least one activity');
      set.push(`activities = $${index++}`); values.push(activities);
    }
    if (b.active !== undefined) { set.push(`active = $${index++}`); values.push(b.active); }
    if (set.length) {
      values.push(id);
      await this.db.exec(`UPDATE users SET ${set.join(',')} WHERE id=$${index}`, values);
    }
    if (b.districtIds !== undefined) {
      await this.db.exec('DELETE FROM assignments WHERE user_id=$1', [id]);
      for (const districtId of [...new Set(b.districtIds)]) {
        await this.db.exec(
          'INSERT INTO assignments (user_id, district_id, machine_type, total_machines) VALUES ($1,$2,$3,0)',
          [id, districtId, 'Super Seeder'],
        );
      }
    }
    await this.db.audit(admin.sub, 'update_staff', 'user', id);
    return { id };
  }

  @Delete('users/:id')
  async removeUser(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    await this.db.exec("UPDATE users SET active=false WHERE id=$1 AND role='field_engineer'", [id]);
    await this.db.audit(admin.sub, 'remove_staff', 'user', id);
    return { id, active: false };
  }

  @Get('certificates')
  certificates() {
    return this.db.query(
      `SELECT c.id, c.district_id AS "districtId", d.name AS district,
              c.allottee_name AS "allotteeName", c.cnic,
              c.mailing_address AS "mailingAddress", c.tehsil,
              c.unique_id AS "uniqueId",
              c.punched_code AS "punchedCode", c.imei
         FROM certificates c JOIN districts d ON d.id = c.district_id
        ORDER BY d.name, c.allottee_name`,
    );
  }

  @Post('certificates')
  async createCertificate(@Body() b: any, @CurrentUser() admin: AuthUser) {
    const districtId = Number(b.districtId);
    if (!districtId || !b.allotteeName?.trim() || !b.cnic?.trim() || !b.uniqueId?.trim() || !b.punchedCode?.trim() || !b.imei?.trim())
      throw new BadRequestException('District, allottee name, CNIC, unique ID, punched code, and IMEI are required');
    const district = await this.db.one('SELECT name FROM districts WHERE id=$1', [districtId]);
    const districtCode = district ? DISTRICT_CODES[district.name] : undefined;
    const uniqueId = b.uniqueId.trim().toUpperCase();
    if (!districtCode || !uniqueId.startsWith(districtCode))
      throw new BadRequestException(`Unique ID must begin with ${districtCode ?? 'the district short code'}, such as ${districtCode}-Y01-...`);
    const row = await this.db.one(
      `INSERT INTO certificates
         (district_id, allottee_name, cnic, mailing_address, tehsil, machine_id, unique_id, punched_code, imei)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [districtId, b.allotteeName.trim(), b.cnic.trim(), b.mailingAddress?.trim() || null, b.tehsil?.trim() || null,
       uniqueId, uniqueId, b.punchedCode.trim(), b.imei.trim()],
    );
    await this.db.audit(admin.sub, 'create_certificate', 'certificate', String(row.id));
    return row;
  }

  @Patch('certificates/:id')
  async updateCertificate(@Param('id') id: string, @Body() b: any, @CurrentUser() admin: AuthUser) {
    const existing = await this.db.one('SELECT id FROM certificates WHERE id=$1', [Number(id)]);
    if (!existing) throw new BadRequestException('Certificate row not found');
    const requiredText = [
      b.districtId, b.allotteeName, b.cnic, b.uniqueId, b.punchedCode, b.imei,
    ];
    if (requiredText.some((value) => value === undefined || value === null || String(value).trim() === ''))
      throw new BadRequestException('District, allottee name, CNIC, unique ID, punched code, and IMEI are required');
    const district = await this.db.one('SELECT name FROM districts WHERE id=$1', [Number(b.districtId)]);
    const districtCode = district ? DISTRICT_CODES[district.name] : undefined;
    const uniqueId = b.uniqueId.trim().toUpperCase();
    if (!districtCode || !uniqueId.startsWith(districtCode))
      throw new BadRequestException(`Unique ID must begin with ${districtCode ?? 'the district short code'}, such as ${districtCode}-Y01-...`);
    await this.db.exec(
      `UPDATE certificates SET
         district_id=$2, allottee_name=$3, cnic=$4, mailing_address=$5, tehsil=$6,
         machine_id=$7, unique_id=$8, punched_code=$9, imei=$10
       WHERE id=$1`,
      [Number(id), Number(b.districtId), b.allotteeName.trim(), b.cnic.trim(), b.mailingAddress?.trim() || null,
       b.tehsil?.trim() || null, uniqueId, uniqueId, b.punchedCode.trim(), b.imei.trim()],
    );
    await this.db.audit(admin.sub, 'update_certificate', 'certificate', id);
    return { id: Number(id) };
  }

  @Delete('certificates/:id')
  async removeCertificate(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    await this.db.exec('DELETE FROM certificates WHERE id=$1', [Number(id)]);
    await this.db.audit(admin.sub, 'remove_certificate', 'certificate', id);
    return { id: Number(id) };
  }
}

@Module({
  imports: [JwtModule.registerAsync({ global: true, useFactory: () => ({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '12h' } }) })],
  controllers: [AuthController, AdminController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
