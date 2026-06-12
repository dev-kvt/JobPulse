import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Creates a mock handler that returns sensible defaults for any Prisma model operation.
 * Used when DATABASE_URL is not configured (local dev without DB).
 */
function createMockModel() {
  return {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({}),
    createMany: async () => ({ count: 0 }),
    update: async () => ({}),
    updateMany: async () => ({ count: 0 }),
    upsert: async () => ({}),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: async () => ({}),
    groupBy: async () => [],
  };
}

function createMockClient(): PrismaClient {
  const mock = createMockModel();
  return new Proxy({} as PrismaClient, {
    get: (_target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$transaction') return async (fns: (() => Promise<unknown>)[]) => Promise.all(fns.map((f) => f()));
      if (prop === 'then') return undefined;
      // Return a mock model for any model name (job, company, etc.)
      return mock;
    },
  });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('[Prisma] Missing DATABASE_URL — using mock client');
    return createMockClient();
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
