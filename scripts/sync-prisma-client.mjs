import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '.prisma', 'client');

function copyDirOverwrite(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const srcPath = join(from, entry.name);
    const destPath = join(to, entry.name);
    if (entry.isDirectory()) {
      copyDirOverwrite(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath, { force: true });
    }
  }
}

if (!existsSync(src)) {
  console.error('Missing generated client. Run: npm exec prisma generate --schema=prisma/schema.prisma');
  process.exit(1);
}

let failed = false;

for (const svc of ['auth-service', 'resource-service', 'reporting-service']) {
  const dest = join(root, 'services', svc, 'node_modules', '.prisma', 'client');
  try {
    copyDirOverwrite(src, dest);
    console.log(`Synced Prisma client → services/${svc}`);
  } catch (err) {
    failed = true;
    console.error(`Failed to sync services/${svc}: ${err.message}`);
    console.error('Stop npm run dev (Ctrl+C), close other terminals using the app, then run: npm run prisma:generate');
  }
}

if (failed) process.exit(1);
