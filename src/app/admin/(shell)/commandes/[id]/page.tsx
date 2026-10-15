import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { OrderForm } from "@/components/admin/order-form";
import {
  OrderStatusBadge,
  PAYMENT_METHOD_LABELS,
  PaymentStatusBadge,
} from "@/components/admin/order-status";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderWhatsappMessage, telLink, whatsappLink } from "@/lib/whatsapp";
import { formatDateTime, formatPriceWithCurrency, priceLabel } from "@/lib/format";
import { site } from "@content/site";

export const metadata = { title: "Détail de la commande" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!order) notFound();

  // Contacter le client sur SON numéro, pas celui de la coopérative.
  const clientWhatsapp = whatsappLink(
    order.customer.phone,
    orderWhatsappMessage(
      order.reference,
      site.name,
      order.items.map((item) => ({ name: item.nameSnapshot, quantity: item.quantity })),
    ),
  );
  const clientTel = telLink(order.customer.phone);

  return (
    <>
      <Link
        href="/admin/commandes"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-earth-500 transition-colors hover:text-leaf-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={2} />
        Toutes les commandes
      </Link>

      <AdminPageHeader
        title={order.reference}
        description={`Reçue le ${formatDateTime(order.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="flex flex-col gap-6">
          {/* --- Articles --- */}
          <Panel title="Articles commandés">
            <ul className="flex flex-col divide-y divide-earth-200">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-earth-900">{item.nameSnapshot}</p>
                    {item.variantSnapshot ? (
                      <p className="text-xs text-earth-400">{item.variantSnapshot}</p>
                    ) : null}
                    <p className="mt-0.5 text-sm text-earth-500">
                      {priceLabel(item.priceSnapshot)} × {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-earth-900">
                    {item.priceSnapshot === null
                      ? "Sur demande"
                      : formatPriceWithCurrency(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-2 border-t border-earth-200 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-earth-500">Sous-total</dt>
                <dd className="font-medium">{formatPriceWithCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-earth-500">Livraison</dt>
                <dd className="font-medium">
                  {order.deliveryFee > 0
                    ? formatPriceWithCurrency(order.deliveryFee)
                    : "À confirmer"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-earth-200 pt-3">
                <dt className="font-display text-base text-earth-900">Total</dt>
                <dd className="font-display text-lg font-semibold text-leaf-700">
                  {formatPriceWithCurrency(order.total)}
                </dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-earth-500">Moyen de paiement</dt>
                <dd className="text-earth-700">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </dd>
              </div>
            </dl>
          </Panel>

          {/* --- Client --- */}
          <Panel title="Client">
            <dl className="flex flex-col gap-4 text-sm">
              <InfoRow Icon={User} label="Nom" value={order.customer.fullName} />
              <InfoRow
                Icon={Phone}
                label="Téléphone"
                value={order.customer.phone}
                href={clientTel}
              />
              {order.customer.email ? (
                <InfoRow
                  Icon={Mail}
                  label="Email"
                  value={order.customer.email}
                  href={`mailto:${order.customer.email}`}
                />
              ) : null}
              <InfoRow
                Icon={MapPin}
                label="Livraison"
                value={[order.customer.address, order.customer.city].filter(Boolean).join(" — ")}
              />
            </dl>

            {clientWhatsapp ? (
              <a
                href={clientWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-pill bg-leaf-600 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-leaf-700"
              >
                <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
                Contacter le client sur WhatsApp
              </a>
            ) : null}

            {order.customerNote ? (
              <div className="mt-5 rounded-card border border-earth-200 bg-cream-100 p-4">
                <p className="text-xs font-semibold tracking-wider text-earth-400 uppercase">
                  Message du client
                </p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-earth-700">
                  {order.customerNote}
                </p>
              </div>
            ) : null}
          </Panel>
        </div>

        {/* --- Suivi --- */}
        <Panel title="Suivi de la commande" className="lg:sticky lg:top-6">
          <OrderForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            adminNote={order.adminNote}
          />
        </Panel>
      </div>
    </>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof User;
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-earth-400"
        aria-hidden="true"
        strokeWidth={1.75}
      />
      <div className="min-w-0">
        <dt className="text-xs tracking-wider text-earth-400 uppercase">{label}</dt>
        <dd className="mt-0.5 break-words text-earth-800">
          {href ? (
            <a href={href} className="underline-offset-4 hover:text-leaf-700 hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}
