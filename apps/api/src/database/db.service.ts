import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class Db implements OnModuleDestroy {
  readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
    return (await this.pool.query(text, params)).rows as T[];
  }
  async one<T = any>(text: string, params: unknown[] = []): Promise<T | undefined> {
    return (await this.query<T>(text, params))[0];
  }
  async exec(text: string, params: unknown[] = []) {
    return this.pool.query(text, params);
  }
  async audit(userId: string | null, action: string, entity?: string, entityId?: string, details?: unknown) {
    await this.pool.query(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1,$2,$3,$4,$5)',
      [userId, action, entity ?? null, entityId ?? null, details ? JSON.stringify(details) : null],
    );
  }
  onModuleDestroy() { return this.pool.end(); }
}

@Global()
@Module({ providers: [Db], exports: [Db] })
export class DbModule {}
