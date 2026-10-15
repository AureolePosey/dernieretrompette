import { SignJWT, jwtVerify } from "jose";

/**
 * Signature et vérification du jeton de session — SANS aucune dépendance à
 * `next/headers` ni au runtime Node.
 *
 * Ce module est importé à la fois par le proxy (edge runtime, où ni Prisma ni
 * `cookies()` ne sont disponibles) et par la couche serveur classique. C'est
 * précisément ce qui permet de protéger /admin/* au bord du réseau, avant même
 * d'atteindre une fonction serverless.
 */

export const SESSION_COOKIE = "ldt_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 jours

export type Role = "ADMIN" | "EDITOR";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setSubject(payload.userId)
    .sign(secretKey(secret));
}

/**
 * Retourne `null` sur toute anomalie — signature invalide, jeton expiré, forme
 * inattendue. L'appelant n'a jamais besoin de distinguer la cause pour décider
 * de refuser l'accès, et ne risque donc pas de laisser passer un cas oublié.
 */
export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(secret), { algorithms: ["HS256"] });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "EDITOR")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
