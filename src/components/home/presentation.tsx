import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading, Rule } from "@/components/ui/section";
import { Media } from "@/components/ui/media";
import { buttonStyles } from "@/components/ui/button";
import { values } from "@content/site";

/**
 * Présentation courte de la coopérative sur la page d'accueil.
 *
 * Le texte reste volontairement qualitatif : aucune date de création, aucun
 * effectif, aucun volume de production n'est avancé tant que le client ne les
 * a pas communiqués. La page « À propos » accueillera ces éléments.
 */
export function Presentation() {
  return (
    <Section tone="default" spacing="normal">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <Media
            src={null}
            alt="Membres de la coopérative au travail"
            ratio="photo"
            sizes="(max-width: 1024px) 100vw, 45vw"
            placeholderLabel="Photo des membres de la coopérative"
            className="rounded-card"
          />

          {/* Second cadre décalé : donne de la profondeur sans recourir à une ombre lourde. */}
          <div
            aria-hidden="true"
            className="absolute -right-3 -bottom-3 -z-10 size-32 rounded-card border-2 border-gari-300/40 md:-right-5 md:-bottom-5 md:size-44"
          />
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="La coopérative"
            title="Un collectif qui maîtrise toute la chaîne"
          />
          <Rule />

          <div className="mt-7 space-y-4 text-base leading-relaxed text-earth-500">
            <p>
              La Dernière Trompette réunit des productrices et des producteurs autour d&apos;une
              même conviction : la valeur d&apos;une récolte se joue après le champ. C&apos;est
              dans la transformation que le manioc devient gari ou tapioca, et c&apos;est là que
              se construit un revenu juste.
            </p>
            <p>
              De la préparation des tubercules au conditionnement, chaque étape est réalisée
              par la coopérative elle-même. Cette maîtrise complète nous permet de garantir la
              régularité de nos produits et de répondre directement à nos clients.
            </p>
          </div>

          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {values.map((value) => (
              <li key={value.title}>
                <h3 className="font-display text-base text-earth-900">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-earth-500">{value.text}</p>
              </li>
            ))}
          </ul>

          <Link
            href="/a-propos"
            className={buttonStyles({ variant: "secondary", className: "mt-9" })}
          >
            En savoir plus sur nous
            <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
