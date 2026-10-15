import { AdminPageHeader } from "@/components/admin/ui";
import { TrainingForm } from "@/components/admin/training-form";
import { requireAuth } from "@/lib/auth";

export const metadata = { title: "Nouvelle formation" };
export const dynamic = "force-dynamic";

export default async function NewTrainingPage() {
  await requireAuth();

  return (
    <>
      <AdminPageHeader
        title="Nouvelle formation"
        description="Décrivez la formation, puis publiez-la quand les informations sont complètes."
      />
      <TrainingForm />
    </>
  );
}
