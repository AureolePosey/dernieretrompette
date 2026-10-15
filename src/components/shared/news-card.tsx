import Link from "next/link";
import { Media } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import { formatDate, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type NewsCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  category: string | null;
  publishedAt: Date | null;
  createdAt: Date;
};

/**
 * Carte d'actualité.
 *
 * La date est rendue dans une balise <time> avec attribut `dateTime` : elle
 * reste lisible pour l'humain au format français, et exploitable par les
 * moteurs de recherche au format ISO.
 */
export function NewsCard({
  news,
  className,
  compact = false,
}: {
  news: NewsCardData;
  className?: string;
  compact?: boolean;
}) {
  const date = news.publishedAt ?? news.createdAt;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-earth-200 bg-cream-50",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-1 hover:border-earth-300 hover:shadow-lift",
        className,
      )}
    >
      <Media
        src={news.coverUrl}
        alt={news.coverAlt ?? news.title}
        ratio={compact ? "wide" : "photo"}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        placeholderLabel="Image de l'actualité"
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-3">
          {news.category ? <Badge tone="success">{news.category}</Badge> : null}
          <time dateTime={toISODate(date)} className="text-xs text-earth-400">
            {formatDate(date)}
          </time>
        </div>

        <h3 className="mt-3 font-display text-lg leading-snug text-earth-900">
          <Link
            href={`/actualites/${news.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {news.title}
          </Link>
        </h3>

        {news.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-earth-500">
            {news.excerpt}
          </p>
        ) : null}

        <span className="mt-auto pt-5 text-sm font-semibold text-leaf-700">
          Lire la suite
          <span aria-hidden="true" className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </article>
  );
}
