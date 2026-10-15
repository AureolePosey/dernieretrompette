"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filtres du catalogue.
 *
 * L'état des filtres vit dans l'URL, pas dans un état React : une recherche
 * peut donc être partagée par lien, mise en favori, et le bouton « retour »
 * du navigateur fonctionne comme l'utilisateur s'y attend.
 *
 * La recherche est temporisée (300 ms) pour ne pas déclencher une requête
 * serveur à chaque frappe.
 */

type Category = { slug: string; name: string; count: number };

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("categorie") ?? "";
  const activeSearch = searchParams.get("q") ?? "";
  const inStockOnly = searchParams.get("dispo") === "1";

  const [searchValue, setSearchValue] = useState(activeSearch);

  /**
   * Resynchronisation du champ quand l'URL change par un autre chemin : retour
   * navigateur, clic sur « Réinitialiser », lien partagé.
   *
   * L'ajustement se fait PENDANT le rendu et non dans un effet. C'est le motif
   * documenté par React pour « adapter un état à un changement de prop » : il
   * évite un premier rendu avec la mauvaise valeur, suivi d'un second rendu
   * correctif — donc un scintillement visible dans le champ de recherche.
   */
  const [syncedSearch, setSyncedSearch] = useState(activeSearch);
  if (activeSearch !== syncedSearch) {
    setSyncedSearch(activeSearch);
    setSearchValue(activeSearch);
  }

  // Recherche temporisée : on ne déclenche une navigation qu'après 300 ms sans
  // frappe, au lieu d'une requête serveur par caractère saisi.
  useEffect(() => {
    if (searchValue === activeSearch) return;

    const timer = setTimeout(() => {
      updateParam("q", searchValue.trim() || null);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, activeSearch]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    // `scroll: false` : l'utilisateur filtre depuis la liste, la ramener en
    // haut de page à chaque clic lui ferait perdre sa position.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const hasActiveFilter = Boolean(activeCategory || activeSearch || inStockOnly);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-earth-400"
            aria-hidden="true"
            strokeWidth={2}
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="h-12 w-full rounded-pill border border-earth-200 bg-cream-50 pr-4 pl-11 text-earth-900 placeholder:text-earth-400 transition-colors hover:border-earth-300 focus:border-leaf-500"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-pill border border-earth-200 bg-cream-50 px-4 py-3 text-sm text-earth-700 transition-colors hover:border-earth-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => updateParam("dispo", event.target.checked ? "1" : null)}
            className="size-4 accent-leaf-600"
          />
          Disponibles seulement
        </label>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={activeCategory === ""}
            onClick={() => updateParam("categorie", null)}
          >
            Tous les produits
          </FilterChip>

          {categories.map((category) => (
            <FilterChip
              key={category.slug}
              active={activeCategory === category.slug}
              onClick={() => updateParam("categorie", category.slug)}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-60 tabular-nums">{category.count}</span>
            </FilterChip>
          ))}
        </div>
      ) : null}

      {hasActiveFilter ? (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-earth-500 transition-colors hover:text-clay-600"
        >
          <X className="size-4" aria-hidden="true" strokeWidth={2} />
          Réinitialiser les filtres
        </button>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill border px-4 py-2 text-sm font-medium transition-colors duration-200",
        active
          ? "border-leaf-600 bg-leaf-600 text-cream-50"
          : "border-earth-200 bg-cream-50 text-earth-700 hover:border-earth-300 hover:bg-cream-100",
      )}
    >
      {children}
    </button>
  );
}
