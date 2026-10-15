import { AdminPageHeader } from "@/components/admin/ui";
import { NewsForm } from "@/components/admin/news-form";
import { requireAuth } from "@/lib/auth";

export const metadata = { title: "Nouvelle actualité" };
export const dynamic = "force-dynamic";

export default async function NewNewsPage() {
  await requireAuth();

  return (
    <>
      <AdminPageHeader
        title="Nouvelle actualité"
        description="Rédigez votre annonce, puis publiez-la quand elle est prête."
      />
      <NewsForm />
    </>
  );
}
