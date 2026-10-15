import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en résolvant les conflits.
 * Permet à un composant d'exposer une prop `className` qui surcharge réellement
 * ses styles par défaut (`px-4` passé à un bouton `px-6` gagne).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Transforme un texte en slug URL : « Gari blanc 1 kg » -> « gari-blanc-1-kg ». */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les diacritiques isolés par NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Rend un slug unique en lui ajoutant un suffixe numérique.
 * `exists` interroge la base : la fonction reste agnostique du modèle.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "element";
  let candidate = root;
  let suffix = 1;

  // Borne de sécurité : évite une boucle infinie si `exists` est défaillant.
  while (suffix < 100 && (await exists(candidate))) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }

  return candidate;
}

/** Référence de commande lisible, croissante dans l'année : « LDT-2026-0042 ». */
export function buildOrderReference(yearlyCount: number, date = new Date()): string {
  return `LDT-${date.getFullYear()}-${String(yearlyCount + 1).padStart(4, "0")}`;
}

export function absoluteUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}
