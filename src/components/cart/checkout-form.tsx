"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/cart";
import { createOrder, type CheckoutState } from "@/server/actions/orders";
import { Field, fieldAria, Honeypot, Input, Select, Textarea } from "@/components/ui/field";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPriceWithCurrency, priceLabel } from "@/lib/format";
import { commerce } from "@content/site";

/**
 * Tunnel de commande.
 *
 * Les lignes du panier partent dans un champ caché au format JSON. Elles ne
 * contiennent QUE des identifiants et des quantités : la Server Action relit
 * tous les prix en base, si bien qu'une altération du panier côté navigateur
 * reste sans effet sur le montant enregistré.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { items, ready, subtotal, hasUnpricedItems, clear } = useCart();

  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(createOrder, {
    status: "idle",
  });

  // La commande a été créée : on vide le panier. La redirection vers la page
  // de confirmation est déclenchée côté serveur par l'action elle-même.
  useEffect(() => {
    if (state.status === "success") clear();
  }, [state.status, clear]);

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-card bg-cream-100" aria-busy="true" />;
  }

  if (items.length === 0 && state.status !== "success") {
    return (
      <EmptyState
        Icon={ShoppingBasket}
        title="Votre panier est vide"
        description="Ajoutez au moins un produit avant de passer commande."
        action={
          <Link href="/produits" className={buttonStyles({ size: "lg" })}>
            Voir les produits
          </Link>
        }
      />
    );
  }

  const enabledMethods = commerce.paymentMethods.filter((method) => method.enabled);
  const deliveryFee = commerce.defaultDeliveryFee;
  const total = subtotal + deliveryFee;

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      {/* Panier sérialisé : identifiants et quantités uniquement. */}
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? "",
            quantity: item.quantity,
          })),
        )}
      />
      <Honeypot />

      <div className="flex flex-col gap-8">
        {state.status === "error" && state.message ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3.5"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0 text-clay-600"
              aria-hidden="true"
              strokeWidth={2}
            />
            <p className="text-sm leading-relaxed text-clay-600">{state.message}</p>
          </div>
        ) : null}

        {/* --- Coordonnées --- */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-1 font-display text-xl text-earth-900">Vos coordonnées</legend>

          <Field id="fullName" label="Nom complet" required error={fieldError("fullName")}>
            <Input
              {...fieldAria("fullName", { error: fieldError("fullName") })}
              name="fullName"
              autoComplete="name"
              required
              hasError={Boolean(fieldError("fullName"))}
              placeholder="Votre nom et prénom"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="phone"
              label="Téléphone"
              required
              hint="Nous vous appelons pour confirmer la commande."
              error={fieldError("phone")}
            >
              <Input
                {...fieldAria("phone", { error: fieldError("phone"), hasHint: true })}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                hasError={Boolean(fieldError("phone"))}
              />
            </Field>

            <Field id="email" label="Email" hint="Facultatif" error={fieldError("email")}>
              <Input
                {...fieldAria("email", { error: fieldError("email"), hasHint: true })}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                hasError={Boolean(fieldError("email"))}
              />
            </Field>
          </div>
        </fieldset>

        {/* --- Livraison --- */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-1 font-display text-xl text-earth-900">Livraison</legend>

          <Field
            id="address"
            label="Adresse de livraison"
            required
            hint="Quartier, rue, point de repère — tout ce qui aide à vous trouver."
            error={fieldError("address")}
          >
            <Textarea
              {...fieldAria("address", { error: fieldError("address"), hasHint: true })}
              name="address"
              rows={3}
              autoComplete="street-address"
              required
              hasError={Boolean(fieldError("address"))}
            />
          </Field>

          <Field id="city" label="Ville / localité" error={fieldError("city")}>
            <Input
              {...fieldAria("city", { error: fieldError("city") })}
              name="city"
              autoComplete="address-level2"
              hasError={Boolean(fieldError("city"))}
            />
          </Field>
        </fieldset>

        {/* --- Paiement --- */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-1 font-display text-xl text-earth-900">Paiement</legend>

          <Field
            id="paymentMethod"
            label="Moyen de paiement"
            required
            error={fieldError("paymentMethod")}
          >
            <Select
              {...fieldAria("paymentMethod", { error: fieldError("paymentMethod") })}
              name="paymentMethod"
              required
              defaultValue={enabledMethods[0]?.value}
              hasError={Boolean(fieldError("paymentMethod"))}
            >
              {enabledMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </Select>
          </Field>

          <p className="rounded-card border border-earth-200 bg-cream-100 px-4 py-3 text-sm leading-relaxed text-earth-600">
            Le paiement en ligne n&apos;est pas encore activé. Votre commande est enregistrée,
            puis nous vous contactons pour confirmer le montant, la livraison et le règlement.
          </p>

          <Field
            id="customerNote"
            label="Message (facultatif)"
            hint="Précisions sur votre commande, horaires de livraison…"
            error={fieldError("customerNote")}
          >
            <Textarea
              {...fieldAria("customerNote", { error: fieldError("customerNote"), hasHint: true })}
              name="customerNote"
              rows={4}
              hasError={Boolean(fieldError("customerNote"))}
            />
          </Field>
        </fieldset>
      </div>

      {/* --- Récapitulatif --- */}
      <aside className="rounded-card border border-earth-200 bg-cream-100 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg text-earth-900">Votre commande</h2>

        <ul className="mt-5 flex flex-col gap-3 border-b border-earth-200 pb-5">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 text-earth-600">
                <span className="font-medium text-earth-900">{item.name}</span>
                {item.variantLabel ? (
                  <span className="text-earth-400"> — {item.variantLabel}</span>
                ) : null}
                <span className="text-earth-400"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold text-earth-900">
                {item.price === null
                  ? priceLabel(null)
                  : formatPriceWithCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-earth-500">Sous-total</dt>
            <dd className="font-semibold text-earth-900">{formatPriceWithCurrency(subtotal)}</dd>
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
            Le montant des produits « sur demande » vous sera communiqué à la confirmation.
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="mt-6 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            "Confirmer ma commande"
          )}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/panier")}
          className="mt-3 w-full text-center text-sm text-earth-500 underline underline-offset-4 transition-colors hover:text-leaf-700"
        >
          Modifier mon panier
        </button>
      </aside>
    </form>
  );
}
