import "server-only";
import { headers } from "next/headers";

/**
 * Limitation de débit.
 *
 * Implémentation volontairement simple : compteurs en mémoire du processus.
 *
 * LIMITE ASSUMÉE : en serverless, chaque instance a sa propre mémoire et les
 * compteurs disparaissent au recyclage. Ce n'est donc pas une protection contre
 * une attaque distribuée, mais contre le cas réel qui nous concerne : un bot
 * qui martèle le formulaire de contact ou le login depuis une seule adresse.
 *
 * Combiné au honeypot (formulaires) et au délai bcrypt (login), cela couvre le
 * besoin d'une coopérative. Si le trafic malveillant devient significatif,
 * remplacer `hits` par un store Redis/Upstash sans changer l'interface.
 */

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

/** Purge paresseuse : évite de faire croître la Map indéfiniment. */
function sweep(now: number): void {
  if (hits.size < 500) return;
  for (const [key, bucket] of hits) {
    if (bucket.resetAt <= now) hits.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Secondes à attendre avant de pouvoir réessayer. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = hits.get(key);

  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { success: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Adresse IP du visiteur.
 * On lit `x-forwarded-for` car l'application tourne derrière un proxy (Vercel).
 * Le premier élément est l'IP cliente ; les suivantes sont les proxys traversés.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** Raccourci : limite une action par IP. */
export async function limitByIp(
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const ip = await clientIp();
  return rateLimit(`${action}:${ip}`, limit, windowSeconds);
}
