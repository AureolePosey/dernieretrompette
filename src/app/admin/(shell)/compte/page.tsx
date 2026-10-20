import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { ProfileForm, PasswordForm } from "@/components/admin/account-forms";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

/**
 * Compte de l'administrateur connecté.
 *
 * Ne gère QUE son propre compte : pas de liste d'utilisateurs, pas de création
 * ni de suppression. Avec deux ou trois comptes au total, une administration
 * des utilisateurs complète serait du code à maintenir pour rien — Prisma
 * Studio suffit pour les rares opérations restantes (voir le README).
 */
export default async function AccountPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, lastLoginAt: true, createdAt: true },
  });

  return (
    <>
      <AdminPageHeader
        title="Mon compte"
        description="Votre nom affiché et votre mot de passe."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <Panel title="Identité">
            <ProfileForm name={user?.name ?? session.name} />
          </Panel>

          <Panel title="Informations">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-earth-500">Email de connexion</dt>
                <dd className="font-medium break-all text-earth-900">
                  {user?.email ?? session.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-earth-500">Rôle</dt>
                <dd>
                  <Badge tone={user?.role === "ADMIN" ? "success" : "info"}>
                    {user?.role === "ADMIN" ? "Administrateur" : "Éditeur"}
                  </Badge>
                </dd>
              </div>
              {user?.lastLoginAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-earth-500">Dernière connexion</dt>
                  <dd className="text-earth-700">{formatDateTime(user.lastLoginAt)}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-5 border-t border-earth-200 pt-4 text-xs leading-relaxed text-earth-400">
              L&apos;email de connexion ne se modifie pas depuis cette page : il identifie le
              compte. Pour en changer, créez un nouveau compte et supprimez l&apos;ancien.
            </p>
          </Panel>
        </div>

        <Panel
          title="Mot de passe"
          description="Changez-le immédiatement si vous pensez qu'il a pu être vu par quelqu'un d'autre."
        >
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
