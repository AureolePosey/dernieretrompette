"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

/**
 * Panier.
 *
 * Stocké côté client (localStorage), pas en base : un visiteur n'a pas de
 * compte, créer une session serveur pour lui n'apporterait rien et coûterait
 * une écriture à chaque ajout. Les prix affichés sont indicatifs ; ils sont
 * systématiquement RECALCULÉS côté serveur au moment de la commande à partir
 * de la base, afin qu'un panier falsifié dans le navigateur ne puisse pas
 * imposer son propre montant.
 */

const STORAGE_KEY = "ldt.cart.v1";
const MAX_QUANTITY = 999;

export type CartItem = {
  /** Identifiant de ligne : produit + variante, car un même produit peut être
   *  commandé en plusieurs formats dans le même panier. */
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  /** `null` = prix sur demande : la ligne ne participe pas au total. */
  price: number | null;
  unit: string | null;
  imageUrl: string | null;
  quantity: number;
};

export type AddToCartInput = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

/**
 * `hydrated` fait partie de l'état du réducteur, et non d'un `useState` séparé.
 *
 * Raison : le transmettre par `dispatch` évite d'appeler `setState` depuis un
 * effet, ce qui provoquerait un rendu en cascade. Un seul dispatch porte donc à
 * la fois les articles restaurés et le drapeau qui autorise la sauvegarde.
 */
type State = { items: CartItem[]; hydrated: boolean };

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: AddToCartInput }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function lineKey(productId: string, variantId: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value)));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };

    case "add": {
      const key = lineKey(action.item.productId, action.item.variantId);
      const quantity = clampQuantity(action.item.quantity ?? 1);
      const existing = state.items.find((item) => item.key === key);

      if (existing) {
        return {
        ...state,
        items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
              : item,
          ),
        };
      }

      return { ...state, items: [...state.items, { ...action.item, key, quantity }] };
    }

    case "setQuantity":
      return {
        ...state,
        items: state.items.map((item) =>
          item.key === action.key ? { ...item, quantity: clampQuantity(action.quantity) } : item,
        ),
      };

    case "remove":
      return { ...state, items: state.items.filter((item) => item.key !== action.key) };

    case "clear":
      return { ...state, items: [] };
  }
}

/** Relit le panier sauvegardé en se méfiant de son contenu : localStorage est
 *  modifiable par l'utilisateur et survit aux mises à jour du site. */
function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.key === "string" &&
        typeof candidate.productId === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.slug === "string" &&
        typeof candidate.quantity === "number"
      );
    });
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  /** `false` tant que le panier sauvegardé n'a pas été relu : évite d'afficher
   *  un panier vide au premier rendu puis de le voir sauter. */
  ready: boolean;
  count: number;
  subtotal: number;
  /** Vrai si au moins une ligne est sans prix public. */
  hasUnpricedItems: boolean;
  add: (item: AddToCartInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Compteur incrémenté à chaque ajout : sert à déclencher un retour visuel. */
  lastAddedAt: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const [lastAddedAt, setLastAddedAt] = useState(0);

  // Hydratation : le rendu serveur ne connaît pas localStorage, on ne peut donc
  // lire le panier qu'après le montage, sous peine d'erreur d'hydratation.
  // Un unique dispatch pose les articles ET le drapeau `hydrated`.
  useEffect(() => {
    dispatch({ type: "hydrate", items: readStorage() });
  }, []);

  // La sauvegarde n'a lieu qu'APRÈS hydratation.
  //
  // Le garde porte sur `state.hydrated`, pas sur une ref : une ref positionnée
  // dans l'effet d'hydratation serait déjà à `true` lorsque cet effet-ci
  // s'exécute au même montage, alors que `state.items` vaut encore []. Le
  // panier restauré serait alors immédiatement écrasé par un tableau vide —
  // autrement dit vidé à chaque changement de page.
  //
  // Le drapeau vivant dans l'état du réducteur, il ne devient vrai qu'au rendu
  // suivant, celui qui porte enfin les articles restaurés.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Mode navigation privée ou quota dépassé : le panier reste utilisable
      // pour la session en cours, il ne sera simplement pas persisté.
    }
  }, [state.items, state.hydrated]);

  const add = useCallback((item: AddToCartInput) => {
    dispatch({ type: "add", item });
    setLastAddedAt(Date.now());
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "setQuantity", key, quantity });
  }, []);

  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    );

    return {
      items: state.items,
      ready: state.hydrated,
      count,
      subtotal,
      hasUnpricedItems: state.items.some((item) => item.price === null),
      add,
      setQuantity,
      remove,
      clear,
      lastAddedAt,
    };
  }, [state.items, state.hydrated, add, setQuantity, remove, clear, lastAddedAt]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>.");
  }
  return context;
}
