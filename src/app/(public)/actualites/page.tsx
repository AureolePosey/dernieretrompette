import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NewsCard } from "@/components/shared/news-card";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getPublishedNews } from "@/server/queries";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Les annonces et actualités de la coopérative La Dernière Trompette : nouveaux produits, campagnes de production, formations et événements.",
  alternates: { canonical: "/actualites" },
  openGraph: {
    title: "Actualités | La Dernière Trompette",
    description: "Les annonces et la vie de la coopérative.",
    url: "/actualites",
  },
};

export const revalidate = 3600;

export default async function NewsListPage() {
  const news = await getPublishedNews();

  // Le premier article est mis en avant sur toute la largeur : sur un flux
  // d'annonces, la plus récente est presque toujours la plus importante.
  const [featured, ...rest] = news;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Actualités", href: "/actualites" }])} />

      <PageHeader
        eyebrow="Annonces"
        title="Actualités de la coopérative"
        description="Nouveaux produits, campagnes de production, formations, événements : retrouvez ici toutes nos annonces."
        breadcrumb={[{ name: "Actualités", href: "/actualites" }]}
      />

      <div className="container-page py-12 md:py-16">
        {news.length > 0 ? (
          <div className="flex flex-col gap-10">
            {featured ? (
              <NewsCard
                news={featured}
                className="md:grid md:grid-cols-2 md:items-stretch md:[&>div]:p-8"
              />
            ) : null}

            {rest.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <li key={article.id} className="flex">
                    <NewsCard news={article} compact className="w-full" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <EmptyState
            Icon={Newspaper}
            title="Aucune actualité pour le moment"
            description="Les annonces publiées par la coopérative apparaîtront ici."
          />
        )}
      </div>
    </>
  );
}
