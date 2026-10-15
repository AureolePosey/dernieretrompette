import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import {
  getPublishedNewsSlugs,
  getPublishedProductSlugs,
  getPublishedTrainingSlugs,
} from "@/server/queries";

/**
 * Plan du site.
 *
 * Seules les pages PUBLIQUES et indexables y figurent. En sont exclus :
 * le panier, le tunnel de commande, les confirmations et l'administration —
 * leur contenu est propre à un visiteur ou privé, et les soumettre à
 * l'indexation ferait perdre du budget d'exploration aux pages qui comptent.
 *
 * `changeFrequency` et `priority` sont des indications, pas des ordres : on
 * les renseigne de façon cohérente avec le rythme réel de mise à jour.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/produits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/formations`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/actualites`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  // En cas d'indisponibilité de la base, les requêtes retournent des tableaux
  // vides (voir server/queries.ts) : on sert alors un plan réduit aux pages
  // statiques plutôt qu'une erreur 500, qui pénaliserait l'exploration.
  const [products, news, trainings] = await Promise.all([
    getPublishedProductSlugs(),
    getPublishedNewsSlugs(),
    getPublishedTrainingSlugs(),
  ]);

  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${base}/produits/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...trainings.map((training) => ({
      url: `${base}/formations/${training.slug}`,
      lastModified: training.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...news.map((article) => ({
      url: `${base}/actualites/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
