import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { NewsCard } from "@/components/shared/news-card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { getPublishedNews } from "@/server/queries";

export async function NewsPreview() {
  const news = await getPublishedNews(3);

  return (
    <Section tone="default" spacing="normal">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Actualités"
          title="La vie de la coopérative"
          description="Nouveaux produits, campagnes de production, formations et annonces importantes."
        />

        <Link
          href="/actualites"
          className={buttonStyles({
            variant: "secondary",
            className: "shrink-0 self-start md:self-auto",
          })}
        >
          Toutes les actualités
          <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
        </Link>
      </div>

      {news.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <li key={article.id} className="flex">
              <NewsCard news={article} compact className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          Icon={Newspaper}
          title="Aucune actualité publiée pour le moment"
          description="Les annonces publiées depuis l'espace d'administration apparaîtront ici."
          className="mt-12"
        />
      )}
    </Section>
  );
}
