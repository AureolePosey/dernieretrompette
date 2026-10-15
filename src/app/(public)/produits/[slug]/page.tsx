import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, Scale } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductCard } from "@/components/product/product-card";
import { Section, SectionHeading } from "@/components/ui/section";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { getProductBySlug, getPublishedProductSlugs, getRelatedProducts } from "@/server/queries";
import { getSettings } from "@/lib/settings";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatWeight, toParagraphs, truncate } from "@/lib/format";
import { site } from "@content/site";

type Params = Promise<{ slug: string }>;

/**
 * Pré-génère les fiches produits au build.
 * Une fiche déjà rendue est servie depuis le CDN : c'est la page la plus
 * consultée du site, elle doit s'afficher instantanément.
 */
export async function generateStaticParams() {
  const products = await getPublishedProductSlugs();
  return products.map((product) => ({ slug: product.slug }));
}

/** Revalidation horaire : un changement de prix se propage sans redéploiement. */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produit introuvable", robots: { index: false, follow: false } };
  }

  const description =
    product.metaDescription ??
    product.shortDesc ??
    (product.description ? truncate(product.description, 155) : site.metaDescription);

  return {
    title: product.metaTitle ?? product.name,
    description,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.metaTitle ?? `${product.name} | ${site.name}`,
      description,
      url: `/produits/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Un produit dépublié ou supprimé doit renvoyer un vrai 404, pas une page
  // vide : les moteurs de recherche doivent pouvoir le désindexer.
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 3),
    getSettings(),
  ]);

  const whatsappHref = whatsappLink(
    settings.whatsapp,
    productWhatsappMessage(product.name, site.name),
  );

  const weight = formatWeight(product.weightGrams);
  const descriptionParagraphs = toParagraphs(product.description);
  const extraParagraphs = toParagraphs(product.extraInfo);

  const breadcrumb = [
    { name: "Nos produits", href: "/produits" },
    ...(product.category
      ? [{ name: product.category.name, href: `/produits?categorie=${product.category.slug}` }]
      : []),
    { name: product.name, href: `/produits/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />

      <PageHeader
        eyebrow={product.category?.name}
        title={product.name}
        description={product.shortDesc ?? undefined}
        breadcrumb={breadcrumb}
      />

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            <ProductPurchase
              productId={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={product.price}
              unit={product.unit}
              inStock={product.inStock}
              imageUrl={product.images[0]?.url ?? null}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                label: variant.label,
                price: variant.price,
                inStock: variant.inStock,
              }))}
              whatsappHref={whatsappHref}
            />

            {weight ? (
              <dl className="mt-8 flex gap-2 border-t border-earth-200 pt-6 text-sm">
                <dt className="flex items-center gap-2 font-semibold text-earth-700">
                  <Scale className="size-4 text-earth-400" aria-hidden="true" strokeWidth={1.75} />
                  Poids net
                </dt>
                <dd className="text-earth-500">{weight}</dd>
              </dl>
            ) : null}
          </div>
        </div>

        {/* --- Description --- */}
        {descriptionParagraphs.length > 0 || extraParagraphs.length > 0 ? (
          <div className="mt-16 grid gap-10 border-t border-earth-200 pt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            {descriptionParagraphs.length > 0 ? (
              <div>
                <h2 className="font-display text-2xl text-earth-900">Description</h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-earth-500">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {extraParagraphs.length > 0 ? (
              <aside className="rounded-card border border-earth-200 bg-cream-100 p-6">
                <h2 className="flex items-center gap-2 font-display text-lg text-earth-900">
                  <Info className="size-4 text-gari-600" aria-hidden="true" strokeWidth={2} />
                  Bon à savoir
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-earth-600">
                  {extraParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* --- Produits similaires --- */}
      {related.length > 0 ? (
        <Section tone="cream" spacing="tight">
          <SectionHeading
            eyebrow="À découvrir aussi"
            title="Nos autres produits"
            as="h2"
          />

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id} className="flex">
                <ProductCard product={item} className="w-full" />
              </li>
            ))}
          </ul>

          <p className="mt-10">
            <Link
              href="/produits"
              className="text-sm font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
            >
              Voir tout le catalogue
            </Link>
          </p>
        </Section>
      ) : null}
    </>
  );
}
