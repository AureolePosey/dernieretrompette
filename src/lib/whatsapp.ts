import { isTodo } from "@content/site";

/**
 * Liens WhatsApp.
 *
 * Dans le contexte de la coopérative, WhatsApp est un canal de commande plus
 * crédible qu'un paiement par carte. Chaque lien part donc avec un message
 * pré-rempli nommant explicitement le produit concerné, pour que la
 * conversation démarre sans que le client ait à réexpliquer sa demande.
 *
 * Aucun numéro n'est codé en dur : si le client n'a pas encore fourni le sien,
 * `whatsappLink` retourne `null` et l'interface masque simplement le bouton.
 */

/** Ne garde que les chiffres : wa.me refuse « + », espaces et tirets. */
function normalizeNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function whatsappLink(number: string, message?: string): string | null {
  if (isTodo(number)) return null;

  const digits = normalizeNumber(number);
  // Un numéro international plausible fait au moins 8 chiffres avec l'indicatif.
  if (digits.length < 8) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productWhatsappMessage(productName: string, siteName: string): string {
  return `Bonjour ${siteName}, je souhaite commander : ${productName}. Pouvez-vous me communiquer les disponibilités et les modalités ?`;
}

export function trainingWhatsappMessage(trainingTitle: string, siteName: string): string {
  return `Bonjour ${siteName}, je souhaite m'inscrire à la formation : ${trainingTitle}. Merci de m'indiquer la marche à suivre.`;
}

export function orderWhatsappMessage(
  reference: string,
  siteName: string,
  lines: ReadonlyArray<{ name: string; quantity: number }>,
): string {
  const detail = lines.map((l) => `- ${l.name} x${l.quantity}`).join("\n");
  return `Bonjour ${siteName}, je viens de passer la commande ${reference} :\n${detail}`;
}

export function generalWhatsappMessage(siteName: string): string {
  return `Bonjour ${siteName}, j'aimerais avoir des informations sur vos produits.`;
}

/** Lien téléphonique, ou `null` si le numéro n'est pas encore renseigné. */
export function telLink(number: string): string | null {
  if (isTodo(number)) return null;
  const cleaned = number.replace(/[^\d+]/g, "");
  return cleaned.length >= 8 ? `tel:${cleaned}` : null;
}

/** Lien email, ou `null` si l'adresse n'est pas encore renseignée. */
export function mailtoLink(email: string): string | null {
  if (isTodo(email) || !email.includes("@")) return null;
  return `mailto:${email}`;
}
