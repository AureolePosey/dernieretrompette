import { Section, SectionHeading, Rule } from "@/components/ui/section";
import { Media } from "@/components/ui/media";
import { VideoPlayer } from "@/components/shared/video-player";
import { savoirFaire } from "@content/site";

/**
 * Les étapes du savoir-faire.
 *
 * Présentées comme une frise verticale : l'ordre des opérations est
 * l'information principale, et une grille de cartes la ferait disparaître.
 * La numérotation est portée par une liste ordonnée <ol>, donc restituée
 * comme telle par les lecteurs d'écran.
 */
export function SavoirFaire() {
  return (
    <Section tone="default" spacing="normal">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="Notre savoir-faire"
            title="Ce qui se passe entre la récolte et le sachet"
            description="Une succession d'opérations précises, où chaque geste compte pour la qualité du produit fini."
          />
          <Rule />

          <Media
            src="/images/transformation-pressage.jpeg"
            alt="Membre de la coopérative au poste de pressage du manioc"
            ratio="wide"
            sizes="(max-width: 1024px) 100vw, 40vw"
            placeholderLabel="Photo d'une étape de transformation"
            className="mt-9 rounded-card"
          />

          {/*
            La vidéo illustre l'étape 2 (la préparation). Elle ne se télécharge
            qu'au clic : voir le commentaire de VideoPlayer sur le coût des
            données mobiles.
          */}
          <VideoPlayer
            src="/images/lavage-manioc.mp4"
            poster="/images/lavage-manioc-apercu.jpg"
            alt="Lavage des tubercules de manioc dans le bassin de la coopérative"
            caption="Le lavage des tubercules, juste après la récolte."
            className="mt-6 max-w-[16rem]"
          />
        </div>

        <ol className="relative flex flex-col">
          {savoirFaire.map((step, index) => (
            <li key={step.step} className="relative flex gap-6 pb-10 last:pb-0">
              {/* Trait de liaison, interrompu après la dernière étape. */}
              {index < savoirFaire.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-14 bottom-0 left-[1.6875rem] w-px bg-earth-200"
                />
              ) : null}

              <span
                aria-hidden="true"
                className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-earth-200 bg-cream-100 font-display text-sm font-semibold text-leaf-700"
              >
                {step.step}
              </span>

              <div className="pt-2">
                <h3 className="font-display text-xl text-earth-900">{step.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-earth-500">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
