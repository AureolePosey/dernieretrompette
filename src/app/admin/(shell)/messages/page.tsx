import { Mail, MailOpen } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteMessage, markMessageRead } from "@/server/actions/content";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { telLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

/**
 * Messages reçus via le formulaire de contact.
 *
 * Présentés en cartes plutôt qu'en tableau : un message se lit, il ne se
 * compare pas colonne par colonne. Les non-lus sont visuellement distingués
 * par une bordure ET un badge — jamais par la seule couleur.
 */
export default async function AdminMessagesPage() {
  await requireAuth();

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  const unread = messages.filter((message) => !message.read).length;

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description={
          unread > 0
            ? `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}.`
            : "Tous les messages ont été lus."
        }
      />

      {messages.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => {
            const tel = message.phone ? telLink(message.phone) : null;

            return (
              <li key={message.id}>
                <article
                  className={cn(
                    "rounded-card border bg-cream-50 p-5",
                    message.read ? "border-earth-200" : "border-gari-300 bg-gari-50/40",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base text-earth-900">
                          {message.subject}
                        </h2>
                        {!message.read ? <Badge tone="accent">Non lu</Badge> : null}
                      </div>

                      <p className="mt-1 text-sm text-earth-500">
                        <span className="font-medium text-earth-700">{message.name}</span>
                        {" — "}
                        <a
                          href={`mailto:${message.email}`}
                          className="text-leaf-700 underline underline-offset-2"
                        >
                          {message.email}
                        </a>
                        {message.phone ? (
                          <>
                            {" — "}
                            {tel ? (
                              <a
                                href={tel}
                                className="text-leaf-700 underline underline-offset-2"
                              >
                                {message.phone}
                              </a>
                            ) : (
                              message.phone
                            )}
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <time
                        dateTime={message.createdAt.toISOString()}
                        className="mr-2 text-xs whitespace-nowrap text-earth-400"
                      >
                        {formatDateTime(message.createdAt)}
                      </time>

                      <form action={markMessageRead}>
                        <input type="hidden" name="id" value={message.id} />
                        <button
                          type="submit"
                          aria-label={
                            message.read ? "Marquer comme non lu" : "Marquer comme lu"
                          }
                          title={message.read ? "Marquer comme non lu" : "Marquer comme lu"}
                          className="grid size-9 place-items-center rounded-full text-earth-400 transition-colors hover:bg-cream-200 hover:text-earth-900"
                        >
                          {message.read ? (
                            <Mail className="size-4" aria-hidden="true" strokeWidth={1.75} />
                          ) : (
                            <MailOpen className="size-4" aria-hidden="true" strokeWidth={1.75} />
                          )}
                        </button>
                      </form>

                      <DeleteButton
                        action={deleteMessage}
                        fields={{ id: message.id }}
                        label="Supprimer ce message"
                        confirmMessage="Supprimer définitivement ce message ?"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-earth-700">
                    {message.message}
                  </p>

                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                    className="mt-4 inline-block text-sm font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
                  >
                    Répondre par email
                  </a>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <Panel>
          <EmptyState
            Icon={Mail}
            title="Aucun message"
            description="Les messages envoyés depuis la page Contact apparaîtront ici."
            className="border-0 bg-transparent"
          />
        </Panel>
      )}
    </>
  );
}
