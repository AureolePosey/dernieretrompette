import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader, DataTable, Panel, TableCell, TableRow } from "@/components/admin/ui";
import { TrainingForm } from "@/components/admin/training-form";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { deleteTraining, updateRegistrationStatus } from "@/server/actions/content";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { telLink } from "@/lib/whatsapp";
import type { RegistrationStatus } from "@/generated/prisma";

export const metadata = { title: "Modifier une formation" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const REGISTRATION_LABELS: Record<RegistrationStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

const REGISTRATION_TONES: Record<RegistrationStatus, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "danger",
};

export default async function EditTrainingPage({ params }: { params: Params }) {
  await requireAuth();
  const { id } = await params;

  const training = await prisma.training.findUnique({
    where: { id },
    include: { registrations: { orderBy: { createdAt: "desc" } } },
  });

  if (!training) notFound();

  return (
    <>
      <Link
        href="/admin/formations"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-earth-500 transition-colors hover:text-leaf-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={2} />
        Toutes les formations
      </Link>

      <AdminPageHeader
        title={training.title}
        action={
          training.published ? (
            <Link
              href={`/formations/${training.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 hover:underline"
            >
              <ExternalLink className="size-4" aria-hidden="true" strokeWidth={1.75} />
              Voir sur le site
            </Link>
          ) : undefined
        }
      />

      <TrainingForm training={training} />

      {/* --- Inscriptions ---------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl text-earth-900">
          Demandes d&apos;inscription ({training.registrations.length})
        </h2>

        {training.registrations.length > 0 ? (
          <DataTable headers={["Nom", "Téléphone", "Email", "Message", "Reçue le", "Statut"]}>
            {training.registrations.map((registration) => {
              const tel = telLink(registration.phone);

              return (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium text-earth-900">
                    {registration.fullName}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {tel ? (
                      <a href={tel} className="text-leaf-700 hover:underline">
                        {registration.phone}
                      </a>
                    ) : (
                      registration.phone
                    )}
                  </TableCell>

                  <TableCell className="text-earth-500">
                    {registration.email ? (
                      <a
                        href={`mailto:${registration.email}`}
                        className="text-leaf-700 hover:underline"
                      >
                        {registration.email}
                      </a>
                    ) : (
                      <span className="text-earth-400">—</span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-xs">
                    {registration.message ? (
                      <span className="line-clamp-2 text-earth-600">{registration.message}</span>
                    ) : (
                      <span className="text-earth-400">—</span>
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-earth-500">
                    {formatDateTime(registration.createdAt)}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge tone={REGISTRATION_TONES[registration.status]}>
                        {REGISTRATION_LABELS[registration.status]}
                      </Badge>

                      {/* Boutons directs : plus rapides qu'un menu déroulant pour deux transitions. */}
                      <div className="flex gap-1">
                        {(["CONFIRMED", "CANCELLED", "PENDING"] as RegistrationStatus[])
                          .filter((status) => status !== registration.status)
                          .map((status) => (
                            <form key={status} action={updateRegistrationStatus}>
                              <input
                                type="hidden"
                                name="registrationId"
                                value={registration.id}
                              />
                              <input type="hidden" name="status" value={status} />
                              <button
                                type="submit"
                                className="rounded-pill border border-earth-200 px-2 py-0.5 text-[0.6875rem] text-earth-500 transition-colors hover:border-earth-300 hover:text-earth-900"
                              >
                                {REGISTRATION_LABELS[status]}
                              </button>
                            </form>
                          ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </DataTable>
        ) : (
          <Panel>
            <p className="py-6 text-center text-sm text-earth-400">
              Aucune demande d&apos;inscription pour le moment.
            </p>
          </Panel>
        )}
      </section>

      {/* --- Suppression ----------------------------------------------------- */}
      <section className="mt-10">
        <Panel className="border-clay-500/25 bg-clay-100/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base text-earth-900">Supprimer cette formation</h2>
              <p className="mt-1 text-sm text-earth-500">
                Les demandes d&apos;inscription associées seront également supprimées.
              </p>
            </div>

            <form action={deleteTraining} className="shrink-0">
              <input type="hidden" name="id" value={training.id} />
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-pill bg-clay-500 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-clay-600"
              >
                <Trash2 className="size-4" aria-hidden="true" strokeWidth={2} />
                Supprimer
              </button>
            </form>
          </div>
        </Panel>
      </section>
    </>
  );
}
