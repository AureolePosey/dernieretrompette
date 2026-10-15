import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Media } from "@/components/ui/media";
import { TrainingRegistrationForm } from "@/components/shared/training-registration-form";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd, courseJsonLd } from "@/lib/seo";
import { getPublishedTrainingSlugs, getTrainingBySlug } from "@/server/queries";
import { getSettings } from "@/lib/settings";
import { trainingWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatDate, priceLabel, toISODate, toParagraphs, truncate } from "@/lib/format";
import { site } from "@content/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const trainings = await getPublishedTrainingSlugs();
  return trainings.map((training) => ({ slug: training.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const training = await getTrainingBySlug(slug);

  if (!training) {
    return { title: "Formation introuvable", robots: { index: false, follow: false } };
  }

  const description =
    training.summary ??
    (training.description ? truncate(training.description, 155) : site.metaDescription);

  return {
    title: training.title,
    description,
    alternates: { canonical: `/formations/${training.slug}` },
    openGraph: {
      title: `${training.title} | ${site.name}`,
      description,
      url: `/formations/${training.slug}`,
      images: training.coverUrl ? [{ url: training.coverUrl }] : undefined,
    },
  };
}

export default async function TrainingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const training = await getTrainingBySlug(slug);

  if (!training) notFound();

  const settings = await getSettings();
  const whatsappHref = whatsappLink(
    settings.whatsapp,
    trainingWhatsappMessage(training.title, site.name),
  );

  const descriptionParagraphs = toParagraphs(training.description);
  const conditionsParagraphs = toParagraphs(training.conditions);

  const facts = [
    training.durationLabel ? { Icon: Clock, label: "Durée", value: training.durationLabel } : null,
    training.startDate
      ? {
          Icon: CalendarDays,
          label: "Date",
          value: training.endDate
            ? `${formatDate(training.startDate)} → ${formatDate(training.endDate)}`
            : formatDate(training.startDate),
          dateTime: toISODate(training.startDate),
        }
      : null,
    training.location ? { Icon: MapPin, label: "Lieu", value: training.location } : null,
    training.seats ? { Icon: Users, label: "Places", value: `${training.seats}` } : null,
  ].filter((fact) => fact !== null);

  const breadcrumb = [
    { name: "Formations", href: "/formations" },
    { name: training.title, href: `/formations/${training.slug}` },
  ];

  return (
    <>
      <JsonLd data={courseJsonLd(training)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />

      <PageHeader
        eyebrow="Formation"
        title={training.title}
        description={training.summary ?? undefined}
        breadcrumb={breadcrumb}
      />

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:items-start">
          {/* --- Contenu --- */}
          <div>
            <Media
              src={training.coverUrl}
              alt={training.coverAlt ?? training.title}
              ratio="wide"
              priority
              sizes="(max-width: 1024px) 100vw, 700px"
              placeholderLabel="Photo de la formation à fournir"
              className="rounded-card"
            />

            {facts.length > 0 ? (
              <dl className="mt-8 grid gap-5 border-y border-earth-200 py-6 sm:grid-cols-2 lg:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col gap-1">
                    <dt className="flex items-center gap-1.5 text-xs tracking-wider text-earth-400 uppercase">
                      <fact.Icon className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
                      {fact.label}
                    </dt>
                    <dd className="text-sm font-medium text-earth-900">
                      {"dateTime" in fact && fact.dateTime ? (
                        <time dateTime={fact.dateTime}>{fact.value}</time>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {descriptionParagraphs.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl text-earth-900">Présentation</h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-earth-500">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {training.objectives.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl text-earth-900">Objectifs</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {training.objectives.map((objective, index) => (
                    <li key={index} className="flex gap-3 text-base leading-relaxed text-earth-600">
                      <CheckCircle2
                        className="mt-1 size-4 shrink-0 text-leaf-600"
                        aria-hidden="true"
                        strokeWidth={2}
                      />
                      {objective}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {training.program.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl text-earth-900">Programme</h2>
                <ol className="mt-4 flex flex-col gap-4">
                  {training.program.map((item, index) => (
                    <li key={index} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-cream-100 font-display text-sm font-semibold text-leaf-700"
                      >
                        {index + 1}
                      </span>
                      <p className="pt-1 text-base leading-relaxed text-earth-600">{item}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {conditionsParagraphs.length > 0 ? (
              <section className="mt-10 rounded-card border border-earth-200 bg-cream-100 p-6">
                <h2 className="font-display text-lg text-earth-900">
                  Conditions d&apos;inscription
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-earth-600">
                  {conditionsParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* --- Inscription --- */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-card border border-earth-200 bg-cream-50 p-6 shadow-soft">
              <p className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold text-leaf-700">
                  {priceLabel(training.price)}
                </span>
              </p>

              <hr className="my-6 border-earth-200" />

              <TrainingRegistrationForm
                trainingId={training.id}
                trainingTitle={training.title}
              />

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "lg",
                    className: "mt-4 w-full",
                  })}
                >
                  <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
                  Poser une question
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
