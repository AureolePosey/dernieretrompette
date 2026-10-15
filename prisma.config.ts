import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * Configuration Prisma 7.
 *
 * Depuis Prisma 7, l'URL de connexion ne vit plus dans schema.prisma : elle est
 * déclarée ici pour les commandes CLI (migrate, studio, seed) et passée au
 * PrismaClient applicatif via un driver adapter (voir src/lib/db.ts).
 * Avantage concret : le secret n'apparaît dans aucun fichier versionné, et la
 * même base peut être atteinte par un pooler différent en build et en runtime.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
