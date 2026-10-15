import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { env, isProduction } from "@/lib/env";

/**
 * Client Prisma partagé.
 *
 * En développement, Next.js recharge les modules à chaque modification. Sans
 * mise en cache sur globalThis, chaque rechargement ouvrirait un nouveau pool
 * de connexions et saturerait PostgreSQL au bout de quelques minutes.
 *
 * Prisma 7 exige un driver adapter : `PrismaPg` gère le pool côté Node, ce qui
 * fonctionne aussi bien sur un serveur long que sur une fonction serverless
 * placée derrière un pooler (Neon, Supabase).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
