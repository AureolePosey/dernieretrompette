import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Boutons du design system.
 *
 * `buttonStyles` est exporté séparément du composant afin qu'un <Link> puisse
 * adopter exactement la même apparence sans qu'on ait à imbriquer un <button>
 * dans un <a> — ce qui produirait un HTML invalide et une navigation clavier
 * incohérente.
 */

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "onDark" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 " +
  "disabled:pointer-events-none disabled:opacity-50 active:translate-y-px " +
  "whitespace-nowrap select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-leaf-600 text-cream-50 shadow-soft hover:bg-leaf-700",
  secondary:
    "bg-cream-100 text-earth-900 border border-earth-200 hover:bg-cream-200 hover:border-earth-300",
  accent: "bg-gari-400 text-earth-900 shadow-soft hover:bg-gari-300",
  ghost: "text-leaf-700 hover:bg-leaf-50",
  // Sur photographie sombre : contour clair, remplissage au survol.
  onDark: "border border-cream-50/50 text-cream-50 backdrop-blur-sm hover:bg-cream-50 hover:text-earth-900",
  danger: "bg-clay-500 text-cream-50 hover:bg-clay-600",
};

const sizes: Record<ButtonSize, string> = {
  // 44px de haut minimum : cible tactile confortable sur mobile (WCAG 2.5.5).
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonStyles(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cn(
    base,
    variants[options?.variant ?? "primary"],
    sizes[options?.size ?? "md"],
    options?.className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
