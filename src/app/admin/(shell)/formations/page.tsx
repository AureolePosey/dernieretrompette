import Link from "next/link";
import { ExternalLink, GraduationCap, Pencil, Plus } from "lucide-react";
import {
  AdminPageHeader,
  DataTable,
  FeedbackBanner,
  TableCell,
  TableRow,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleTrainingPublished } from "@/server/actions/content";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, priceLabel } from "@/lib/format";

export const metadata = { title: "Formations" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ cree?: string; supprime?: string }>;

export default async function AdminTrainingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  const params = await searchParams;

  const trainings = await prisma.training.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Formations"
        description="Gérez le catalogue de formations et suivez les demandes d'inscription."
        action={
          <Link href="/admin/formations/nouveau" className={buttonStyles({ size: "md" })}>
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Nouvelle formation
          </Link>
        }
      />

      {params.cree ? <FeedbackBanner status="success" message="Formation créée." /> : null}
      {params.supprime ? <FeedbackBanner status="success" message="Formation supprimée." /> : null}

      {trainings.length > 0 ? (
        <DataTable headers={["Formation", "Date", "Prix", "Inscriptions", "État", "Actions"]}>
          {trainings.map((training) => (
            <TableRow key={training.id}>
              <TableCell>
                <p className="font-medium text-earth-900">{training.title}</p>
                <p className="truncate text-xs text-earth-400">/{training.slug}</p>
              </TableCell>

              <TableCell className="whitespace-nowrap text-earth-500">
                {training.startDate ? formatDate(training.startDate) : "—"}
              </TableCell>

              <TableCell className="whitespace-nowrap">{priceLabel(training.price)}</TableCell>

              <TableCell align="center" className="tabular-nums">
                {training._count.registrations}
              </TableCell>

              <TableCell>
                <form action={toggleTrainingPublished}>
                  <input type="hidden" name="id" value={training.id} />
                  <button type="submit" title="Basculer la publication" className="cursor-pointer">
                    <Badge tone={training.published ? "success" : "neutral"}>
                      {training.published ? "Publiée" : "Brouillon"}
                    </Badge>
                  </button>
                </form>
              </TableCell>

              <TableCell align="right">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/formations/${training.id}`}
                    aria-label={`Modifier ${training.title}`}
                    className="grid size-9 place-items-center rounded-full text-earth-500 transition-colors hover:bg-cream-200 hover:text-earth-900"
                  >
                    <Pencil className="size-4" aria-hidden="true" strokeWidth={1.75} />
                  </Link>

                  {training.published ? (
                    <Link
                      href={`/formations/${training.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Voir ${training.title} sur le site`}
                      className="grid size-9 place-items-center rounded-full text-earth-500 transition-colors hover:bg-cream-200 hover:text-earth-900"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" strokeWidth={1.75} />
                    </Link>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          Icon={GraduationCap}
          title="Aucune formation"
          description="Créez votre première formation : elle apparaîtra dans la rubrique Formations."
          action={
            <Link href="/admin/formations/nouveau" className={buttonStyles({ size: "lg" })}>
              <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
              Créer une formation
            </Link>
          }
        />
      )}
    </>
  );
}
