import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { NewsForm } from "@/components/admin/news-form";
import { deleteNews } from "@/server/actions/content";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Modifier une actualité" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditNewsPage({ params }: { params: Params }) {
  await requireAuth();
  const { id } = await params;

  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <>
      <Link
        href="/admin/actualites"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-earth-500 transition-colors hover:text-leaf-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={2} />
        Toutes les actualités
      </Link>

      <AdminPageHeader
        title={news.title}
        action={
          news.published ? (
            <Link
              href={`/actualites/${news.slug}`}
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

      <NewsForm news={news} />

      <section className="mt-10">
        <Panel className="border-clay-500/25 bg-clay-100/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base text-earth-900">Supprimer cette actualité</h2>
              <p className="mt-1 text-sm text-earth-500">Action définitive.</p>
            </div>

            <form action={deleteNews} className="shrink-0">
              <input type="hidden" name="id" value={news.id} />
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
