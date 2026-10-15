import "server-only";
import { cookies } from "next/headers";
import { env, isProduction } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/session-token";

/**
 * Gestion du cookie de session côté serveur.
 *
 * La cryptographie vit dans session-token.ts (edge-safe) ; ce module ne
 * s'occupe que du transport : poser, lire et supprimer le cookie.
 *
 * Le cookie est httpOnly (invisible en JavaScript, donc hors de portée d'un
 * XSS), secure en production (jamais en clair sur le réseau) et sameSite=lax
 * (non envoyé sur une requête POST cross-site, ce qui neutralise le CSRF sur
 * les Server Actions).
 */

export { SESSION_COOKIE };
export type { SessionPayload };

export async function createSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload, env.SESSION_SECRET);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Session courante, ou `null` si le visiteur n'est pas authentifié. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value, env.SESSION_SECRET);
}
