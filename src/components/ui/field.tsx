import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Champs de formulaire.
 *
 * Trois garanties d'accessibilité tenues ici une fois pour toutes, plutôt que
 * répétées (et oubliées) dans chaque formulaire :
 *   - chaque champ a un <label> réellement associé via `htmlFor` / `id` ;
 *   - une erreur est reliée au champ par `aria-describedby` et signalée par
 *     `aria-invalid`, donc annoncée par les lecteurs d'écran ;
 *   - l'erreur est aussi portée par le texte, jamais par la seule couleur.
 */

const controlBase =
  "w-full rounded-card border bg-cream-50 px-4 text-earth-900 " +
  "placeholder:text-earth-400 transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-earth-400";

const controlState = (hasError: boolean) =>
  hasError
    ? "border-clay-500 focus:border-clay-500"
    : "border-earth-200 hover:border-earth-300 focus:border-leaf-500";

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

/** Enveloppe libellé + aide + erreur autour d'un contrôle. */
export function Field({ id, label, children, error, hint, required, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-earth-700">
        {label}
        {required ? (
          <span className="ml-1 text-clay-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-earth-400">
          {hint}
        </p>
      ) : null}

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-clay-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Attributs ARIA à étaler sur le contrôle, cohérents avec <Field>.
 *
 * Les deux drapeaux doivent refléter EXACTEMENT ce que <Field> affiche : un
 * `aria-describedby` pointant vers un élément absent du DOM n'est annoncé par
 * aucun lecteur d'écran, et l'aide serait alors perdue.
 */
export function fieldAria(
  id: string,
  options: { error?: string; hasHint?: boolean } = {},
) {
  const describedBy = [
    options.hasHint ? `${id}-hint` : null,
    options.error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    "aria-invalid": options.error ? (true as const) : undefined,
    "aria-describedby": describedBy || undefined,
  };
}

export function Input({
  className,
  hasError,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      className={cn(controlBase, controlState(Boolean(hasError)), "h-12", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  hasError,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBase, controlState(Boolean(hasError)), "resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  hasError,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select
      className={cn(controlBase, controlState(Boolean(hasError)), "h-12 cursor-pointer pr-10", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  className,
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "mt-0.5 size-5 shrink-0 cursor-pointer rounded border-earth-300 text-leaf-600",
          "accent-leaf-600",
          className,
        )}
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-earth-700">
        {label}
      </label>
    </div>
  );
}

/**
 * Piège à robots. Un champ invisible pour l'humain mais rempli par la plupart
 * des scripts de spam : si sa valeur n'est pas vide, on rejette silencieusement.
 * `aria-hidden` + `tabIndex={-1}` le rendent inatteignable au clavier et aux
 * lecteurs d'écran, il ne gêne donc aucun utilisateur légitime.
 */
export function Honeypot({ name = "website" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor={`hp-${name}`}>Ne pas remplir</label>
      <input id={`hp-${name}`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
