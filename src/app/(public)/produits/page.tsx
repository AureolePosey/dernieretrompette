import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { VideoPlayer } from "@/components/shared/video-player";
import { Section, SectionHeading } from "@/components/ui/section";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getCategories, getProducts } from "@/server/queries";

export const metadata: Metadata = {
  title: "Nos produits",
  description:
    "Découvrez le catalogue de La Dernière Trompette : gari, tapioca, fonio, farine et autres dérivés du manioc, transformés par la coopérative.",
  alternates: { canonical: "/produits" },
  openGraph: {
    title: "Nos produits | La Dernière Trompette",
    description:
      "Gari, tapioca, fonio et dérivés du manioc transformés par la coopérative.",
    url: "/produits",
  },
};

/**
 * Catalogue.
 *
 * Rendu dynamique : le contenu dépend des filtres passés en query string, une
 * mise en cache statique servirait donc le mauvais résultat. La liste reste
 * rapide car les requêtes sont indexées et ne remontent que les champs
 * nécessaires à une carte.
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ categorie?: string; q?: string; dispo?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts({
      category: params.categorie,
      search: params.q,
      inStockOnly: params.dispo === "1",
    }),
    getCategories(),
  ]);

  // Les catégories vides sont masquées : proposer un filtre qui ne renvoie
  // aucun résultat n'aide personne.
  const filterCategories = categories
    .filter((category) => category._count.products > 0)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category._count.products,
    }));

  const isFiltered = Boolean(params.categorie || params.q || params.dispo);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Nos produits", href: "/produits" }])} />

      <PageHeader
        eyebrow="Catalogue"
        title="Nos produits"
        description="Tous nos produits sont transformés et conditionnés par la coopérative. Ajoutez-les au panier ou commandez-les directement."
        breadcrumb={[{ name: "Nos produits", href: "/produits" }]}
      />

      <div className="container-page py-12 md:py-16">
        {/* Suspense requis : ProductFilters lit les paramètres d'URL côté client. */}
        <Suspense fallback={<div className="h-32" />}>
          <ProductFilters categories={filterCategories} />
        </Suspense>

        <p className="mt-8 text-sm text-earth-400" role="status" aria-live="polite">
          {products.length === 0
            ? "Aucun produit"
            : `${products.length} produit${products.length > 1 ? "s" : ""}`}
        </p>

        {products.length > 0 ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} priority={index < 4} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            Icon={PackageSearch}
            title={isFiltered ? "Aucun produit ne correspond" : "Le catalogue est en préparation"}
            description={
              isFiltered
                ? "Essayez un autre mot-clé, ou retirez les filtres actifs."
                : "Les produits ajoutés depuis l'espace d'administration apparaîtront ici."
            }
            className="mt-6"
          />
        )}
      </div>

      {/*
        Vidéos de présentation, placées APRÈS la grille : un visiteur vient
        d'abord chercher un produit précis. Comme ailleurs sur le site, elles ne
        se téléchargent qu'au clic.
      */}
      <Section tone="cream" spacing="tight">
        <SectionHeading
          eyebrow="En vidéo"
          title="Nos produits conditionnés"
          description="Quelques images de nos sachets prêts à partir, filmées à la coopérative."
          align="center"
        />

        <div className="mx-auto mt-10 grid max-w-2xl gap-8 sm:grid-cols-2">
          <VideoPlayer
            src="/images/video-produits.mp4"
            poster="/images/video-produits-apercu.jpg"
            alt="Sachets de gari et de tapioca de la coopérative, présentés sur une table"
            caption="Gari et tapioca, conditionnés et étiquetés."
          />
          <VideoPlayer
            src="/images/video-farine.mp4"
            poster="/images/video-farine-apercu.jpg"
            alt="Sacs de farine panifiable d'un kilogramme munis d'une poignée"
            caption="La farine panifiable, en sacs d'un kilo."
          />
        </div>
      </Section>
    </>
  );
}
