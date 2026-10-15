"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/cart";

/**
 * Vide le panier une fois la commande enregistrée.
 *
 * POURQUOI ICI ET PAS DANS LE FORMULAIRE : la Server Action se termine par un
 * `redirect()`, qui interrompt son exécution côté serveur. Elle ne renvoie donc
 * jamais d'état « succès » au composant client, et un effet placé dans le
 * formulaire ne se déclencherait pas. Le seul endroit où l'on sait avec
 * certitude que la commande existe est cette page de confirmation, qui n'est
 * atteinte qu'après une écriture réussie en base.
 *
 * Le garde `cleared` évite de rappeler `clear()` si React remonte le composant
 * (Strict Mode en développement, ou navigation arrière).
 */
export function ClearCartOnMount() {
  const { clear, ready } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!ready || cleared.current) return;
    cleared.current = true;
    clear();
  }, [ready, clear]);

  return null;
}
