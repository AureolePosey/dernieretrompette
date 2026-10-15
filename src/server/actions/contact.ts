"use server";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyContactMessage } from "@/lib/mailer";
import { limitByIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations/contact";
import { trainingRegistrationSchema } from "@/lib/validations/order";
import { notifyTrainingRegistration } from "@/lib/mailer";
import { type ActionState, zodErrorToState } from "@/lib/validations/shared";

/**
 * Formulaires publics : contact et inscription à une formation.
 *
 * Chaîne de protection, dans cet ordre :
 *   1. limitation de débit par IP  — arrête le martèlement automatisé ;
 *   2. champ piège (honeypot)      — arrête les robots qui remplissent tout ;
 *   3. validation Zod côté serveur — arrête les données malformées ;
 *   4. écriture en base ;
 *   5. notification email, dont l'échec NE fait PAS échouer l'enregistrement.
 *
 * L'ordre compte : on rejette au plus tôt, avant toute écriture.
 */

export async function submitContactForm(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = await limitByIp("contact", 5, 600); // 5 messages / 10 minutes
  if (!limit.success) {
    return {
      status: "error",
      message: `Trop de messages envoyés. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return zodErrorToState(parsed.error);
  }

  // Le piège est rempli : c'est un robot. On répond « succès » sans rien
  // enregistrer, pour ne pas lui signaler que la détection a fonctionné.
  if (parsed.data.website) {
    return { status: "success", message: "Votre message a bien été envoyé." };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: { name, email, phone: phone ?? null, subject, message },
    });
  } catch (cause) {
    console.error("[contact] enregistrement impossible", cause);
    return {
      status: "error",
      message:
        "Votre message n'a pas pu être enregistré. Réessayez dans un instant ou appelez-nous.",
    };
  }

  // Le message est en base : même sans email, il sera lu depuis
  // l'administration. Un échec d'envoi ne doit donc pas alarmer le visiteur.
  await notifyContactMessage({
    name,
    email,
    phone,
    subject,
    message,
    siteUrl: env.SITE_URL,
  });

  return {
    status: "success",
    message: "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.",
  };
}

export async function submitTrainingRegistration(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = await limitByIp("training-registration", 5, 600);
  if (!limit.success) {
    return {
      status: "error",
      message: `Trop de demandes envoyées. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  const parsed = trainingRegistrationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return zodErrorToState(parsed.error);
  }

  if (parsed.data.website) {
    return { status: "success", message: "Votre demande a bien été envoyée." };
  }

  const { trainingId, fullName, phone, email, message } = parsed.data;

  try {
    // On revérifie que la formation existe ET est publiée : l'identifiant
    // vient du formulaire, donc du client, donc il n'est pas digne de confiance.
    const training = await prisma.training.findFirst({
      where: { id: trainingId, published: true },
      select: { id: true, title: true },
    });

    if (!training) {
      return { status: "error", message: "Cette formation n'est plus disponible." };
    }

    await prisma.trainingRegistration.create({
      data: { trainingId: training.id, fullName, phone, email: email ?? null, message: message ?? null },
    });

    await notifyTrainingRegistration({
      trainingTitle: training.title,
      fullName,
      phone,
      email,
      siteUrl: env.SITE_URL,
    });
  } catch (cause) {
    console.error("[training-registration] enregistrement impossible", cause);
    return {
      status: "error",
      message: "Votre demande n'a pas pu être enregistrée. Réessayez dans un instant.",
    };
  }

  return {
    status: "success",
    message:
      "Votre demande d'inscription est enregistrée. Nous vous recontacterons pour la confirmer.",
  };
}
