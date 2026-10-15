import { commerce } from "@content/site";

/**
 * Formatage — utilisable côté serveur ET client (aucun import server-only).
 */

/**
 * Affiche un montant stocké en base (entier, plus petite unité de la devise).
 * Retourne `null` pour un prix absent, afin que l'appelant décide quoi montrer
 * (« Prix sur demande », un tiret, rien du tout) plutôt que de recevoir « 0 ».
 */
export function formatPrice(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) return null;

  // Les devises sans sous-unité (XOF, XAF, JPY) s'affichent sans décimales.
  const zeroDecimal = ["XOF", "XAF", "JPY", "KRW", "CLP"].includes(commerce.currency);
  const value = zeroDecimal ? amount : amount / 100;

  return new Intl.NumberFormat(commerce.locale, {
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(value);
}

/** Montant suivi de la devise : « 2 500 FCFA ». */
export function formatPriceWithCurrency(amount: number | null | undefined): string | null {
  const formatted = formatPrice(amount);
  return formatted === null ? null : `${formatted} ${commerce.currencyLabel}`;
}

/** Libellé d'un prix, avec repli explicite quand la tarification n'est pas fixée. */
export function priceLabel(amount: number | null | undefined): string {
  return formatPriceWithCurrency(amount) ?? "Prix sur demande";
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(commerce.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(commerce.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Format ISO court pour l'attribut `dateTime` des balises <time>. */
export function toISODate(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function formatWeight(grams: number | null | undefined): string | null {
  if (!grams) return null;
  return grams >= 1000
    ? `${(grams / 1000).toLocaleString(commerce.locale, { maximumFractionDigits: 2 })} kg`
    : `${grams} g`;
}

/** Tronque sans couper un mot en deux. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Découpe un texte brut en paragraphes.
 * Le contenu éditorial est saisi en texte simple dans l'administration : une
 * ligne vide sépare deux paragraphes. Pas de HTML, donc pas de risque XSS.
 */
export function toParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
