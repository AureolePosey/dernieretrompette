"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

/**
 * Page d'erreur applicative.
 *
 * On n'affiche JAMAIS le message technique au visiteur : il ne lui apprend
 * rien et peut divulguer des détails d'implémentation. Le détail complet part
 * dans la console serveur, et l'identifiant (`digest`) permet de retrouver
 * l'incident exact dans les logs si le visiteur le signale.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] erreur non interceptée", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center bg-cream-50 px-5 py-16">
      <div className="mx-auto w-full max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-clay-100 text-clay-600">
          <TriangleAlert className="size-7" aria-hidden="true" strokeWidth={1.75} />
        </span>

        <h1 className="mt-6 font-display text-2xl leading-tight text-earth-900 md:text-3xl">
          Une erreur est survenue
        </h1>

        <p className="mt-4 text-base leading-relaxed text-earth-500">
          Le problème vient de notre côté, pas du vôtre. Réessayez dans un instant : si cela
          persiste, contactez-nous directement.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={buttonStyles({ size: "lg" })}>
            <RotateCcw className="size-4" aria-hidden="true" strokeWidth={2} />
            Réessayer
          </button>

          <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            <Home className="size-4" aria-hidden="true" strokeWidth={2} />
            Retour à l&apos;accueil
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 text-xs text-earth-400">
            Référence de l&apos;incident : <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </div>
    </div>
  );
}
