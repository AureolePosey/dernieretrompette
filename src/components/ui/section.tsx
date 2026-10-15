import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primitives de mise en page.
 *
 * Un seul endroit définit le rythme vertical et la largeur du contenu : c'est
 * ce qui garantit qu'une page ajoutée dans six mois respire exactement comme
 * les autres, sans qu'on ait à retrouver les bonnes valeurs à la main.
 */

type SectionProps = {
  children: ReactNode;
  className?: string;
  /** Fond de la section. `cream` alterne avec `default` pour rythmer la page. */
  tone?: "default" | "cream" | "leaf" | "earth";
  id?: string;
  /** Espacement vertical. `tight` pour une section de transition. */
  spacing?: "tight" | "normal" | "loose";
};

const tones = {
  default: "bg-cream-50 text-earth-900",
  cream: "bg-cream-100 text-earth-900",
  leaf: "bg-leaf-800 text-cream-100",
  earth: "bg-earth-900 text-cream-100",
} as const;

const spacings = {
  tight: "py-12 md:py-16",
  normal: "py-16 md:py-24",
  loose: "py-20 md:py-32",
} as const;

export function Section({
  children,
  className,
  tone = "default",
  spacing = "normal",
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn(tones[tone], spacings[spacing], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  /** Surtitre court qui situe la section. */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Inverse les couleurs pour les sections à fond sombre. */
  onDark?: boolean;
  /** Niveau de titre : à adapter pour ne jamais rompre la hiérarchie sémantique. */
  as?: "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onDark = false,
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold tracking-[0.18em] uppercase",
            onDark ? "text-gari-300" : "text-gari-600",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Tag
        className={cn(
          Tag === "h2" ? "text-3xl md:text-4xl lg:text-[2.75rem]" : "text-2xl md:text-3xl",
          "leading-[1.15]",
          onDark ? "text-cream-50" : "text-earth-900",
        )}
      >
        {title}
      </Tag>

      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            onDark ? "text-cream-200/85" : "text-earth-500",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Filet décoratif court, repris entre les sections pour l'unité visuelle. */
export function Rule({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-6 block h-px w-16",
        onDark ? "bg-gari-300/60" : "bg-gari-400",
      )}
    />
  );
}
