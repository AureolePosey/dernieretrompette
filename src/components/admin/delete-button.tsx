"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bouton de suppression avec confirmation.
 *
 * La confirmation passe par `window.confirm` : austère, mais elle a deux
 * qualités qu'une modale maison n'aurait pas gratuitement — elle est
 * accessible au clavier et aux lecteurs d'écran par construction, et elle ne
 * peut pas être court-circuitée par une erreur de rendu. Pour une action
 * irréversible déclenchée quelques fois par mois, c'est le bon compromis.
 *
 * Si le visiteur annule, `onSubmit` empêche l'envoi du formulaire.
 */
export function DeleteButton({
  action,
  fields,
  label,
  confirmMessage,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  label: string;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="shrink-0"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <SubmitButton label={label} className={className} />
    </form>
  );
}

function SubmitButton({ label, className }: { label: string; className?: string }) {
  // `useFormStatus` doit être appelé dans un composant ENFANT du <form> :
  // dans le composant qui contient le formulaire, il retournerait toujours
  // `pending: false`.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-full text-earth-400 transition-colors",
        "hover:bg-clay-100 hover:text-clay-600 disabled:opacity-50",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.75} />
      )}
    </button>
  );
}
