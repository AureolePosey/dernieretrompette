import { GraduationCap, ShoppingBasket, Sprout, Wheat } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { missions } from "@content/site";

/**
 * Les quatre missions de la coopérative.
 *
 * Section à fond sombre : elle marque une respiration au milieu de la page et
 * évite l'effet « suite de blocs blancs » des templates génériques.
 */

const icons = {
  sprout: Sprout,
  mill: Wheat,
  basket: ShoppingBasket,
  graduation: GraduationCap,
} as const;

export function Missions() {
  return (
    <Section tone="leaf" spacing="normal" className="relative overflow-hidden">
      <div className="texture-grain absolute inset-0 opacity-10" aria-hidden="true" />

      <div className="relative">
        <SectionHeading
          eyebrow="Nos missions"
          title="Quatre engagements, une même chaîne"
          description="De la parcelle à la vente, la coopérative intervient à chaque étape et transmet son savoir-faire."
          align="center"
          onDark
        />

        <ul className="mt-14 grid gap-px overflow-hidden rounded-card bg-cream-200/15 sm:grid-cols-2 lg:grid-cols-4">
          {missions.map((mission) => {
            const Icon = icons[mission.icon];

            return (
              <li
                key={mission.title}
                className="group bg-leaf-800 p-7 transition-colors duration-300 hover:bg-leaf-700"
              >
                <span className="grid size-12 place-items-center rounded-full border border-gari-300/30 bg-gari-300/10 text-gari-300 transition-colors duration-300 group-hover:bg-gari-300 group-hover:text-leaf-900">
                  <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
                </span>

                <h3 className="mt-5 font-display text-xl text-cream-50">{mission.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-200/75">{mission.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
