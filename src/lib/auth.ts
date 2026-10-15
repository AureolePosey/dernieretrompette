import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";

/**
 * Authentification et contrôle d'accès.
 *
 * Coût bcrypt = 12 : environ 250 ms par vérification sur un CPU serverless.
 * Assez lent pour rendre une attaque par dictionnaire hors ligne coûteuse,
 * assez rapide pour ne pas dépasser le timeout d'une Server Action.
 */

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash factice servant à consommer le même temps CPU lorsqu'aucun compte ne
 * correspond à l'email. Sans cela, un attaquant distingue « email inconnu »
 * (réponse immédiate) de « mot de passe faux » (250 ms) et peut énumérer les
 * comptes existants.
 */
const DUMMY_HASH = "$2b$12$jic9Yc6AhuXSsFiDYIE4x.qvc4SlkJPeoiCgoAkGZ/V1YnHrw93sS";

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

/**
 * Vérifie un couple email / mot de passe.
 * Le message d'erreur est volontairement identique dans tous les cas d'échec :
 * il ne doit rien révéler sur l'existence ou l'état du compte.
 */
export async function authenticate(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const isValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.active || !isValid) {
    return { ok: false, error: "Identifiants incorrects." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    ok: true,
    session: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * À appeler en tête de CHAQUE page et Server Action d'administration.
 *
 * Le middleware protège déjà /admin/*, mais il ne doit jamais être l'unique
 * barrière : les Server Actions sont des points d'entrée HTTP à part entière
 * et peuvent être invoquées directement.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/** Restreint une opération aux administrateurs (gestion des comptes, paramètres). */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    redirect("/admin?error=forbidden");
  }
  return session;
}
