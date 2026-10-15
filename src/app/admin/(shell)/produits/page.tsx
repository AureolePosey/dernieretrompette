import Link from "next/link";
import { ExternalLink, Package, Pencil, Plus } from "lucide-react";
import {
  AdminPageHeader,
  DataTable,
  FeedbackBanner,
  TableCell,
  TableRow,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/components/ui/media";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleProductFlag } from "@/server/actions/products";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { priceLabel } from "@/lib/format";

export const metadata = { title: "Produits" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ cree?: string; supprime?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  const params = await searchParams;

  const products = await prisma.product.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true } },
      images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
      _count: { select: { variants: true, images: true } },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Produits"
        description="Ajoutez, modifiez et publiez les produits du catalogue."
        action={
          <Link href="/admin/produits/nouveau" className={buttonStyles({ size: "md" })}>
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Nouveau produit
          </Link>
        }
      />

      {params.cree ? <FeedbackBanner status="success" message="Produit créé." /> : null}
      {params.supprime ? <FeedbackBanner status="success" message="Produit supprimé." /> : null}

      {products.length > 0 ? (
        <DataTable headers={["Produit", "Catégorie", "Prix", "État", "Médias", "Actions"]}>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-12 shrink-0">
                    <Media
                      src={product.images[0]?.url}
                      alt=""
                      ratio="square"
                      sizes="48px"
                      className="rounded-[0.5rem]"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-earth-900">{product.name}</p>
                    <p className="truncate text-xs text-earth-400">/{product.slug}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-earth-500">
                {product.category?.name ?? <span className="text-earth-400">Non classé</span>}
              </TableCell>

              <TableCell className="whitespace-nowrap">{priceLabel(product.price)}</TableCell>

              <TableCell>
                {/*
                  Bascules directes depuis la liste : publier ou signaler une
                  rupture sont les gestes les plus fréquents, ils ne doivent pas
                  imposer d'ouvrir le formulaire complet.
                */}
                <div className="flex flex-wrap gap-1.5">
                  <ToggleButton
                    id={product.id}
                    field="published"
                    active={product.published}
                    activeLabel="Publié"
                    inactiveLabel="Brouillon"
                  />
                  <ToggleButton
                    id={product.id}
                    field="inStock"
                    active={product.inStock}
                    activeLabel="En stock"
                    inactiveLabel="Rupture"
                  />
                  <ToggleButton
                    id={product.id}
                    field="featured"
                    active={product.featured}
                    activeLabel="En vedette"
                    inactiveLabel="Standard"
                  />
                </div>
              </TableCell>

              <TableCell className="text-xs whitespace-nowrap text-earth-500">
                {product._count.images} photo{product._count.images > 1 ? "s" : ""}
                <br />
                {product._count.variants} format{product._count.variants > 1 ? "s" : ""}
              </TableCell>

              <TableCell align="right">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    aria-label={`Modifier ${product.name}`}
                    className="grid size-9 place-items-center rounded-full text-earth-500 transition-colors hover:bg-cream-200 hover:text-earth-900"
                  >
                    <Pencil className="size-4" aria-hidden="true" strokeWidth={1.75} />
                  </Link>

                  <Link
                    href={`/produits/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir ${product.name} sur le site`}
                    className="grid size-9 place-items-center rounded-full text-earth-500 transition-colors hover:bg-cream-200 hover:text-earth-900"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" strokeWidth={1.75} />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          Icon={Package}
          title="Aucun produit"
          description="Créez votre premier produit : il apparaîtra aussitôt dans le catalogue public."
          action={
            <Link href="/admin/produits/nouveau" className={buttonStyles({ size: "lg" })}>
              <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
              Créer un produit
            </Link>
          }
        />
      )}
    </>
  );
}

/** Bascule d'un drapeau booléen, sans JavaScript côté client. */
function ToggleButton({
  id,
  field,
  active,
  activeLabel,
  inactiveLabel,
}: {
  id: string;
  field: "published" | "inStock" | "featured";
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <form action={toggleProductFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        title={`Basculer : ${active ? activeLabel : inactiveLabel}`}
        className="cursor-pointer"
      >
        <Badge tone={active ? "success" : "neutral"}>{active ? activeLabel : inactiveLabel}</Badge>
      </button>
    </form>
  );
}
