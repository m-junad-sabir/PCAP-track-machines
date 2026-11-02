import { config } from 'dotenv';
import { resolve } from 'path';

// Loads <project-root>/.env (works from both src/ and dist/)
config({ path: resolve(__dirname, '../../../../.env') });
process.env.DATABASE_URL ??= 'postgresql://pcap:pcap@localhost:5432/pcap';
process.env.JWT_SECRET ??= 'dev-secret-change-me';
process.env.UPLOAD_DIR = resolve(__dirname, '../../../../', process.env.UPLOAD_DIR ?? './uploads');
