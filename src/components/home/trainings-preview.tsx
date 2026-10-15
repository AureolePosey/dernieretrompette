import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { TrainingCard } from "@/components/shared/training-card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { getPublishedTrainings } from "@/server/queries";

export async function TrainingsPreview() {
  const trainings = await getPublishedTrainings(3);

  return (
    <Section tone="cream" spacing="normal">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Nos formations"
          title="Transmettre ce que nous savons faire"
          description="La coopérative ouvre son savoir-faire aux producteurs et transformateurs qui souhaitent se perfectionner."
        />

        <Link
          href="/formations"
          className={buttonStyles({
            variant: "secondary",
            className: "shrink-0 self-start md:self-auto",
          })}
        >
          Toutes les formations
          <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
        </Link>
      </div>

      {trainings.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <li key={training.id} className="flex">
              <TrainingCard training={training} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          Icon={GraduationCap}
          title="Aucune formation publiée pour le moment"
          description="Les formations créées depuis l'espace d'administration apparaîtront ici."
          className="mt-12"
        />
      )}
    </Section>
  );
}
