import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { orderWhatsappMessage, telLink, whatsappLink } from "@/lib/whatsapp";
import { buttonStyles } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { formatDateTime, formatPriceWithCurrency, priceLabel } from "@/lib/format";
import { site } from "@content/site";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

/** Toujours relue en base : une confirmation mise en cache serait un non-sens. */
export const dynamic = "force-dynamic";

type Params = Promise<{ reference: string }>;

/**
 * Page de confirmation.
 *
 * La référence de commande sert de clé d'accès. Elle est difficile à deviner
 * (LDT-ANNÉE-numéro), mais restons lucides : cette page n'affiche
 * volontairement AUCUNE donnée sensible au-delà de ce que le client vient de
 * saisir — pas d'adresse complète, pas d'email, pas de téléphone. Elle ne
 * permet donc pas de moissonner un fichier clients en énumérant les numéros.
 */
export default async function OrderConfirmationPage({ params }: { params: Params }) {
  const { reference } = await params;

  const order = await prisma.order.findUnique({
    where: { reference },
    select: {
      reference: true,
      createdAt: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      status: true,
      customer: { select: { fullName: true } },
      items: {
        select: {
          id: true,
          nameSnapshot: true,
          variantSnapshot: true,
          priceSnapshot: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) notFound();

  const settings = await getSettings();

  const whatsappHref = whatsappLink(
    settings.whatsapp,
    orderWhatsappMessage(
      order.reference,
      site.name,
      order.items.map((item) => ({ name: item.nameSnapshot, quantity: item.quantity })),
    ),
  );
  const tel = telLink(settings.phone);

  const hasUnpriced = order.items.some((item) => item.priceSnapshot === null);

  return (
    <div className="container-page py-16 md:py-24">
      {/* La commande est enregistrée : le panier n'a plus lieu d'être. */}
      <ClearCartOnMount />

      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-50 text-leaf-600">
            <CheckCircle2 className="size-8" aria-hidden="true" strokeWidth={1.75} />
          </span>

          <h1 className="mt-6 font-display text-3xl leading-tight text-earth-900 md:text-4xl">
            Merci, votre commande est enregistrée
          </h1>

          <p className="mt-4 text-base leading-relaxed text-earth-500">
            Nous vous contactons rapidement pour confirmer le montant, la livraison et le
            règlement.
          </p>

          <p className="mt-6 inline-flex flex-col items-center gap-1 rounded-card border border-earth-200 bg-cream-100 px-6 py-4">
            <span className="text-xs tracking-wider text-earth-400 uppercase">
              Référence de commande
            </span>
            <span className="font-display text-xl font-semibold text-leaf-700">
              {order.reference}
            </span>
          </p>
        </div>

        {/* --- Détail --- */}
        <div className="mt-12 rounded-card border border-earth-200 bg-cream-50 p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg text-earth-900">Détail de la commande</h2>
            <time
              dateTime={order.createdAt.toISOString()}
              className="text-sm text-earth-400"
            >
              {formatDateTime(order.createdAt)}
            </time>
          </div>

          <ul className="mt-6 flex flex-col gap-4 border-b border-earth-200 pb-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0">
                  <span className="font-medium text-earth-900">{item.nameSnapshot}</span>
                  {item.variantSnapshot ? (
                    <span className="text-earth-400"> — {item.variantSnapshot}</span>
                  ) : null}
                  <span className="block text-earth-400">
                    {priceLabel(item.priceSnapshot)} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-earth-900">
                  {item.priceSnapshot === null
                    ? "Sur demande"
                    : formatPriceWithCurrency(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-earth-500">Sous-total</dt>
              <dd className="font-semibold text-earth-900">
                {formatPriceWithCurrency(order.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-earth-500">Livraison</dt>
              <dd className="text-earth-600">
                {order.deliveryFee > 0
                  ? formatPriceWithCurrency(order.deliveryFee)
                  : "À confirmer"}
              </dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-earth-200 pt-4">
              <dt className="font-display text-base text-earth-900">Total</dt>
              <dd className="font-display text-xl font-semibold text-leaf-700">
                {formatPriceWithCurrency(order.total)}
              </dd>
            </div>
          </dl>

          {hasUnpriced ? (
            <p className="mt-5 rounded-[0.625rem] border border-gari-200 bg-gari-50 px-4 py-3 text-xs leading-relaxed text-earth-700">
              Certains produits sont « sur demande » : leur montant n&apos;est pas inclus dans ce
              total et vous sera communiqué lors de la confirmation.
            </p>
          ) : null}
        </div>

        {/* --- Suite --- */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ size: "lg" })}
            >
              <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
              Confirmer sur WhatsApp
            </a>
          ) : null}

          {tel ? (
            <a href={tel} className={buttonStyles({ variant: "secondary", size: "lg" })}>
              <Phone className="size-4" aria-hidden="true" strokeWidth={2} />
              {settings.phone}
            </a>
          ) : null}

          <Link
            href="/produits"
            className={buttonStyles({ variant: "ghost", size: "lg" })}
          >
            Continuer mes achats
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-earth-400">
          Conservez la référence <strong className="text-earth-600">{order.reference}</strong> :
          elle nous permet de retrouver votre commande.
        </p>
      </div>
    </div>
  );
}
