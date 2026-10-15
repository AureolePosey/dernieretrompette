import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badges d'état.
 *
 * La couleur ne porte jamais seule l'information : chaque badge contient
 * toujours un libellé texte. Un utilisateur daltonien ou un lecteur d'écran
 * obtient donc l'état exact sans dépendre de la teinte (WCAG 1.4.1).
 */

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-earth-100 text-earth-700 border-earth-200",
  success: "bg-leaf-50 text-leaf-700 border-leaf-200",
  warning: "bg-gari-50 text-gari-700 border-gari-200",
  danger: "bg-clay-100 text-clay-600 border-clay-500/25",
  info: "bg-cream-100 text-earth-700 border-earth-200",
  accent: "bg-gari-400 text-earth-900 border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1",
        "text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
