import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { AdminPageHeader, DataTable, TableCell, TableRow } from "@/components/admin/ui";
import { OrderStatusBadge, ORDER_STATUS_LABELS, PaymentStatusBadge } from "@/components/admin/order-status";
import { EmptyState } from "@/components/shared/empty-state";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime, formatPriceWithCurrency } from "@/lib/format";
import type { OrderStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ statut?: string }>;

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const { statut } = await searchParams;

  // Le filtre vient de l'URL : on ne le transmet à Prisma que s'il correspond
  // à un statut réel, pour ne pas propager une valeur arbitraire à la requête.
  const statusFilter = STATUSES.includes(statut as OrderStatus)
    ? (statut as OrderStatus)
    : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      include: { customer: true, _count: { select: { items: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countByStatus = new Map(counts.map((row) => [row.status, row._count]));
  const total = counts.reduce((sum, row) => sum + row._count, 0);

  return (
    <>
      <AdminPageHeader
        title="Commandes"
        description="Suivez les commandes reçues et faites évoluer leur statut."
      />

      {/* --- Filtres par statut --- */}
      <nav aria-label="Filtrer par statut" className="mb-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/commandes" active={!statusFilter} label="Toutes" count={total} />
        {STATUSES.map((status) => (
          <FilterLink
            key={status}
            href={`/admin/commandes?statut=${status}`}
            active={statusFilter === status}
            label={ORDER_STATUS_LABELS[status]}
            count={countByStatus.get(status) ?? 0}
          />
        ))}
      </nav>

      {orders.length > 0 ? (
        <DataTable
          headers={["Référence", "Client", "Date", "Articles", "Statut", "Paiement", "Total"]}
        >
          {orders.map((order) => (
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

              <TableCell align="center" className="tabular-nums">
                {order._count.items}
              </TableCell>

              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>

              <TableCell>
                <PaymentStatusBadge status={order.paymentStatus} />
              </TableCell>

              <TableCell align="right" className="font-semibold whitespace-nowrap">
                {formatPriceWithCurrency(order.total)}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          Icon={ShoppingCart}
          title={statusFilter ? "Aucune commande dans ce statut" : "Aucune commande"}
          description={
            statusFilter
              ? "Changez de filtre pour voir les autres commandes."
              : "Les commandes passées depuis le site apparaîtront ici."
          }
        />
      )}
    </>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-leaf-600 bg-leaf-600 text-cream-50"
          : "border-earth-200 bg-cream-50 text-earth-600 hover:border-earth-300",
      )}
    >
      {label}
      <span className="ml-1.5 text-xs opacity-70 tabular-nums">{count}</span>
    </Link>
  );
}
