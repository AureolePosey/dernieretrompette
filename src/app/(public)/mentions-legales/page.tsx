import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { LegalContent, LegalSection, LegalTodo } from "@/components/shared/legal-page";
import { getSettings } from "@/lib/settings";
import { isTodo, site } from "@content/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site de la coopérative La Dernière Trompette.",
  alternates: { canonical: "/mentions-legales" },
  // Aucun intérêt à faire remonter cette page dans les recherches,
  // mais les liens qu'elle contient doivent rester suivis.
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

/**
 * Mentions légales.
 *
 * TRAME À VALIDER JURIDIQUEMENT. Les informations d'identification de la
 * coopérative (raison sociale, immatriculation, hébergeur, directeur de
 * publication) sont affichées depuis les paramètres, et signalées en
 * [À RENSEIGNER] tant qu'elles n'ont pas été fournies.
 */
export default async function LegalNoticePage() {
  const settings = await getSettings();

  const legalName = isTodo(settings.legalName) ? null : settings.legalName;
  const address = isTodo(settings.address) ? null : settings.address;
  const email = isTodo(settings.email) ? null : settings.email;
  const phone = isTodo(settings.phone) ? null : settings.phone;

  return (
    <>
      <PageHeader
        title="Mentions légales"
        breadcrumb={[{ name: "Mentions légales", href: "/mentions-legales" }]}
      />

      <LegalContent>
        <p className="rounded-card border border-gari-200 bg-gari-50 px-5 py-4 text-sm leading-relaxed text-earth-700">
          Ce document est une trame. Les informations marquées [À RENSEIGNER] doivent être
          complétées depuis l&apos;espace d&apos;administration, et l&apos;ensemble validé par la
          coopérative avant la mise en ligne.
        </p>

        <LegalSection title="Éditeur du site">
          <p>
            Le présent site est édité par{" "}
            {legalName ? (
              <strong>{legalName}</strong>
            ) : (
              <LegalTodo>raison sociale exacte de la coopérative</LegalTodo>
            )}
            , exerçant sous le nom <strong>{site.name}</strong>.
          </p>
          <p>
            Siège : {address ?? <LegalTodo>adresse du siège</LegalTodo>}
            <br />
            Téléphone : {phone ?? <LegalTodo>numéro de téléphone</LegalTodo>}
            <br />
            Email : {email ?? <LegalTodo>adresse email de contact</LegalTodo>}
          </p>
          <p>
            Forme juridique et immatriculation :{" "}
            <LegalTodo>statut juridique, numéro d&apos;enregistrement, identifiant fiscal</LegalTodo>
          </p>
        </LegalSection>

        <LegalSection title="Directeur de la publication">
          <p>
            <LegalTodo>nom et qualité du responsable de la publication</LegalTodo>
          </p>
        </LegalSection>

        <LegalSection title="Hébergement">
          <p>
            Le site est hébergé par <LegalTodo>nom et adresse de l&apos;hébergeur</LegalTodo>.
          </p>
        </LegalSection>

        <LegalSection title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des contenus présents sur ce site — textes, photographies,
            illustrations, logo et éléments graphiques — est la propriété de {site.name}, sauf
            mention contraire.
          </p>
          <p>
            Toute reproduction, représentation, modification ou diffusion, totale ou partielle,
            sans autorisation écrite préalable, est interdite.
          </p>
        </LegalSection>

        <LegalSection title="Données personnelles">
          <p>
            Les informations collectées via les formulaires de contact, de commande et
            d&apos;inscription aux formations servent uniquement à traiter votre demande.
          </p>
          <p>
            Les modalités de traitement, de conservation et d&apos;exercice de vos droits sont
            détaillées dans notre{" "}
            <a
              href="/confidentialite"
              className="font-medium text-leaf-700 underline underline-offset-2"
            >
              politique de confidentialité
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Responsabilité">
          <p>
            {site.name} s&apos;efforce de maintenir les informations de ce site exactes et à
            jour, notamment concernant la disponibilité et les caractéristiques des produits.
            Des erreurs ou omissions restent toutefois possibles.
          </p>
          <p>
            Les prix et disponibilités affichés sont donnés à titre indicatif et confirmés lors
            du traitement de chaque commande.
          </p>
        </LegalSection>

        <LegalSection title="Droit applicable">
          <p>
            Les présentes mentions sont régies par le droit en vigueur à{" "}
            <LegalTodo>pays / juridiction compétente</LegalTodo>.
          </p>
        </LegalSection>
      </LegalContent>
    </>
  );
}
