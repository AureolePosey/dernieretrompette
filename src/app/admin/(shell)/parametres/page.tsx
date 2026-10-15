import { Info } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { getRawSettings } from "@/lib/settings";

export const metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

/**
 * Paramètres du site.
 *
 * Réservé au rôle ADMIN : ces valeurs (coordonnées, mentions légales, textes
 * institutionnels) engagent la coopérative, contrairement à une fiche produit
 * qu'un éditeur peut modifier librement.
 */
export default async function AdminSettingsPage() {
  await requireAdmin();

  const values = await getRawSettings();

  return (
    <>
      <AdminPageHeader
        title="Paramètres du site"
        description="Coordonnées, réseaux sociaux et textes institutionnels. Toute modification est visible immédiatement sur le site."
      />

      <p className="mb-6 flex items-start gap-3 rounded-card border border-earth-200 bg-cream-50 px-4 py-3 text-sm leading-relaxed text-earth-600">
        <Info className="mt-0.5 size-4.5 shrink-0 text-leaf-600" aria-hidden="true" strokeWidth={2} />
        <span>
          Un champ laissé vide reprend la valeur par défaut définie dans le code. Les
          coordonnées non renseignées s&apos;affichent en « À renseigner » sur le site, et les
          boutons correspondants (appel, WhatsApp) restent masqués tant qu&apos;aucune valeur
          n&apos;est saisie.
        </span>
      </p>

      <SettingsForm values={values} />
    </>
  );
}
