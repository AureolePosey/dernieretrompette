import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { LegalContent, LegalSection, LegalTodo } from "@/components/shared/legal-page";
import { getSettings } from "@/lib/settings";
import { isTodo, site } from "@content/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment La Dernière Trompette collecte, utilise et protège vos données personnelles.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

/**
 * Politique de confidentialité.
 *
 * TRAME À VALIDER JURIDIQUEMENT. Elle décrit fidèlement ce que le site fait
 * RÉELLEMENT : les données listées ici sont exactement celles que le schéma
 * Prisma enregistre, ni plus ni moins. Aucun traceur publicitaire n'est posé,
 * et c'est dit explicitement.
 */
export default async function PrivacyPage() {
  const settings = await getSettings();
  const email = isTodo(settings.email) ? null : settings.email;

  return (
    <>
      <PageHeader
        title="Politique de confidentialité"
        description="Quelles données nous collectons, pourquoi, et comment exercer vos droits."
        breadcrumb={[{ name: "Politique de confidentialité", href: "/confidentialite" }]}
      />

      <LegalContent>
        <p className="rounded-card border border-gari-200 bg-gari-50 px-5 py-4 text-sm leading-relaxed text-earth-700">
          Ce document est une trame à faire valider avant la mise en ligne. Il décrit les
          traitements réellement effectués par le site.
        </p>

        <LegalSection title="Responsable du traitement">
          <p>
            Les données collectées sur ce site sont traitées par {site.name},{" "}
            {isTodo(settings.legalName) ? (
              <LegalTodo>raison sociale</LegalTodo>
            ) : (
              settings.legalName
            )}
            .
          </p>
        </LegalSection>

        <LegalSection title="Données collectées">
          <p>Nous ne collectons que les données que vous nous transmettez volontairement.</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Formulaire de contact</strong> : nom, email, téléphone (facultatif), sujet
              et message.
            </li>
            <li>
              <strong>Commande</strong> : nom, téléphone, email (facultatif), adresse de
              livraison, ville, message éventuel, ainsi que le détail des produits commandés.
            </li>
            <li>
              <strong>Inscription à une formation</strong> : nom, téléphone, email (facultatif)
              et message éventuel.
            </li>
          </ul>
          <p>
            Aucune donnée bancaire n&apos;est collectée ni stockée par ce site : le règlement est
            organisé directement avec la coopérative.
          </p>
        </LegalSection>

        <LegalSection title="Finalités">
          <p>Ces données servent exclusivement à :</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>répondre à vos demandes d&apos;information ;</li>
            <li>traiter, préparer et livrer vos commandes ;</li>
            <li>gérer les inscriptions aux formations ;</li>
            <li>assurer le suivi de la relation avec nos clients.</li>
          </ul>
          <p>
            Elles ne font l&apos;objet d&apos;aucune revente, d&apos;aucune location et
            d&apos;aucun transfert à des fins publicitaires.
          </p>
        </LegalSection>

        <LegalSection title="Durée de conservation">
          <p>
            Messages de contact : <LegalTodo>durée, ex. 3 ans</LegalTodo>
            <br />
            Commandes et données clients : <LegalTodo>durée, selon obligations comptables</LegalTodo>
            <br />
            Inscriptions aux formations : <LegalTodo>durée</LegalTodo>
          </p>
        </LegalSection>

        <LegalSection title="Cookies et mesure d'audience">
          <p>
            Ce site ne dépose <strong>aucun cookie publicitaire</strong> et n&apos;utilise aucun
            traceur tiers de suivi comportemental.
          </p>
          <p>
            Un espace de stockage local (<em>localStorage</em>) est utilisé pour conserver le
            contenu de votre panier d&apos;un passage à l&apos;autre. Cette information reste sur
            votre appareil et ne nous est jamais transmise tant que vous ne validez pas une
            commande.
          </p>
          <p>
            Un cookie strictement technique est utilisé pour maintenir la session des
            administrateurs du site. Il ne concerne pas les visiteurs.
          </p>
        </LegalSection>

        <LegalSection title="Destinataires">
          <p>
            Vos données sont accessibles aux seules personnes habilitées de la coopérative
            chargées du traitement des commandes et des demandes.
          </p>
          <p>
            Elles sont hébergées par nos prestataires techniques (hébergement du site et base de
            données), dans le seul cadre de l&apos;exploitation du service.
          </p>
        </LegalSection>

        <LegalSection title="Vos droits">
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et
            d&apos;opposition concernant vos données.
          </p>
          <p>
            Pour l&apos;exercer, écrivez-nous à{" "}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="font-medium text-leaf-700 underline underline-offset-2"
              >
                {email}
              </a>
            ) : (
              <LegalTodo>adresse email de contact</LegalTodo>
            )}
            , ou utilisez notre{" "}
            <a
              href="/contact"
              className="font-medium text-leaf-700 underline underline-offset-2"
            >
              formulaire de contact
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Sécurité">
          <p>
            Les échanges avec ce site sont chiffrés (HTTPS). Les accès à l&apos;administration
            sont protégés par mot de passe et les mots de passe sont stockés sous forme
            chiffrée irréversible.
          </p>
        </LegalSection>
      </LegalContent>
    </>
  );
}
