import './config/env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync(process.env.UPLOAD_DIR!, { recursive: true });
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, exposedHeaders: ['Content-Disposition'] });
  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`PCAP API listening on http://localhost:${port}/api`);
}
bootstrap();
