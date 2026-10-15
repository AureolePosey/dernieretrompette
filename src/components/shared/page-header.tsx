import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Bandeau de titre des pages intérieures.
 *
 * Le fil d'Ariane est un vrai <nav aria-label="Fil d'Ariane"> contenant une
 * liste ordonnée : la position de la page dans l'arborescence est donc
 * restituée aux lecteurs d'écran, pas seulement suggérée visuellement.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: ReadonlyArray<{ name: string; href: string }>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-earth-200 bg-cream-100">
      <div className="texture-grain absolute inset-0 opacity-[0.06]" aria-hidden="true" />

      <div className="container-page relative py-12 md:py-16">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-earth-400">
              <li>
                <Link href="/" className="transition-colors hover:text-leaf-700">
                  Accueil
                </Link>
              </li>
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                  <li key={item.href} className="flex items-center gap-1">
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                    {isLast ? (
                      <span aria-current="page" className="text-earth-500">
                        {item.name}
                      </span>
                    ) : (
                      <Link href={item.href} className="transition-colors hover:text-leaf-700">
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-gari-600 uppercase">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="max-w-3xl font-display text-3xl leading-[1.15] text-earth-900 md:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>

        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-earth-500 md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
