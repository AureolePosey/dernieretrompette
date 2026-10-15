import { env } from "@/lib/env";
import type { SiteSettings } from "@/lib/settings";
import { commerce, isTodo, site } from "@content/site";

/**
 * Données structurées (schema.org, format JSON-LD).
 *
 * Elles permettent à Google d'afficher des résultats enrichis : fiche
 * d'organisation, prix et disponibilité d'un produit, date d'un article.
 *
 * RÈGLE : une propriété dont la valeur n'est pas encore fournie par le client
 * est OMISE, jamais remplie avec un placeholder. Publier « [À RENSEIGNER] »
 * comme numéro de téléphone dans des données structurées reviendrait à
 * diffuser une information fausse aux moteurs de recherche.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Retire récursivement les clés vides pour n'émettre que du vérifié. */
function prune(input: Record<string, JsonValue | undefined>): Record<string, JsonValue> {
  const output: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && (value.trim() === "" || isTodo(value))) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    output[key] = value;
  }

  return output;
}

export function organizationJsonLd(settings: SiteSettings): Record<string, JsonValue> {
  const sameAs = Object.values(settings.social).filter((url) => url && !isTodo(url));

  const address = prune({
    "@type": "PostalAddress",
    streetAddress: settings.address,
    addressLocality: settings.city,
    addressCountry: settings.country,
  });

  return prune({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: isTodo(settings.legalName) ? undefined : settings.legalName,
    description: settings.metaDescription,
    url: env.SITE_URL,
    telephone: isTodo(settings.phone) ? undefined : settings.phone,
    email: isTodo(settings.email) ? undefined : settings.email,
    // Une adresse réduite au seul "@type" n'apporte rien : on l'omet.
    address: Object.keys(address).length > 1 ? address : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    foundingDate: isTodo(settings.foundedYear) ? undefined : settings.foundedYear,
  });
}

export function websiteJsonLd(): Record<string, JsonValue> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: env.SITE_URL,
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.SITE_URL}/produits?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  price: number | null;
  inStock: boolean;
  images: { url: string }[];
}): Record<string, JsonValue> {
  const zeroDecimal = ["XOF", "XAF", "JPY"].includes(commerce.currency);

  return prune({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDesc ?? undefined,
    image: product.images.map((image) =>
      image.url.startsWith("http") ? image.url : `${env.SITE_URL}${image.url}`,
    ),
    brand: { "@type": "Brand", name: site.name },
    // Pas d'offre publiée tant qu'aucun prix n'est fixé : une offre sans prix
    // est rejetée par Google et nuirait au référencement de la fiche.
    offers:
      product.price !== null
        ? {
            "@type": "Offer",
            price: zeroDecimal ? product.price : product.price / 100,
            priceCurrency: commerce.currency,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `${env.SITE_URL}/produits/${product.slug}`,
            seller: { "@type": "Organization", name: site.name },
          }
        : undefined,
  });
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  author: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}): Record<string, JsonValue> {
  return prune({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.coverUrl
      ? [article.coverUrl.startsWith("http") ? article.coverUrl : `${env.SITE_URL}${article.coverUrl}`]
      : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.author ?? site.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${env.SITE_URL}/actualites/${article.slug}`,
  });
}

export function courseJsonLd(training: {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
}): Record<string, JsonValue> {
  return prune({
    "@context": "https://schema.org",
    "@type": "Course",
    name: training.title,
    description: training.summary ?? training.description ?? undefined,
    url: `${env.SITE_URL}/formations/${training.slug}`,
    provider: { "@type": "Organization", name: site.name, url: env.SITE_URL },
  });
}

export function breadcrumbJsonLd(
  trail: ReadonlyArray<{ name: string; href: string }>,
): Record<string, JsonValue> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${env.SITE_URL}${item.href}`,
    })),
  };
}

/**
 * Injecte un bloc JSON-LD.
 *
 * `JSON.stringify` d'un objet que NOUS construisons, jamais de contenu brut :
 * les seules chaînes qui y entrent proviennent de la base et sont échappées
 * par la sérialisation. On neutralise en plus la séquence « </ », seule façon
 * de sortir d'une balise <script> depuis une chaîne JSON.
 */
export function JsonLd({ data }: { data: Record<string, JsonValue> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
