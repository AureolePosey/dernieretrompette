import type { ReactNode } from "react";

/**
 * Mise en page des documents légaux.
 *
 * Colonne étroite et interligne généreux : ces textes sont longs et rarement
 * lus avec plaisir, autant les rendre aussi lisibles que possible.
 */
export function LegalContent({ children }: { children: ReactNode }) {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-earth-900 md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-earth-600">
        {children}
      </div>
    </section>
  );
}

/**
 * Marque une information que le client doit encore fournir.
 * Visuellement distincte pour qu'aucune mention légale incomplète ne passe
 * inaperçue au moment de la mise en ligne.
 */
export function LegalTodo({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-gari-100 px-1.5 py-0.5 font-medium text-gari-700">
      [À RENSEIGNER] {children}
    </span>
  );
}
