import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Media } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import { formatDate, priceLabel, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TrainingCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  durationLabel: string | null;
  startDate: Date | null;
  location: string | null;
  price: number | null;
  seats: number | null;
};

/**
 * Carte formation.
 *
 * Les caractéristiques (durée, date, lieu, places) ne s'affichent que si elles
 * sont renseignées : une ligne « Lieu : — » donnerait l'impression d'une fiche
 * bâclée alors qu'il s'agit simplement d'une information pas encore arrêtée.
 */
export function TrainingCard({
  training,
  className,
}: {
  training: TrainingCardData;
  className?: string;
}) {
  /**
   * Chaque caractéristique porte une clé STABLE issue de sa nature, et non de
   * son texte : deux champs différents peuvent très bien contenir la même
   * valeur (par exemple « [À COMPLÉTER] » en durée et en lieu), ce qui
   * produirait des clés React en double.
   */
  type Fact = { id: string; Icon: typeof Clock; text: string; dateTime?: string };

  const facts: Fact[] = [
    training.durationLabel
      ? { id: "duration", Icon: Clock, text: training.durationLabel }
      : null,
    training.startDate
      ? {
          id: "date",
          Icon: CalendarDays,
          text: formatDate(training.startDate),
          dateTime: toISODate(training.startDate),
        }
      : null,
    training.location ? { id: "location", Icon: MapPin, text: training.location } : null,
    training.seats ? { id: "seats", Icon: Users, text: `${training.seats} places` } : null,
  ].filter((fact): fact is Fact => fact !== null);

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
        src={training.coverUrl}
        alt={training.coverAlt ?? training.title}
        ratio="wide"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        placeholderLabel="Photo de la formation"
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />

      <div className="flex flex-1 flex-col p-6">
        <Badge tone="warning" className="self-start">
          Formation
        </Badge>

        <h3 className="mt-3 font-display text-lg leading-snug text-earth-900">
          <Link
            href={`/formations/${training.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {training.title}
          </Link>
        </h3>

        {training.summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-earth-500">
            {training.summary}
          </p>
        ) : null}

        {facts.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {facts.map(({ id, Icon, text, dateTime }) => (
              <li key={id} className="flex items-center gap-1.5 text-xs text-earth-400">
                <Icon className="size-3.5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
                {dateTime ? <time dateTime={dateTime}>{text}</time> : <span>{text}</span>}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-auto pt-5 font-display text-lg font-semibold text-leaf-700">
          {priceLabel(training.price)}
        </p>
      </div>
    </article>
  );
}
