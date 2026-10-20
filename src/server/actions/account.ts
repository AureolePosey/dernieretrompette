"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { limitByIp } from "@/lib/rate-limit";
import { passwordChangeSchema, profileSchema } from "@/lib/validations/account";
import { type ActionState, zodErrorToState } from "@/lib/validations/shared";

/**
 * Compte de l'administrateur connecté.
 *
 * Toutes les opérations portent sur la session en cours : l'identifiant vient
 * du cookie signé, jamais du formulaire. Un champ caché contenant un `userId`
 * permettrait à un éditeur de modifier le compte d'un autre.
 */

export async function changePassword(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();

  // Limite le bourrinage du mot de passe actuel depuis une session volée.
  const limit = await limitByIp("password-change", 5, 600);
  if (!limit.success) {
    return {
      status: "error",
      message: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return { status: "error", message: "Compte introuvable." };

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return {
        status: "error",
        message: "Le mot de passe actuel est incorrect.",
        errors: { currentPassword: ["Mot de passe incorrect."] },
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
  } catch (cause) {
    console.error("[compte] changement de mot de passe impossible", cause);
    return { status: "error", message: "Le mot de passe n'a pas pu être modifié." };
  }

  return {
    status: "success",
    message: "Mot de passe modifié. Il sera demandé à votre prochaine connexion.",
  };
}

export async function updateProfile(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name: parsed.data.name },
    });

    // Le nom est inscrit dans le jeton de session : sans ce renouvellement, la
    // barre latérale afficherait l'ancien jusqu'à la prochaine connexion.
    await createSessionCookie({ ...session, name: parsed.data.name });
  } catch (cause) {
    console.error("[compte] mise à jour du profil impossible", cause);
    return { status: "error", message: "Le profil n'a pas pu être mis à jour." };
  }

  revalidatePath("/admin", "layout");
  return { status: "success", message: "Profil mis à jour." };
}
