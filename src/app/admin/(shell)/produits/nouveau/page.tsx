import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau produit" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAuth();

  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <>
      <AdminPageHeader
        title="Nouveau produit"
        description="Les photos et les formats de vente s'ajoutent après la création."
      />

      <ProductForm categories={categories} />
    </>
  );
}
