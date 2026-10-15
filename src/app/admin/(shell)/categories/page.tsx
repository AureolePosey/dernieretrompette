import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { deleteCategory } from "@/server/actions/products";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Catégories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAuth();

  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Catégories"
        description="Organisez le catalogue. Les catégories vides n'apparaissent pas dans les filtres publics."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Panel key={category.id}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base text-earth-900">{category.name}</h2>
                      <Badge tone={category._count.products > 0 ? "success" : "neutral"}>
                        {category._count.products} produit
                        {category._count.products > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-earth-400">/{category.slug}</p>
                  </div>

                  <DeleteButton
                    action={deleteCategory}
                    fields={{ id: category.id }}
                    label={`Supprimer la catégorie ${category.name}`}
                    confirmMessage={
                      category._count.products > 0
                        ? `Supprimer « ${category.name} » ? Ses ${category._count.products} produit(s) ne seront PAS supprimés, ils deviendront simplement non classés.`
                        : `Supprimer la catégorie « ${category.name} » ?`
                    }
                  />
                </div>

                <CategoryForm category={category} />
              </Panel>
            ))
          ) : (
            <Panel>
              <p className="py-6 text-center text-sm text-earth-400">
                Aucune catégorie. Créez-en une pour organiser le catalogue.
              </p>
            </Panel>
          )}
        </div>

        <Panel title="Nouvelle catégorie" className="lg:sticky lg:top-6">
          <CategoryForm />
        </Panel>
      </div>
    </>
  );
}
