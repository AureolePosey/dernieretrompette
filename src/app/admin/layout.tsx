import type { Metadata } from "next";

/**
 * Coque commune à TOUT /admin, y compris la page de connexion.
 *
 * Son unique rôle est d'interdire l'indexation. La coque visuelle (barre
 * latérale, en-tête) vit dans le groupe (shell), afin que la page de connexion
 * n'affiche pas une navigation à laquelle le visiteur n'a pas encore accès.
 */
export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
