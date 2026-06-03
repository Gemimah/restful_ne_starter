import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load shared root .env first (single database for all microservices)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
// Then service-specific .env (PORT, JWT, etc.)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export function loadSharedEnv() {
  return process.env;
}
