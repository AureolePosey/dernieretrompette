import { AdminNav } from "@/components/admin/admin-nav";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Coque de l'espace d'administration.
 *
 * `requireAuth()` est appelé ici, mais ce n'est PAS la seule vérification :
 * chaque Server Action refait le contrôle de son côté. Un layout protège un
 * rendu, pas une mutation — et une Server Action peut être invoquée
 * directement, sans passer par cette page.
 */

/** Jamais mis en cache : les compteurs et les données changent en permanence. */
export const dynamic = "force-dynamic";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  // Compteurs des pastilles. En cas d'incident base, on affiche 0 plutôt que
  // d'empêcher l'accès à l'administration — c'est justement le moment où
  // l'administrateur en a besoin.
  const [orders, messages] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }).catch(() => 0),
    prisma.contactMessage.count({ where: { read: false, archived: false } }).catch(() => 0),
  ]);

  return (
    <div className="min-h-dvh bg-cream-100">
      <AdminNav
        userName={session.name}
        userRole={session.role}
        pendingCounts={{ orders, messages }}
      />

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
