import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingCard } from "@/components/shared/training-card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getPublishedTrainings } from "@/server/queries";

export const metadata: Metadata = {
  title: "Formations",
  description:
    "Les formations proposées par La Dernière Trompette : transformation du manioc, techniques de production et savoir-faire de la coopérative.",
  alternates: { canonical: "/formations" },
  openGraph: {
    title: "Formations | La Dernière Trompette",
    description: "Découvrez les formations dispensées par la coopérative.",
    url: "/formations",
  },
};

export const revalidate = 3600;

export default async function TrainingsPage() {
  const trainings = await getPublishedTrainings();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Formations", href: "/formations" }])} />

      <PageHeader
        eyebrow="Se former"
        title="Nos formations"
        description="La coopérative transmet son savoir-faire aux productrices et producteurs qui souhaitent se perfectionner dans la transformation des produits agricoles."
        breadcrumb={[{ name: "Formations", href: "/formations" }]}
      />

      <div className="container-page py-12 md:py-16">
        {trainings.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainings.map((training) => (
              <li key={training.id} className="flex">
                <TrainingCard training={training} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            Icon={GraduationCap}
            title="Aucune formation n'est publiée pour le moment"
            description="Contactez-nous pour être informé de l'ouverture des prochaines sessions."
            action={
              <Link href="/contact" className={buttonStyles({ size: "lg" })}>
                Nous contacter
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}
