import { Module } from '@nestjs/common';
import { DbModule } from './database/db.service';
import { AuthModule } from './modules/auth/auth.module';
import { FieldModule } from './modules/field/field.module';
import { QicModule } from './modules/qic/qic.module';

@Module({ imports: [DbModule, AuthModule, FieldModule, QicModule] })
export class AppModule {}
