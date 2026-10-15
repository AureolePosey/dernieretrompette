import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Media } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import { NewsCard } from "@/components/shared/news-card";
import { Section, SectionHeading } from "@/components/ui/section";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getNewsBySlug, getPublishedNews, getPublishedNewsSlugs } from "@/server/queries";
import { formatDate, toISODate, toParagraphs, truncate } from "@/lib/format";
import { site } from "@content/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const news = await getPublishedNewsSlugs();
  return news.map((article) => ({ slug: article.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return { title: "Article introuvable", robots: { index: false, follow: false } };
  }

  const description = article.excerpt ?? truncate(article.content, 155);
  const published = article.publishedAt ?? article.createdAt;

  return {
    title: article.title,
    description,
    alternates: { canonical: `/actualites/${article.slug}` },
    openGraph: {
      type: "article",
      title: `${article.title} | ${site.name}`,
      description,
      url: `/actualites/${article.slug}`,
      publishedTime: published.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.coverUrl ? [{ url: article.coverUrl }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) notFound();

  const allNews = await getPublishedNews(4);
  const others = allNews.filter((item) => item.id !== article.id).slice(0, 3);

  const paragraphs = toParagraphs(article.content);
  const publishedAt = article.publishedAt ?? article.createdAt;

  const breadcrumb = [
    { name: "Actualités", href: "/actualites" },
    { name: article.title, href: `/actualites/${article.slug}` },
  ];

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />

      <PageHeader
        eyebrow={article.category ?? "Actualité"}
        title={article.title}
        description={article.excerpt ?? undefined}
        breadcrumb={breadcrumb}
      />

      <article className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-4">
            {article.category ? <Badge tone="success">{article.category}</Badge> : null}
            <time dateTime={toISODate(publishedAt)} className="text-sm text-earth-400">
              Publié le {formatDate(publishedAt)}
            </time>
            {article.author ? (
              <span className="text-sm text-earth-400">par {article.author}</span>
            ) : null}
          </div>

          <Media
            src={article.coverUrl}
            alt={article.coverAlt ?? article.title}
            ratio="wide"
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            placeholderLabel="Image de l'actualité à fournir"
            className="mt-8 rounded-card"
          />

          {/*
            Le contenu est saisi en texte brut dans l'administration et rendu
            comme tel : pas de HTML injecté, donc aucune surface XSS.
          */}
          <div className="mt-10 space-y-5 text-base leading-[1.75] text-earth-600 md:text-lg">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <hr className="mt-12 border-earth-200" />

          <Link
            href="/actualites"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 transition-colors hover:text-leaf-800"
          >
            <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Retour aux actualités
          </Link>
        </div>
      </article>

      {others.length > 0 ? (
        <Section tone="cream" spacing="tight">
          <SectionHeading eyebrow="À lire aussi" title="Autres actualités" as="h2" />

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.id} className="flex">
                <NewsCard news={item} compact className="w-full" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
