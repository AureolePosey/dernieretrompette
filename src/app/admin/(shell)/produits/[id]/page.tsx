import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { AddProductImageForm, AddProductVariantForm } from "@/components/admin/product-media";
import { DeleteButton } from "@/components/admin/delete-button";
import { Media } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import {
  deleteProduct,
  deleteProductImage,
  deleteProductVariant,
} from "@/server/actions/products";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { priceLabel } from "@/lib/format";

export const metadata = { title: "Modifier un produit" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  await requireAuth();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description="Modifiez la fiche, puis gérez les photos et les formats de vente."
        action={
          <Link
            href={`/produits/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden="true" strokeWidth={1.75} />
            Voir sur le site
          </Link>
        }
      />

      <ProductForm categories={categories} product={product} />

      {/* --- Photos ---------------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl text-earth-900">Photos</h2>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <Panel title={`Photos actuelles (${product.images.length})`}>
            {product.images.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {product.images.map((image, index) => (
                  <li
                    key={image.id}
                    className="overflow-hidden rounded-card border border-earth-200"
                  >
                    <Media
                      src={image.url}
                      alt={image.alt}
                      ratio="photo"
                      sizes="240px"
                    />
                    <div className="flex items-start justify-between gap-3 p-3">
                      <div className="min-w-0">
                        {index === 0 ? (
                          <Badge tone="accent" className="mb-1.5">
                            Photo principale
                          </Badge>
                        ) : null}
                        <p className="text-xs leading-relaxed text-earth-500">{image.alt}</p>
                      </div>

                      <DeleteButton
                        action={deleteProductImage}
                        fields={{ imageId: image.id }}
                        label="Supprimer cette photo"
                        confirmMessage="Supprimer définitivement cette photo ?"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-earth-400">
                Aucune photo. La fiche affiche un substitut graphique en attendant.
              </p>
            )}
          </Panel>

          <Panel title="Ajouter une photo">
            <AddProductImageForm productId={product.id} />
          </Panel>
        </div>
      </section>

      {/* --- Formats --------------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl text-earth-900">Formats de vente</h2>

        <Panel description="Sans format, le prix du produit s'applique tel quel.">
          {product.variants.length > 0 ? (
            <ul className="mb-6 flex flex-col gap-2">
              {product.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="flex items-center justify-between gap-4 rounded-card border border-earth-200 bg-cream-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-earth-900">{variant.label}</p>
                    <p className="text-xs text-earth-400">
                      {variant.price === null
                        ? `Prix du produit (${priceLabel(product.price)})`
                        : priceLabel(variant.price)}
                    </p>
                  </div>

                  <DeleteButton
                    action={deleteProductVariant}
                    fields={{ variantId: variant.id }}
                    label={`Supprimer le format ${variant.label}`}
                    confirmMessage={`Supprimer le format « ${variant.label} » ?`}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <AddProductVariantForm productId={product.id} />
        </Panel>
      </section>

      {/* --- Suppression ----------------------------------------------------- */}
      <section className="mt-10">
        <Panel className="border-clay-500/25 bg-clay-100/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base text-earth-900">Supprimer ce produit</h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-earth-500">
                Action définitive. Les commandes passées restent intactes : elles conservent le
                nom et le prix du produit tels qu&apos;ils étaient au moment de l&apos;achat.
              </p>
            </div>

            <form action={deleteProduct} className="shrink-0">
              <input type="hidden" name="id" value={product.id} />
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-pill bg-clay-500 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-clay-600"
              >
                <Trash2 className="size-4" aria-hidden="true" strokeWidth={2} />
                Supprimer définitivement
              </button>
            </form>
          </div>
        </Panel>
      </section>
    </>
  );
}
