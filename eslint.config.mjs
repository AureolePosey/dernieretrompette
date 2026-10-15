import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Ignores par défaut d'eslint-config-next.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Client Prisma GÉNÉRÉ : produit par `prisma generate`, jamais écrit à la
    // main et jamais versionné. Le linter n'a rien à y corriger, et ses
    // centaines de `any` internes noieraient les vraies erreurs du projet.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
