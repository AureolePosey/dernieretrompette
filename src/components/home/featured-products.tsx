import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProductCard } from "@/components/product/product-card";
import { buttonStyles } from "@/components/ui/button";
import { getFeaturedProducts } from "@/server/queries";

/**
 * Produits mis en avant.
 *
 * Si le catalogue est encore vide, la section affiche un état explicite au lieu
 * de disparaître : pendant la recette, le client doit voir l'emplacement que
 * ses produits occuperont, et savoir où les saisir.
 */
export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  return (
    <Section tone="cream" spacing="normal">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Nos produits"
          title="Le meilleur de nos transformations"
          description="Gari, tapioca, fonio et dérivés du manioc, préparés et conditionnés par la coopérative."
        />

        <Link
          href="/produits"
          className={buttonStyles({ variant: "secondary", className: "shrink-0 self-start md:self-auto" })}
        >
          Voir tout le catalogue
          <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
        </Link>
      </div>

      {products.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} priority={index < 2} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 rounded-card border border-dashed border-earth-300 bg-cream-50 p-10 text-center">
          <PackageOpen
            className="mx-auto size-8 text-earth-300"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          <p className="mt-4 font-display text-lg text-earth-900">
            Le catalogue n&apos;est pas encore renseigné
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-earth-500">
            Les produits ajoutés depuis l&apos;espace d&apos;administration apparaîtront ici
            automatiquement.
          </p>
        </div>
      )}
    </Section>
  );
}
