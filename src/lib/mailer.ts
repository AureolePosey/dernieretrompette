import "server-only";
import { env, hasMailer } from "@/lib/env";

/**
 * Notifications par email (Resend).
 *
 * Entièrement optionnel : sans clé API, les fonctions ne font rien et
 * retournent `false`. Une commande ne doit JAMAIS échouer parce que l'email de
 * notification n'a pas pu partir — la commande est déjà en base, c'est elle qui
 * fait foi, et l'administration la montre de toute façon.
 *
 * Appel direct à l'API REST, sans SDK : un seul endpoint est utilisé.
 */

type SendArgs = { subject: string; text: string; replyTo?: string };

async function send({ subject, text, replyTo }: SendArgs): Promise<boolean> {
  if (!hasMailer) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [env.NOTIFY_EMAIL],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("Resend error", response.status, await response.text());
      return false;
    }
    return true;
  } catch (cause) {
    console.error("Resend request failed", cause);
    return false;
  }
}

export function notifyNewOrder(args: {
  reference: string;
  customerName: string;
  phone: string;
  total: string;
  itemCount: number;
  siteUrl: string;
}): Promise<boolean> {
  return send({
    subject: `Nouvelle commande ${args.reference}`,
    text: [
      `Nouvelle commande reçue : ${args.reference}`,
      "",
      `Client   : ${args.customerName}`,
      `Téléphone: ${args.phone}`,
      `Articles : ${args.itemCount}`,
      `Total    : ${args.total}`,
      "",
      `Détail : ${args.siteUrl}/admin/commandes`,
    ].join("\n"),
  });
}

export function notifyContactMessage(args: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  siteUrl: string;
}): Promise<boolean> {
  return send({
    subject: `Message de contact : ${args.subject}`,
    replyTo: args.email,
    text: [
      `De       : ${args.name} <${args.email}>`,
      `Téléphone: ${args.phone ?? "non renseigné"}`,
      `Sujet    : ${args.subject}`,
      "",
      args.message,
      "",
      `Messages : ${args.siteUrl}/admin/messages`,
    ].join("\n"),
  });
}

export function notifyTrainingRegistration(args: {
  trainingTitle: string;
  fullName: string;
  phone: string;
  email?: string | null;
  siteUrl: string;
}): Promise<boolean> {
  return send({
    subject: `Inscription formation : ${args.trainingTitle}`,
    text: [
      `Nouvelle demande d'inscription à « ${args.trainingTitle} »`,
      "",
      `Nom      : ${args.fullName}`,
      `Téléphone: ${args.phone}`,
      `Email    : ${args.email ?? "non renseigné"}`,
      "",
      `Inscriptions : ${args.siteUrl}/admin/formations`,
    ].join("\n"),
  });
}
