import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Section, SectionHeading, Rule } from "@/components/ui/section";
import { Media } from "@/components/ui/media";
import { LogoFull } from "@/components/layout/logo";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { toParagraphs } from "@/lib/format";
import { missions, savoirFaire, site, values } from "@content/site";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez La Dernière Trompette : son histoire, sa vision, ses valeurs et le savoir-faire de ses membres dans la transformation des produits agricoles.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos | La Dernière Trompette",
    description:
      "L'histoire, la vision et les valeurs de la coopérative La Dernière Trompette.",
    url: "/a-propos",
  },
};

export const revalidate = 3600;

/**
 * Galerie de la page « À propos ».
 *
 * Chaque entrée porte DEUX textes distincts, qui ne jouent pas le même rôle :
 *   - `alt` décrit la scène pour qui ne voit pas l'image (lecteurs d'écran,
 *     moteurs de recherche) ;
 *   - `legende` est lue par tout le monde, sous la photo.
 * Les confondre reviendrait à répéter deux fois la même chose à l'écran, ou à
 * priver d'information ceux qui n'accèdent pas à l'image.
 *
 * Pour modifier la galerie, ajouter ou retirer une entrée ici suffit.
 */
const GALERIE = [
  {
    src: "/images/transformation-torrefaction.jpeg",
    alt: "Membre de la coopérative torréfiant le gari sur un foyer traditionnel",
    legende: "La torréfaction du gari",
  },
  {
    src: "/images/transformation-pressage.jpeg",
    alt: "Membre de la coopérative au poste de pressage du manioc",
    legende: "Le pressage du manioc",
  },
  {
    src: "/images/pdg2.jpeg",
    alt: "Responsable de la coopérative inspectant une parcelle après la récolte",
    legende: "Au champ, après la récolte",
  },
  {
    src: "/images/equipe-groupe.jpeg",
    alt: "Les membres de la coopérative réunis devant les locaux",
    legende: "Les membres de la coopérative",
  },
  {
    src: "/images/gariii3.jpeg",
    alt: "Sachets de gari d'un kilogramme, munis d'une poignée, prêts à la vente",
    legende: "Le gari conditionné en sachets d'un kilo",
  },
  {
    src: "/images/farineplanif.jpeg",
    alt: "Sacs de farine panifiable d'un kilogramme alignés sur une étoffe",
    legende: "La farine panifiable, prête à partir",
  },
] as const;

/**
 * Page « À propos ».
 *
 * Histoire, vision et mission proviennent de l'administration
 * (/admin/parametres). Tant qu'elles ne sont pas renseignées, la section
 * correspondante affiche un encadré de recette explicite plutôt qu'un texte
 * inventé : aucune affirmation sur la coopérative ne doit venir du code.
 */
export default async function AboutPage() {
  const settings = await getSettings();

  const history = toParagraphs(settings.aboutHistory);
  const vision = toParagraphs(settings.aboutVision);
  const mission = toParagraphs(settings.aboutMission);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "À propos", href: "/a-propos" }])} />

      <PageHeader
        eyebrow="La coopérative"
        title="Qui sommes-nous ?"
        description={settings.shortDescription}
        breadcrumb={[{ name: "À propos", href: "/a-propos" }]}
      />

      {/* --- Notre histoire --- */}
      <Section tone="default" spacing="normal">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Notre histoire" title="Une coopérative née du terrain" />
            <Rule />

            <div className="mt-7 space-y-4 text-base leading-relaxed text-earth-500">
              {history.length > 0 ? (
                history.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <PendingContent
                  label="Notre histoire"
                  hint="Renseignez ce texte depuis l'administration : Paramètres → Page À propos → Notre histoire."
                />
              )}
            </div>

            {/*
              Le logo officiel complet, avec sa dénomination. Il n'apparaît que
              sur cette page : c'est la seule qui lui offre la largeur
              nécessaire pour que son bloc de texte reste lisible.
            */}
            <figure className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
              <LogoFull className="w-40 shrink-0 sm:w-48" />
              <figcaption className="font-display text-sm leading-snug text-earth-600">
                {settings.legalName}
              </figcaption>
            </figure>

            <p className="mt-8 rounded-card border border-earth-200 bg-cream-100 px-5 py-4 text-sm leading-relaxed text-earth-600">
              La Dernière Trompette intervient sur l&apos;ensemble de la chaîne : production,
              transformation, commercialisation et formation. Cette maîtrise complète est ce qui
              distingue la coopérative d&apos;un simple revendeur.
            </p>
          </div>

          <div className="relative">
            <Media
              src="/images/pdg.jpeg"
              alt="Responsable de la coopérative au travail dans une parcelle de manioc"
              ratio="portrait"
              sizes="(max-width: 1024px) 100vw, 45vw"
              placeholderLabel="Photo de présentation de la coopérative"
              className="rounded-card"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 -z-10 size-36 rounded-card border-2 border-gari-300/40 md:size-48"
            />
          </div>
        </div>
      </Section>

      {/* --- Vision & mission --- */}
      <Section tone="cream" spacing="normal">
        <SectionHeading
          eyebrow="Notre cap"
          title="Vision et mission"
          description="Ce vers quoi nous allons, et ce que nous faisons chaque jour pour y parvenir."
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <VisionCard
            Icon={Compass}
            title="Notre vision"
            paragraphs={vision}
            pendingHint="Paramètres → Page À propos → Notre vision."
          />
          <VisionCard
            Icon={Target}
            title="Notre mission"
            paragraphs={mission}
            pendingHint="Paramètres → Page À propos → Notre mission."
          />
        </div>
      </Section>

      {/* --- Valeurs --- */}
      <Section tone="default" spacing="normal">
        <SectionHeading
          eyebrow="Nos valeurs"
          title="Ce qui guide nos décisions"
          align="center"
        />

        <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {values.map((value) => (
            <li
              key={value.title}
              className="rounded-card border border-earth-200 bg-cream-50 p-7 transition-[border-color,box-shadow] duration-300 hover:border-earth-300 hover:shadow-soft"
            >
              <h3 className="font-display text-xl text-earth-900">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-earth-500">{value.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* --- Engagements / missions --- */}
      <Section tone="leaf" spacing="normal" className="relative overflow-hidden">
        <div className="texture-grain absolute inset-0 opacity-10" aria-hidden="true" />

        <div className="relative">
          <SectionHeading
            eyebrow="Nos engagements"
            title="Ce à quoi la coopérative s'engage"
            align="center"
            onDark
          />

          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((missionItem) => (
              <li key={missionItem.title}>
                <h3 className="font-display text-lg text-gari-300">{missionItem.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-200/75">
                  {missionItem.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --- Savoir-faire --- */}
      <Section tone="default" spacing="normal">
        <SectionHeading
          eyebrow="Notre savoir-faire"
          title="De la récolte au conditionnement"
          description="Chaque étape est réalisée par la coopérative, avec le même niveau d'exigence."
          align="center"
        />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {savoirFaire.map((step) => (
            <li
              key={step.step}
              className="rounded-card border border-earth-200 bg-cream-50 p-6"
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl font-semibold text-gari-600"
              >
                {step.step}
              </span>
              <h3 className="mt-3 font-display text-lg text-earth-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-earth-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* --- Galerie --- */}
      <Section tone="cream" spacing="normal">
        <SectionHeading
          eyebrow="En images"
          title="La coopérative au quotidien"
          description="Quelques images du travail quotidien de la coopérative."
          align="center"
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALERIE.map((photo) => (
            <li key={photo.src}>
              <figure>
                <Media
                  src={photo.src}
                  alt={photo.alt}
                  ratio="photo"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="rounded-card"
                />
                <figcaption className="mt-2 text-sm text-earth-500">{photo.legende}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      {/* --- CTA --- */}
      <Section tone="default" spacing="tight">
        <div className="flex flex-col items-center gap-6 rounded-card border border-earth-200 bg-cream-100 px-6 py-12 text-center">
          <h2 className="max-w-xl font-display text-2xl leading-snug text-earth-900 md:text-3xl">
            Envie de découvrir les produits de {site.name} ?
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/produits" className={buttonStyles({ size: "lg" })}>
              Voir nos produits
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Nous contacter
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

/**
 * Encadré de recette affiché tant qu'un texte n'a pas été fourni.
 * Volontairement visible : il disparaît dès la première saisie, et rappelle
 * au passage où renseigner l'information.
 */
function PendingContent({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-card border border-dashed border-earth-300 bg-cream-100/60 px-5 py-6">
      <p className="font-display text-base text-earth-700">{label} — [À RENSEIGNER]</p>
      <p className="mt-2 text-sm text-earth-400">{hint}</p>
    </div>
  );
}

function VisionCard({
  Icon,
  title,
  paragraphs,
  pendingHint,
}: {
  Icon: typeof Compass;
  title: string;
  paragraphs: string[];
  pendingHint: string;
}) {
  return (
    <article className="rounded-card border border-earth-200 bg-cream-50 p-8">
      <span className="grid size-12 place-items-center rounded-full bg-leaf-50 text-leaf-600">
        <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
      </span>

      <h3 className="mt-5 font-display text-xl text-earth-900">{title}</h3>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-earth-500">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <PendingContent label={title} hint={pendingHint} />
        )}
      </div>
    </article>
  );
}
