import { MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { generalWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { site } from "@content/site";

/**
 * Bouton flottant WhatsApp.
 *
 * Ne s'affiche que si un numéro a réellement été fourni : aucun numéro n'est
 * inventé, et un bouton qui n'aboutit nulle part détruirait la confiance.
 *
 * Positionné au-dessus de la zone de pouce sur mobile, décalé pour ne jamais
 * recouvrir le bouton d'action principal d'une fiche produit.
 */
export async function WhatsAppFab() {
  const settings = await getSettings();
  const href = whatsappLink(settings.whatsapp, generalWhatsappMessage(site.name));

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-pill bg-leaf-600 py-3.5 pr-5 pl-4 text-sm font-semibold text-cream-50 shadow-lift transition-[background-color,transform] duration-200 hover:bg-leaf-700 active:translate-y-px md:right-6 md:bottom-6"
    >
      <MessageCircle className="size-5" aria-hidden="true" strokeWidth={2} />
      <span className="hidden sm:inline">Écrire sur WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
