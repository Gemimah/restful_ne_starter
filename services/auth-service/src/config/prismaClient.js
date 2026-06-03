import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Use the single Prisma client generated at repo root (prisma/schema.prisma)
const require = createRequire(import.meta.url);
const rootClient = join(dirname(fileURLToPath(import.meta.url)), '../../../../node_modules/@prisma/client');

export const { PrismaClient } = require(rootClient);
