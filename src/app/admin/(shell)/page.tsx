import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Newspaper,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { AdminPageHeader, DataTable, Panel, StatCard, TableCell, TableRow } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/admin/order-status";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatPriceWithCurrency } from "@/lib/format";
import { hasCloudinary, hasMailer, isProduction } from "@/lib/env";
import { isTodo } from "@content/site";

export const metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

/**
 * Tableau de bord.
 *
 * Conçu autour d'une question : « qu'est-ce qui demande mon attention ? ».
 * D'où les alertes de configuration en tête — un site dont le téléphone ou le
 * stockage d'images n'est pas configuré ne remplit pas son rôle, et cela doit
 * se voir dès la connexion, pas se découvrir à la première commande perdue.
 */
export default async function AdminDashboard() {
  await requireAuth();

  const [
    settings,
    newOrders,
    totalOrders,
    unreadMessages,
    productCount,
    draftProducts,
    newsCount,
    trainingCount,
    recentOrders,
  ] = await Promise.all([
    getSettings(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count(),
    prisma.contactMessage.count({ where: { read: false, archived: false } }),
    prisma.product.count(),
    prisma.product.count({ where: { published: false } }),
    prisma.news.count({ where: { published: true } }),
    prisma.training.count({ where: { published: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        createdAt: true,
        status: true,
        total: true,
        customer: { select: { fullName: true, phone: true } },
      },
    }),
  ]);

  // --- Points de configuration manquants ---------------------------------
  const warnings: string[] = [];

  if (isTodo(settings.phone)) warnings.push("Le numéro de téléphone n'est pas renseigné.");
  if (isTodo(settings.whatsapp))
    warnings.push("Le numéro WhatsApp n'est pas renseigné : les boutons WhatsApp sont masqués.");
  if (isTodo(settings.email)) warnings.push("L'adresse email de contact n'est pas renseignée.");
  if (isTodo(settings.address)) warnings.push("L'adresse de la coopérative n'est pas renseignée.");
  if (productCount === 0) warnings.push("Aucun produit n'a encore été créé.");
  if (isProduction && !hasCloudinary)
    warnings.push(
      "Aucun stockage d'images n'est configuré : l'envoi de photos échouera en production.",
    );
  if (!hasMailer)
    warnings.push(
      "Les notifications par email sont désactivées. Les commandes restent visibles ici.",
    );

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité du site et des points à compléter."
      />

      {warnings.length > 0 ? (
        <section className="mb-8 rounded-card border border-gari-200 bg-gari-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-base text-earth-900">
            <TriangleAlert className="size-4.5 text-gari-600" aria-hidden="true" strokeWidth={2} />
            À compléter ({warnings.length})
          </h2>

          <ul className="mt-3 flex flex-col gap-2">
            {warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-sm leading-relaxed text-earth-700">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gari-500" />
                {warning}
              </li>
            ))}
          </ul>

          <Link
            href="/admin/parametres"
            className="mt-4 inline-block text-sm font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
          >
            Ouvrir les paramètres
          </Link>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Commandes à traiter"
          value={newOrders}
          Icon={ShoppingCart}
          href="/admin/commandes?statut=NEW"
          tone={newOrders > 0 ? "accent" : "neutral"}
        />
        <StatCard
          label="Messages non lus"
          value={unreadMessages}
          Icon={Mail}
          href="/admin/messages"
          tone={unreadMessages > 0 ? "accent" : "neutral"}
        />
        <StatCard
          label={draftProducts > 0 ? `Produits (${draftProducts} brouillon)` : "Produits"}
          value={productCount}
          Icon={Package}
          href="/admin/produits"
        />
        <StatCard
          label="Commandes au total"
          value={totalOrders}
          Icon={ShoppingCart}
          href="/admin/commandes"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Actualités publiées"
          value={newsCount}
          Icon={Newspaper}
          href="/admin/actualites"
        />
        <StatCard
          label="Formations publiées"
          value={trainingCount}
          Icon={GraduationCap}
          href="/admin/formations"
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg text-earth-900">Dernières commandes</h2>
          <Link
            href="/admin/commandes"
            className="text-sm font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
          >
            Tout voir
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <DataTable headers={["Référence", "Client", "Date", "Statut", "Total"]}>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="font-semibold text-leaf-700 hover:underline"
                  >
                    {order.reference}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="block font-medium text-earth-900">
                    {order.customer.fullName}
                  </span>
                  <span className="text-xs text-earth-400">{order.customer.phone}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-earth-500">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell align="right" className="font-semibold whitespace-nowrap">
                  {formatPriceWithCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <Panel>
            <p className="py-6 text-center text-sm text-earth-400">
              Aucune commande pour le moment.
            </p>
          </Panel>
        )}
      </section>
    </>
  );
}
