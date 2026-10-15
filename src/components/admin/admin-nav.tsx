"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { logout } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Navigation de l'administration.
 *
 * Même composant pour la barre latérale (à partir de lg) et le tiroir mobile :
 * un seul endroit à modifier pour ajouter une rubrique, et aucun risque que
 * les deux versions divergent.
 */

const NAV_SECTIONS = [
  {
    label: "Pilotage",
    items: [{ href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Boutique",
    items: [
      { href: "/admin/commandes", label: "Commandes", Icon: ShoppingCart, exact: false },
      { href: "/admin/produits", label: "Produits", Icon: Package, exact: false },
      { href: "/admin/categories", label: "Catégories", Icon: FolderTree, exact: false },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/actualites", label: "Actualités", Icon: Newspaper, exact: false },
      { href: "/admin/formations", label: "Formations", Icon: GraduationCap, exact: false },
      { href: "/admin/messages", label: "Messages", Icon: Mail, exact: false },
    ],
  },
  {
    label: "Configuration",
    items: [{ href: "/admin/parametres", label: "Paramètres", Icon: Settings, exact: false }],
  },
] as const;

export function AdminNav({
  userName,
  userRole,
  pendingCounts,
}: {
  userName: string;
  userRole: string;
  /** Pastilles de notification : commandes nouvelles, messages non lus. */
  pendingCounts: { orders: number; messages: number };
}) {
  const pathname = usePathname();

  /**
   * Même principe que l'en-tête public : le tiroir mémorise le chemin auquel il
   * a été ouvert. Une navigation change `pathname`, donc le referme pendant le
   * rendu — sans effet, sans setState différé, sans rendu en cascade.
   */
  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const open = openedAtPath === pathname;
  // `useCallback` : identité stable, exigée par les dépendances de l'effet ci-dessous.
  const setOpen = useCallback(
    (value: boolean) => setOpenedAtPath(value ? pathname : null),
    [pathname],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const badgeFor = (href: string) => {
    if (href === "/admin/commandes") return pendingCounts.orders;
    if (href === "/admin/messages") return pendingCounts.messages;
    return 0;
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-cream-200/10 px-5">
        {/* Pastille claire : les mains du logo sont au trait sombre et
            disparaîtraient sur la barre latérale foncée. */}
        <span className="grid h-10 w-9 shrink-0 place-items-center rounded-lg bg-cream-50">
          <Image src="/images/logo-mark.png" alt="" width={206} height={291} className="h-8 w-auto object-contain" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-sm font-semibold text-cream-50">
            La Dernière Trompette
          </span>
          <span className="text-[0.625rem] tracking-wider text-cream-200/70 uppercase">
            Administration
          </span>
        </span>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
          className="ml-auto grid size-9 place-items-center rounded-full text-cream-200/70 transition-colors hover:bg-cream-50/10 hover:text-cream-50 lg:hidden"
        >
          <X className="size-5" aria-hidden="true" strokeWidth={1.75} />
        </button>
      </div>

      <nav aria-label="Navigation de l'administration" className="flex-1 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6 last:mb-0">
            <h2 className="px-3 pb-2 text-[0.625rem] font-semibold tracking-[0.14em] text-cream-200/70 uppercase">
              {section.label}
            </h2>

            <ul className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                const badge = badgeFor(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[0.625rem] px-3 py-2.5 text-sm transition-colors duration-200",
                        active
                          ? "bg-cream-50/12 font-semibold text-cream-50"
                          : "text-cream-200/70 hover:bg-cream-50/6 hover:text-cream-50",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden="true" strokeWidth={1.75} />
                      <span className="flex-1 truncate">{label}</span>

                      {badge > 0 ? (
                        <span
                          className="grid min-w-5 place-items-center rounded-full bg-gari-400 px-1.5 text-[0.6875rem] font-bold text-earth-900 tabular-nums"
                          aria-label={`${badge} en attente`}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-cream-200/10 p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[0.625rem] px-3 py-2.5 text-sm text-cream-200/70 transition-colors hover:bg-cream-50/6 hover:text-cream-50"
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden="true" strokeWidth={1.75} />
          Voir le site
        </Link>

        <div className="mt-2 flex items-center gap-3 rounded-[0.625rem] px-3 py-2.5">
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-cream-50">{userName}</span>
            <span className="text-[0.6875rem] text-cream-200/70">
              {userRole === "ADMIN" ? "Administrateur" : "Éditeur"}
            </span>
          </span>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="grid size-9 place-items-center rounded-full text-cream-200/70 transition-colors hover:bg-clay-500/25 hover:text-cream-50"
            >
              <LogOut className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- Barre supérieure mobile --- */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-earth-200 bg-cream-50 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu d'administration"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-full text-earth-700 transition-colors hover:bg-cream-200"
        >
          <Menu className="size-5" aria-hidden="true" strokeWidth={1.75} />
        </button>
        <span className="font-display text-sm font-semibold text-earth-900">Administration</span>
      </div>

      {/* --- Barre latérale (desktop) --- */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-earth-900 lg:block">{content}</aside>

      {/* --- Tiroir (mobile) --- */}
      <div
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu d'administration"
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="absolute inset-0 bg-earth-900/60" onClick={() => setOpen(false)} />
        <div className="animate-fade-in absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-earth-900 shadow-lift">
          {content}
        </div>
      </div>
    </>
  );
}
