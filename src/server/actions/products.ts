"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { uniqueSlug } from "@/lib/utils";
import { categorySchema, productImageSchema, productSchema } from "@/lib/validations/catalog";
import { type ActionState, zodErrorToState } from "@/lib/validations/shared";

/**
 * Gestion du catalogue depuis l'administration.
 *
 * Chaque action commence par `requireAuth()`. Le proxy protège déjà les pages
 * /admin, mais une Server Action est un point d'entrée HTTP autonome : elle
 * peut être appelée directement, sans passer par le rendu d'une page. Ne
 * vérifier qu'au niveau du routage laisserait donc la porte ouverte.
 *
 * Après chaque écriture, `revalidatePath` purge le cache des pages publiques
 * concernées : une modification de prix est visible immédiatement, sans
 * attendre l'expiration de la revalidation horaire.
 */

/** Purge le cache de toutes les pages où un produit peut apparaître. */
function revalidateProduct(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/produits");
  if (slug) revalidatePath(`/produits/${slug}`);
  revalidatePath("/admin/produits");
}

// ---------------------------------------------------------------------------
// PRODUITS
// ---------------------------------------------------------------------------

export async function createProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  const data = parsed.data;
  let slug: string;

  try {
    slug = await uniqueSlug(data.name, async (candidate) =>
      Boolean(await prisma.product.findUnique({ where: { slug: candidate } })),
    );

    await prisma.product.create({
      data: {
        slug,
        name: data.name,
        shortDesc: data.shortDesc ?? null,
        description: data.description ?? null,
        extraInfo: data.extraInfo ?? null,
        categoryId: data.categoryId || null,
        price: data.price ?? null,
        unit: data.unit ?? null,
        weightGrams: data.weightGrams,
        inStock: data.inStock,
        featured: data.featured,
        published: data.published,
        position: data.position ?? 0,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
  } catch (cause) {
    console.error("[admin] création de produit impossible", cause);
    return { status: "error", message: "Le produit n'a pas pu être créé. Réessayez." };
  }

  revalidateProduct(slug);
  redirect("/admin/produits?cree=1");
}

export async function updateProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Produit introuvable." };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  const data = parsed.data;

  try {
    const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true, name: true } });
    if (!existing) return { status: "error", message: "Produit introuvable." };

    // Le slug ne suit le nom que si celui-ci change réellement : un slug stable
    // préserve les liens déjà partagés et le référencement acquis.
    const slug =
      existing.name === data.name
        ? existing.slug
        : await uniqueSlug(data.name, async (candidate) => {
            const found = await prisma.product.findUnique({ where: { slug: candidate } });
            return Boolean(found && found.id !== id);
          });

    await prisma.product.update({
      where: { id },
      data: {
        slug,
        name: data.name,
        shortDesc: data.shortDesc ?? null,
        description: data.description ?? null,
        extraInfo: data.extraInfo ?? null,
        categoryId: data.categoryId || null,
        price: data.price ?? null,
        unit: data.unit ?? null,
        weightGrams: data.weightGrams,
        inStock: data.inStock,
        featured: data.featured,
        published: data.published,
        position: data.position ?? 0,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });

    revalidateProduct(existing.slug);
    revalidateProduct(slug);
  } catch (cause) {
    console.error("[admin] mise à jour de produit impossible", cause);
    return { status: "error", message: "La modification n'a pas pu être enregistrée." };
  }

  return { status: "success", message: "Produit enregistré." };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    // Les lignes de commande conservent leurs instantanés (nom, prix) et voient
    // leur productId passer à null : l'historique des commandes reste lisible
    // après la suppression d'un produit.
    const product = await prisma.product.delete({ where: { id }, select: { slug: true } });
    revalidateProduct(product.slug);
  } catch (cause) {
    console.error("[admin] suppression de produit impossible", cause);
  }

  redirect("/admin/produits?supprime=1");
}

/** Bascule rapide depuis la liste, sans ouvrir le formulaire complet. */
export async function toggleProductFlag(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");

  if (!id || !["published", "inStock", "featured"].includes(field)) return;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { slug: true, published: true, inStock: true, featured: true },
    });
    if (!product) return;

    await prisma.product.update({
      where: { id },
      data: { [field]: !product[field as "published" | "inStock" | "featured"] },
    });

    revalidateProduct(product.slug);
  } catch (cause) {
    console.error("[admin] bascule impossible", cause);
  }
}

// ---------------------------------------------------------------------------
// IMAGES
// ---------------------------------------------------------------------------

export type UploadState = ActionState & { url?: string };

/**
 * Envoi d'une image.
 * La validation du contenu réel du fichier (magic bytes, taille, type) est
 * faite dans lib/storage : voir le commentaire qui y explique pourquoi le type
 * MIME annoncé par le navigateur ne peut pas être cru sur parole.
 */
export async function uploadProductImage(
  _previousState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Aucun fichier reçu." };
  }

  const result = await uploadImage(file);
  if (!result.ok) return { status: "error", message: result.error };

  return { status: "success", url: result.url };
}

export async function addProductImage(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = productImageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  try {
    const count = await prisma.productImage.count({
      where: { productId: parsed.data.productId },
    });

    const image = await prisma.productImage.create({
      data: { ...parsed.data, position: count },
      include: { product: { select: { slug: true } } },
    });

    revalidateProduct(image.product.slug);
  } catch (cause) {
    console.error("[admin] ajout d'image impossible", cause);
    return { status: "error", message: "L'image n'a pas pu être ajoutée." };
  }

  return { status: "success", message: "Image ajoutée." };
}

export async function deleteProductImage(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("imageId") ?? "");
  if (!id) return;

  try {
    const image = await prisma.productImage.delete({
      where: { id },
      include: { product: { select: { slug: true } } },
    });
    revalidateProduct(image.product.slug);
  } catch (cause) {
    console.error("[admin] suppression d'image impossible", cause);
  }
}

// ---------------------------------------------------------------------------
// VARIANTES (formats de vente)
// ---------------------------------------------------------------------------

export async function addProductVariant(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const productId = String(formData.get("productId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();

  if (!productId || label === "") {
    return { status: "error", message: "Le libellé du format est obligatoire." };
  }

  const price = rawPrice === "" ? null : Math.round(Number(rawPrice.replace(",", ".")));
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { status: "error", message: "Le prix du format est invalide." };
  }

  try {
    const count = await prisma.productVariant.count({ where: { productId } });

    const variant = await prisma.productVariant.create({
      data: { productId, label: label.slice(0, 80), price, position: count },
      include: { product: { select: { slug: true } } },
    });

    revalidateProduct(variant.product.slug);
  } catch (cause) {
    console.error("[admin] ajout de format impossible", cause);
    return { status: "error", message: "Le format n'a pas pu être ajouté." };
  }

  return { status: "success", message: "Format ajouté." };
}

export async function deleteProductVariant(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("variantId") ?? "");
  if (!id) return;

  try {
    const variant = await prisma.productVariant.delete({
      where: { id },
      include: { product: { select: { slug: true } } },
    });
    revalidateProduct(variant.product.slug);
  } catch (cause) {
    console.error("[admin] suppression de format impossible", cause);
  }
}

// ---------------------------------------------------------------------------
// CATÉGORIES
// ---------------------------------------------------------------------------

export async function saveCategory(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  const data = parsed.data;

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
          position: data.position ?? 0,
        },
      });
    } else {
      const slug = await uniqueSlug(data.name, async (candidate) =>
        Boolean(await prisma.category.findUnique({ where: { slug: candidate } })),
      );

      await prisma.category.create({
        data: {
          slug,
          name: data.name,
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
          position: data.position ?? 0,
        },
      });
    }
  } catch (cause) {
    console.error("[admin] enregistrement de catégorie impossible", cause);
    return { status: "error", message: "La catégorie n'a pas pu être enregistrée." };
  }

  revalidatePath("/produits");
  revalidatePath("/admin/categories");

  return { status: "success", message: "Catégorie enregistrée." };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    // `onDelete: SetNull` côté schéma : les produits de la catégorie ne sont
    // PAS supprimés, ils deviennent simplement non classés.
    await prisma.category.delete({ where: { id } });
  } catch (cause) {
    console.error("[admin] suppression de catégorie impossible", cause);
  }

  revalidatePath("/produits");
  revalidatePath("/admin/categories");
}
