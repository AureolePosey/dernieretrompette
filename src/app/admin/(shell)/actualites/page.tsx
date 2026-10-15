import Link from "next/link";
import { ExternalLink, Newspaper, Pencil, Plus } from "lucide-react";
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
import { toggleNewsPublished } from "@/server/actions/content";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Actualités" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ cree?: string; supprime?: string }>;

export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;

  const news = await prisma.news.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminPageHeader
        title="Actualités"
        description="Publiez les annonces et les nouvelles de la coopérative."
        action={
          <Link href="/admin/actualites/nouveau" className={buttonStyles({ size: "md" })}>
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Nouvelle actualité
          </Link>
        }
      />

      {params.cree ? <FeedbackBanner status="success" message="Actualité créée." /> : null}
      {params.supprime ? <FeedbackBanner status="success" message="Actualité supprimée." /> : null}

      {news.length > 0 ? (
        <DataTable headers={["Titre", "Catégorie", "Date", "État", "Actions"]}>
          {news.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <p className="font-medium text-earth-900">{article.title}</p>
                <p className="truncate text-xs text-earth-400">/{article.slug}</p>
              </TableCell>

              <TableCell className="text-earth-500">
                {article.category ?? <span className="text-earth-400">—</span>}
              </TableCell>

              <TableCell className="whitespace-nowrap text-earth-500">
                {formatDate(article.publishedAt ?? article.createdAt)}
              </TableCell>

              <TableCell>
                <form action={toggleNewsPublished}>
                  <input type="hidden" name="id" value={article.id} />
                  <button
                    type="submit"
                    title="Basculer la publication"
                    className="cursor-pointer"
                  >
                    <Badge tone={article.published ? "success" : "neutral"}>
                      {article.published ? "Publiée" : "Brouillon"}
                    </Badge>
                  </button>
                </form>
              </TableCell>

              <TableCell align="right">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/actualites/${article.id}`}
                    aria-label={`Modifier ${article.title}`}
                    className="grid size-9 place-items-center rounded-full text-earth-500 transition-colors hover:bg-cream-200 hover:text-earth-900"
                  >
                    <Pencil className="size-4" aria-hidden="true" strokeWidth={1.75} />
                  </Link>

                  {article.published ? (
                    <Link
                      href={`/actualites/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Voir ${article.title} sur le site`}
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
          Icon={Newspaper}
          title="Aucune actualité"
          description="Publiez votre première annonce : elle apparaîtra sur l'accueil et dans la rubrique Actualités."
          action={
            <Link href="/admin/actualites/nouveau" className={buttonStyles({ size: "lg" })}>
              <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
              Créer une actualité
            </Link>
          }
        />
      )}
    </>
  );
}
