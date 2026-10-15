import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Affichage d'une image de contenu.
 *
 * RÈGLE DU PROJET : on n'invente jamais une photographie de la coopérative.
 * Tant qu'aucune image réelle n'a été fournie, on affiche un substitut
 * graphique assumé — dégradé végétal, trame de tamis — qui s'intègre à la
 * charte sans faire passer une illustration pour une photo authentique.
 *
 * Dès qu'une URL est renseignée (upload depuis l'administration ou fichier
 * déposé dans public/images), la vraie photo prend automatiquement sa place :
 * aucun code à modifier.
 */

type MediaProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Rapport largeur/hauteur du cadre. */
  ratio?: "square" | "photo" | "wide" | "portrait" | "hero";
  /** `true` pour l'image la plus visible au chargement (LCP) : désactive le lazy loading. */
  priority?: boolean;
  /** Indication de largeur pour que le navigateur choisisse la bonne résolution. */
  sizes?: string;
  /** Libellé du substitut, affiché uniquement en l'absence de photo. */
  placeholderLabel?: string;
  /** Assombrit l'image pour garantir la lisibilité d'un texte superposé. */
  overlay?: boolean;
};

const ratios = {
  square: "aspect-square",
  photo: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
  hero: "aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full",
} as const;

export function Media({
  src,
  alt,
  className,
  ratio = "photo",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px",
  placeholderLabel,
  overlay = false,
}: MediaProps) {
  const hasImage = Boolean(src && src.trim() !== "");

  return (
    <div className={cn("relative overflow-hidden bg-leaf-800", ratios[ratio], className)}>
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <PhotoPlaceholder label={placeholderLabel} />
      )}

      {overlay ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/25 to-transparent"
        />
      ) : null}
    </div>
  );
}

/**
 * Substitut visuel. `aria-hidden` : il n'apporte aucune information, le texte
 * alternatif de la photo manquante n'aurait aucun sens à être annoncé.
 */
function PhotoPlaceholder({ label }: { label?: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid place-items-center bg-gradient-to-br from-leaf-700 via-leaf-800 to-earth-900"
    >
      <div className="texture-grain absolute inset-0 opacity-40" />

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <ImageIcon className="size-7 text-cream-100/35" strokeWidth={1.25} />
        {label ? (
          <span className="max-w-[16rem] text-[0.6875rem] leading-relaxed font-medium tracking-[0.12em] text-cream-100/40 uppercase">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
