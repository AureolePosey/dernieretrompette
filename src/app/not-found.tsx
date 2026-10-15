import Link from "next/link";
import { Home, Package, Search } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

/**
 * Page 404 globale.
 *
 * Ne se contente pas d'annoncer l'erreur : propose trois portes de sortie
 * utiles. Un visiteur arrivé ici par un lien périmé cherche presque toujours
 * un produit.
 */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream-50 px-5 py-16">
      <div className="mx-auto w-full max-w-lg text-center">
        <p
          aria-hidden="true"
          className="font-display text-7xl font-semibold text-gari-300 md:text-8xl"
        >
          404
        </p>

        <h1 className="mt-4 font-display text-2xl leading-tight text-earth-900 md:text-3xl">
          Cette page n&apos;existe pas
        </h1>

        <p className="mt-4 text-base leading-relaxed text-earth-500">
          Le lien est peut-être périmé, ou la page a été déplacée. Voici de quoi retrouver votre
          chemin.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonStyles({ size: "lg" })}>
            <Home className="size-4" aria-hidden="true" strokeWidth={2} />
            Retour à l&apos;accueil
          </Link>

          <Link href="/produits" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            <Package className="size-4" aria-hidden="true" strokeWidth={2} />
            Voir nos produits
          </Link>
        </div>

        <p className="mt-8 text-sm text-earth-400">
          <Search className="mr-1.5 inline size-4 align-text-bottom" aria-hidden="true" />
          Vous cherchez quelque chose de précis ?{" "}
          <Link
            href="/contact"
            className="font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
          >
            Écrivez-nous
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
