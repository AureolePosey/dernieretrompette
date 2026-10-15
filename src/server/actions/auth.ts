"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { createSessionCookie, destroySessionCookie } from "@/lib/session";
import { limitByIp } from "@/lib/rate-limit";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Connexion et déconnexion des administrateurs.
 *
 * Trois protections contre l'attaque par force brute :
 *   - limitation à 8 tentatives par IP toutes les 10 minutes ;
 *   - bcrypt à coût 12, qui rend chaque essai coûteux côté serveur ;
 *   - message d'erreur identique quelle que soit la cause, pour ne jamais
 *     révéler qu'une adresse email correspond à un compte existant.
 */

const loginSchema = z.object({
  email: z.string().trim().min(1, "L'email est obligatoire.").max(200),
  password: z.string().min(1, "Le mot de passe est obligatoire.").max(200),
  // Destination d'origine, mémorisée par le proxy avant la redirection.
  from: z.string().optional(),
});

export async function login(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = await limitByIp("login", 8, 600);
  if (!limit.success) {
    return {
      status: "error",
      message: `Trop de tentatives de connexion. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Renseignez votre email et votre mot de passe." };
  }

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  await createSessionCookie(result.session);

  // Destination validée : on n'accepte QUE des chemins internes commençant par
  // « /admin/ ». Sans ce contrôle, ?from=https://site-malveillant.example
  // transformerait notre page de connexion en tremplin de redirection ouverte.
  const target =
    parsed.data.from &&
    parsed.data.from.startsWith("/admin") &&
    !parsed.data.from.startsWith("//")
      ? parsed.data.from
      : "/admin";

  redirect(target);
}

export async function logout(): Promise<void> {
  await destroySessionCookie();
  redirect("/admin/login");
}
