/**
 * Export shared PostgreSQL database (ne_exam_db) to backups/
 * Usage: npm run db:backup
 */
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

function loadDatabaseUrl() {
  if (!existsSync(envPath)) {
    throw new Error('Root .env not found. Set DATABASE_URL in restful_ne_starter/.env');
  }
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL="?([^"\n]+)"?/);
  if (!match) throw new Error('DATABASE_URL not found in .env');
  return match[1];
}

function parseDatabaseUrl(url) {
  const parsed = new URL(url.replace('postgresql://', 'http://'));
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: parsed.port || '5432',
    database: parsed.pathname.replace(/^\//, '').split('?')[0],
  };
}

const dbUrl = loadDatabaseUrl();
const { user, password, host, port, database } = parseDatabaseUrl(dbUrl);

const backupsDir = path.join(rootDir, 'backups');
mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outfile = path.join(backupsDir, `${database}_${timestamp}.sql`);

console.log(`Exporting database "${database}" to ${outfile}...`);

const env = { ...process.env, PGPASSWORD: password };

try {
  execSync(
    `pg_dump -U ${user} -h ${host} -p ${port} -d ${database} -F p -f "${outfile}"`,
    { env, stdio: 'inherit', shell: true }
  );
  console.log(`✅ Backup saved: ${outfile}`);
} catch {
  console.error('\n❌ pg_dump failed. Ensure PostgreSQL bin is in PATH and credentials in .env are correct.');
  console.error('   Manual: pg_dump -U postgres -d ne_exam_db > backups/backup.sql');
  process.exit(1);
}
