"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, MessageCircle, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/cart";
import { Button, buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { priceLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Bloc d'achat d'une fiche produit : format, quantité, ajout au panier.
 *
 * Le prix affiché suit le format sélectionné. Une variante sans prix propre
 * hérite de celui du produit : c'est le cas le plus fréquent (même prix au kg,
 * conditionnements différents) et cela évite de ressaisir la même valeur.
 */

type Variant = {
  id: string;
  label: string;
  price: number | null;
  inStock: boolean;
};

export function ProductPurchase({
  productId,
  slug,
  name,
  basePrice,
  unit,
  inStock,
  imageUrl,
  variants,
  whatsappHref,
}: {
  productId: string;
  slug: string;
  name: string;
  basePrice: number | null;
  unit: string | null;
  inStock: boolean;
  imageUrl: string | null;
  variants: Variant[];
  whatsappHref: string | null;
}) {
  const { add } = useCart();

  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((variant) => variant.id === variantId) ?? null;
  const effectivePrice = selectedVariant?.price ?? basePrice;
  const available = inStock && (selectedVariant ? selectedVariant.inStock : true);

  // Confirmation temporaire après ajout, remise à zéro si l'utilisateur
  // change de format ou de quantité entre-temps.
  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function handleAdd() {
    add({
      productId,
      variantId,
      slug,
      name,
      variantLabel: selectedVariant?.label ?? null,
      price: effectivePrice,
      unit,
      imageUrl,
    });
    setJustAdded(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Prix --- */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-3xl font-semibold text-leaf-700">
          {priceLabel(effectivePrice)}
        </p>
        {unit ? <span className="text-sm text-earth-400">{unit}</span> : null}

        {available ? (
          <Badge tone="success" className="ml-auto">
            Disponible
          </Badge>
        ) : (
          <Badge tone="danger" className="ml-auto">
            Rupture temporaire
          </Badge>
        )}
      </div>

      {/* --- Formats --- */}
      {variants.length > 0 ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-earth-700">
            Format disponible
          </legend>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const selected = variant.id === variantId;

              return (
                <label
                  key={variant.id}
                  className={cn(
                    "cursor-pointer rounded-card border px-4 py-3 text-sm font-medium transition-colors duration-200",
                    selected
                      ? "border-leaf-600 bg-leaf-50 text-leaf-700"
                      : "border-earth-200 bg-cream-50 text-earth-700 hover:border-earth-300",
                    !variant.inStock && "opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={variant.id}
                    checked={selected}
                    onChange={() => {
                      setVariantId(variant.id);
                      setJustAdded(false);
                    }}
                    className="sr-only"
                  />
                  {variant.label}
                  {!variant.inStock ? (
                    <span className="ml-2 text-xs text-clay-600">épuisé</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* --- Quantité + ajout --- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 w-fit items-center rounded-pill border border-earth-200 bg-cream-50">
          <button
            type="button"
            onClick={() => {
              setQuantity((value) => Math.max(1, value - 1));
              setJustAdded(false);
            }}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
            className="grid size-12 place-items-center rounded-full text-earth-600 transition-colors hover:text-earth-900 disabled:opacity-30"
          >
            <Minus className="size-4" aria-hidden="true" strokeWidth={2.25} />
          </button>

          <span
            aria-live="polite"
            aria-label={`Quantité : ${quantity}`}
            className="min-w-8 text-center font-semibold tabular-nums text-earth-900"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => {
              setQuantity((value) => Math.min(999, value + 1));
              setJustAdded(false);
            }}
            disabled={quantity >= 999}
            aria-label="Augmenter la quantité"
            className="grid size-12 place-items-center rounded-full text-earth-600 transition-colors hover:text-earth-900 disabled:opacity-30"
          >
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
          </button>
        </div>

        <Button
          size="lg"
          variant={justAdded ? "secondary" : "primary"}
          onClick={handleAdd}
          disabled={!available}
          className="flex-1"
        >
          {justAdded ? (
            <>
              <Check className="size-4" aria-hidden="true" strokeWidth={2.5} />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingBasket className="size-4" aria-hidden="true" strokeWidth={2} />
              Ajouter au panier
            </>
          )}
        </Button>
      </div>

      {justAdded ? (
        <p role="status" className="-mt-2 text-sm text-earth-500">
          <Link
            href="/panier"
            className="font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
          >
            Voir mon panier
          </Link>{" "}
          ou continuer à parcourir le catalogue.
        </p>
      ) : null}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
          Commander via WhatsApp
        </a>
      ) : null}

      {effectivePrice === null ? (
        <p className="rounded-card border border-gari-200 bg-gari-50 px-4 py-3 text-sm leading-relaxed text-earth-700">
          Le prix de ce produit n&apos;est pas encore publié. Ajoutez-le au panier ou
          contactez-nous : nous vous communiquerons le tarif et les disponibilités.
        </p>
      ) : null}
    </div>
  );
}
