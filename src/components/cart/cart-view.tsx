"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart";
import { Media } from "@/components/ui/media";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPriceWithCurrency, priceLabel } from "@/lib/format";
import { commerce } from "@content/site";

/**
 * Contenu du panier.
 *
 * Tant que `ready` est faux, on affiche un squelette : le panier vit dans
 * localStorage, inconnu du serveur, et annoncer « panier vide » pendant ce
 * court instant ferait croire à une perte de données.
 */
export function CartView() {
  const { items, ready, subtotal, hasUnpricedItems, setQuantity, remove } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]" aria-busy="true" aria-live="polite">
        <div className="flex flex-col gap-4">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-card border border-earth-200 bg-cream-100"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-card border border-earth-200 bg-cream-100" />
        <span className="sr-only">Chargement de votre panier…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        Icon={ShoppingBasket}
        title="Votre panier est vide"
        description="Parcourez le catalogue et ajoutez les produits qui vous intéressent."
        action={
          <Link href="/produits" className={buttonStyles({ size: "lg" })}>
            Découvrir nos produits
          </Link>
        }
      />
    );
  }

  const deliveryFee = commerce.defaultDeliveryFee;
  const total = subtotal + deliveryFee;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      {/* --- Lignes --- */}
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex gap-4 rounded-card border border-earth-200 bg-cream-50 p-4"
          >
            <Link
              href={`/produits/${item.slug}`}
              className="w-24 shrink-0 sm:w-28"
              aria-label={`Voir la fiche de ${item.name}`}
            >
              <Media
                src={item.imageUrl}
                alt={item.name}
                ratio="square"
                sizes="120px"
                className="rounded-[0.625rem]"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base text-earth-900">
                    <Link href={`/produits/${item.slug}`} className="hover:text-leaf-700">
                      {item.name}
                    </Link>
                  </h2>
                  {item.variantLabel ? (
                    <p className="mt-0.5 text-xs text-earth-400">{item.variantLabel}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold text-leaf-700">
                    {priceLabel(item.price)}
                    {item.unit ? (
                      <span className="ml-1.5 font-normal text-earth-400">{item.unit}</span>
                    ) : null}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  aria-label={`Retirer ${item.name} du panier`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-earth-400 transition-colors hover:bg-clay-100 hover:text-clay-600"
                >
                  <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <div className="flex h-10 items-center rounded-pill border border-earth-200">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Diminuer la quantité de ${item.name}`}
                    className="grid size-10 place-items-center rounded-full text-earth-600 transition-colors hover:text-earth-900 disabled:opacity-30"
                  >
                    <Minus className="size-3.5" aria-hidden="true" strokeWidth={2.25} />
                  </button>

                  <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    disabled={item.quantity >= 999}
                    aria-label={`Augmenter la quantité de ${item.name}`}
                    className="grid size-10 place-items-center rounded-full text-earth-600 transition-colors hover:text-earth-900 disabled:opacity-30"
                  >
                    <Plus className="size-3.5" aria-hidden="true" strokeWidth={2.25} />
                  </button>
                </div>

                <p className="font-display text-base font-semibold text-earth-900">
                  {item.price === null
                    ? "Sur demande"
                    : formatPriceWithCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* --- Récapitulatif --- */}
      <aside className="rounded-card border border-earth-200 bg-cream-100 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg text-earth-900">Récapitulatif</h2>

        <dl className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-earth-500">Sous-total</dt>
            <dd className="font-semibold text-earth-900">
              {formatPriceWithCurrency(subtotal)}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-earth-500">Livraison</dt>
            <dd className="text-earth-600">
              {deliveryFee > 0 ? formatPriceWithCurrency(deliveryFee) : "À confirmer"}
            </dd>
          </div>

          <div className="mt-2 flex justify-between border-t border-earth-200 pt-4">
            <dt className="font-display text-base text-earth-900">Total</dt>
            <dd className="font-display text-xl font-semibold text-leaf-700">
              {formatPriceWithCurrency(total)}
            </dd>
          </div>
        </dl>

        {hasUnpricedItems ? (
          <p className="mt-4 rounded-[0.625rem] border border-gari-200 bg-gari-50 px-3.5 py-3 text-xs leading-relaxed text-earth-700">
            Certains produits de votre panier sont « sur demande ». Leur montant n&apos;est pas
            inclus dans le total : nous vous le communiquerons à la confirmation.
          </p>
        ) : null}

        <Link
          href="/commande"
          className={buttonStyles({ size: "lg", className: "mt-6 w-full" })}
        >
          Passer la commande
        </Link>

        <Link
          href="/produits"
          className="mt-3 block text-center text-sm text-earth-500 underline underline-offset-4 transition-colors hover:text-leaf-700"
        >
          Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}
