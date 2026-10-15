import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";

/**
 * Coque des pages publiques.
 *
 * Le lien d'évitement est le tout premier élément focalisable : un utilisateur
 * au clavier atteint le contenu sans traverser les huit liens de navigation à
 * chaque page (WCAG 2.4.1).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only-focusable z-[100] rounded-card bg-leaf-700 px-5 py-3 text-sm font-semibold text-cream-50 focus:top-4 focus:left-4"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="contenu" className="flex-1">
        {children}
      </main>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
