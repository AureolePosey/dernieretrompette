import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Media } from "@/components/ui/media";
import { buttonStyles } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";

/**
 * Hero de la page d'accueil.
 *
 * Composition en deux colonnes plutôt qu'un texte centré sur photo plein
 * écran : le texte repose sur un aplat sombre maîtrisé, ce qui garantit un
 * contraste conforme quelle que soit la photographie que le client fournira.
 * Une image claire ne cassera donc pas la lisibilité du titre.
 *
 * POUR INSTALLER LA PHOTO : déposer le fichier dans public/images/ puis
 * renseigner `heroImage` ci-dessous.
 */

/**
 * Photo d'ouverture — le premier visuel que voit un visiteur.
 *
 * Choix actuel : la torréfaction du gari, geste le plus identifiable du métier
 * de la coopérative. Pour en changer, déposer la nouvelle photo dans
 * public/images et remplacer ce seul chemin.
 */
const heroImage: string | null = "/images/transformation-torrefaction.jpeg";

export async function Hero() {
  const settings = await getSettings();

  return (
    <section className="relative overflow-hidden bg-leaf-900">
      <div className="texture-grain absolute inset-0 opacity-[0.15]" aria-hidden="true" />

      <div className="container-page relative">
        <div className="grid items-center gap-10 pt-32 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-40 lg:pb-24">
          {/* --- Colonne texte --- */}
          <div className="animate-fade-up max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-pill border border-gari-300/30 bg-gari-300/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-gari-200 uppercase">
              <Leaf className="size-3.5" aria-hidden="true" strokeWidth={2} />
              Coopérative agricole et agroalimentaire
            </p>

            <h1 className="mt-6 font-display text-4xl leading-[1.08] text-cream-50 sm:text-5xl lg:text-[3.5rem]">
              {settings.heroTitle}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-200/85 sm:text-lg">
              {settings.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/produits"
                className={buttonStyles({ variant: "accent", size: "lg" })}
              >
                Découvrir nos produits
                <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
              </Link>

              <Link
                href="/a-propos"
                className={buttonStyles({ variant: "onDark", size: "lg" })}
              >
                Découvrir la coopérative
              </Link>
            </div>

            {/* Repères d'activité — formulés sans aucun chiffre non vérifié. */}
            <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-cream-200/15 pt-8 sm:grid-cols-4">
              {["Production", "Transformation", "Commercialisation", "Formation"].map((item) => (
                <li key={item} className="flex flex-col gap-1">
                  <span
                    aria-hidden="true"
                    className="h-px w-6 bg-gari-300/60"
                  />
                  <span className="text-[0.8125rem] font-medium text-cream-200/75">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Colonne visuelle --- */}
          <div className="relative lg:h-[34rem]">
            <Media
              src={heroImage}
              alt="Membre de la coopérative torréfiant le gari sur un foyer traditionnel"
              ratio="hero"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              placeholderLabel="Photographie de la coopérative à fournir"
              className="rounded-card shadow-lift"
            />

            {/* Cartouche flottant : ancre le visuel et rompt la rigidité du cadre. */}
            <div className="absolute -bottom-4 -left-4 hidden max-w-[15rem] rounded-card border border-earth-200 bg-cream-50 p-5 shadow-lift sm:block lg:-left-8">
              <p className="font-display text-sm leading-snug text-earth-900">
                Du champ à votre cuisine, chaque étape est réalisée par la coopérative.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
