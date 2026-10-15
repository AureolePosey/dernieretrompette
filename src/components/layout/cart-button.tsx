"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";

/**
 * Accès au panier avec compteur.
 *
 * Le compteur n'apparaît qu'une fois le panier relu depuis localStorage
 * (`ready`) : afficher « 0 » puis « 3 » un instant plus tard produirait un
 * saut visible et une erreur d'hydratation React.
 */
export function CartButton({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const { count, ready } = useCart();

  const label =
    ready && count > 0
      ? `Panier, ${count} article${count > 1 ? "s" : ""}`
      : "Panier, vide";

  return (
    <Link
      href="/panier"
      aria-label={label}
      className={cn(
        "relative grid size-11 place-items-center rounded-full transition-colors duration-200",
        onDark
          ? "text-cream-50 hover:bg-cream-50/15"
          : "text-earth-700 hover:bg-cream-200 hover:text-earth-900",
        className,
      )}
    >
      <ShoppingBasket className="size-5" aria-hidden="true" strokeWidth={1.75} />

      {ready && count > 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full px-1.5",
            "bg-gari-400 text-[0.6875rem] font-bold text-earth-900 tabular-nums",
            "animate-fade-in",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
