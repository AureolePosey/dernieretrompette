import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Lectures publiques du catalogue et des publications.
 *
 * Deux principes appliqués partout ici :
 *
 * 1. FILTRAGE À LA SOURCE — `published: true` fait partie de la requête, jamais
 *    d'un filtre appliqué après coup dans le composant. Un brouillon ne doit
 *    pas transiter jusqu'au client, même s'il n'y est pas affiché.
 *
 * 2. DÉGRADATION CONTRÔLÉE — si PostgreSQL est injoignable, les pages
 *    publiques affichent un état vide plutôt qu'une erreur 500. L'incident est
 *    tracé dans les logs. Les écritures (commandes, administration) n'ont
 *    évidemment PAS ce comportement : une commande qui échoue doit échouer.
 */

async function safeRead<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (cause) {
    console.error(`[query:${label}] lecture impossible`, cause);
    return fallback;
  }
}

/** Champs nécessaires à une carte produit — rien de plus. */
const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDesc: true,
  price: true,
  unit: true,
  inStock: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" },
    take: 1,
  },
  category: { select: { slug: true, name: true } },
} as const;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  price: number | null;
  unit: string | null;
  inStock: boolean;
  images: { url: string; alt: string }[];
  category: { slug: string; name: string } | null;
};

// ---------------------------------------------------------------------------
// PRODUITS
// ---------------------------------------------------------------------------

export const getFeaturedProducts = cache(async (limit = 4): Promise<ProductCardData[]> =>
  safeRead(
    "featured-products",
    async () => {
      const featured = await prisma.product.findMany({
        where: { published: true, featured: true },
        select: productCardSelect,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        take: limit,
      });

      // Aucun produit n'a encore été marqué « en vedette » : on complète avec
      // les plus récents plutôt que de laisser la page d'accueil vide.
      if (featured.length >= limit) return featured;

      const filler = await prisma.product.findMany({
        where: {
          published: true,
          id: { notIn: featured.map((product) => product.id) },
        },
        select: productCardSelect,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        take: limit - featured.length,
      });

      return [...featured, ...filler];
    },
    [],
  ),
);

export type ProductFilters = {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
};

export async function getProducts(filters: ProductFilters = {}): Promise<ProductCardData[]> {
  const search = filters.search?.trim();

  return safeRead(
    "products",
    () =>
      prisma.product.findMany({
        where: {
          published: true,
          ...(filters.category ? { category: { slug: filters.category } } : {}),
          ...(filters.inStockOnly ? { inStock: true } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { shortDesc: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: productCardSelect,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export const getProductBySlug = cache(async (slug: string) =>
  safeRead(
    "product-detail",
    () =>
      prisma.product.findFirst({
        where: { slug, published: true },
        include: {
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { position: "asc" } },
          category: true,
        },
      }),
    null,
  ),
);

/** Produits proches : même catégorie d'abord, complétés si nécessaire. */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 3,
): Promise<ProductCardData[]> {
  return safeRead(
    "related-products",
    async () => {
      const sameCategory = categoryId
        ? await prisma.product.findMany({
            where: { published: true, categoryId, id: { not: productId } },
            select: productCardSelect,
            orderBy: { position: "asc" },
            take: limit,
          })
        : [];

      if (sameCategory.length >= limit) return sameCategory;

      const others = await prisma.product.findMany({
        where: {
          published: true,
          id: { notIn: [productId, ...sameCategory.map((product) => product.id)] },
        },
        select: productCardSelect,
        orderBy: { position: "asc" },
        take: limit - sameCategory.length,
      });

      return [...sameCategory, ...others];
    },
    [],
  );
}

export const getCategories = cache(async () =>
  safeRead(
    "categories",
    () =>
      prisma.category.findMany({
        orderBy: [{ position: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: { where: { published: true } } } } },
      }),
    [],
  ),
);

/** Slugs des produits publiés, pour la pré-génération statique et le sitemap. */
export async function getPublishedProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return safeRead(
    "product-slugs",
    () =>
      prisma.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    [],
  );
}

// ---------------------------------------------------------------------------
// ACTUALITÉS
// ---------------------------------------------------------------------------

export async function getPublishedNews(limit?: number) {
  return safeRead(
    "news",
    () =>
      prisma.news.findMany({
        where: { published: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        ...(limit ? { take: limit } : {}),
      }),
    [],
  );
}

export const getNewsBySlug = cache(async (slug: string) =>
  safeRead(
    "news-detail",
    () => prisma.news.findFirst({ where: { slug, published: true } }),
    null,
  ),
);

export async function getPublishedNewsSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return safeRead(
    "news-slugs",
    () => prisma.news.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    [],
  );
}

// ---------------------------------------------------------------------------
// FORMATIONS
// ---------------------------------------------------------------------------

export async function getPublishedTrainings(limit?: number) {
  return safeRead(
    "trainings",
    () =>
      prisma.training.findMany({
        where: { published: true },
        orderBy: [{ position: "asc" }, { startDate: "asc" }, { createdAt: "desc" }],
        ...(limit ? { take: limit } : {}),
      }),
    [],
  );
}

export const getTrainingBySlug = cache(async (slug: string) =>
  safeRead(
    "training-detail",
    () => prisma.training.findFirst({ where: { slug, published: true } }),
    null,
  ),
);

export async function getPublishedTrainingSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return safeRead(
    "training-slugs",
    () =>
      prisma.training.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    [],
  );
}
