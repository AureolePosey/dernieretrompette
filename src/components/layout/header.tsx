"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { CartButton } from "@/components/layout/cart-button";
import { buttonStyles } from "@/components/ui/button";
import { mainNav } from "@content/site";
import { cn } from "@/lib/utils";

/**
 * En-tête principal.
 *
 * Deux apparences selon le contexte :
 *   - sur la page d'accueil, transparent au-dessus de la photographie du hero,
 *     puis fond crème dès que l'utilisateur défile ;
 *   - partout ailleurs, fond crème dès le départ, car il n'y a pas de visuel
 *     sombre derrière.
 *
 * Le menu mobile est un panneau plein écran : sur un petit écran, un menu
 * déroulant condensé oblige à viser, alors qu'un panneau offre des cibles
 * larges et une hiérarchie lisible.
 */

export function Header() {
  const pathname = usePathname();

  // Seule la page d'accueil ouvre sur une photographie plein écran : c'est la
  // seule où l'en-tête peut être transparent sans nuire à la lisibilité.
  const transparentOnTop = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Le menu mobile mémorise le chemin auquel il a été ouvert, plutôt qu'un
   * simple booléen refermé par un effet sur `pathname`.
   *
   * Conséquence : dès que l'utilisateur navigue, `pathname` change, l'égalité
   * devient fausse et le menu se referme DE LUI-MÊME, pendant le rendu. Plus
   * besoin d'un effet qui appelle setState après coup — donc plus de rendu en
   * cascade, et aucun risque de voir le menu rester ouvert par-dessus la page
   * suivante si l'effet est manqué.
   */
  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const menuOpen = openedAtPath === pathname;
  // `useCallback` : cette fonction figure dans les dépendances d'un effet ;
  // sans identité stable, l'effet serait relancé à chaque rendu.
  const setMenuOpen = useCallback(
    (open: boolean) => setOpenedAtPath(open ? pathname : null),
    [pathname],
  );

  useEffect(() => {
    if (!transparentOnTop) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  // Menu ouvert : on bloque le défilement du fond et on capte la touche Échap.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, setMenuOpen]);

  const solid = !transparentOnTop || scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
          solid
            ? "border-b border-earth-200/70 bg-cream-50/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
          <Logo onDark={!solid} />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-pill px-4 py-2 text-[0.9375rem] font-medium transition-colors duration-200",
                        solid
                          ? active
                            ? "text-leaf-700"
                            : "text-earth-700 hover:text-leaf-700"
                          : active
                            ? "text-cream-50"
                            : "text-cream-100/85 hover:text-cream-50",
                      )}
                    >
                      {item.label}
                      {active ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full",
                            solid ? "bg-gari-400" : "bg-gari-300",
                          )}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <CartButton onDark={!solid} />

            <Link
              href="/produits"
              className={buttonStyles({
                variant: solid ? "primary" : "onDark",
                size: "sm",
                className: "hidden lg:inline-flex",
              })}
            >
              Commander
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className={cn(
                "grid size-11 place-items-center rounded-full transition-colors duration-200 lg:hidden",
                solid
                  ? "text-earth-800 hover:bg-cream-200"
                  : "text-cream-50 hover:bg-cream-50/15",
              )}
            >
              <Menu className="size-6" aria-hidden="true" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/*
        L'en-tête est en position fixe : hors page d'accueil, cette cale réserve
        sa hauteur pour que le contenu ne démarre pas dessous.
      */}
      {transparentOnTop ? null : <div aria-hidden="true" className="h-[4.5rem] md:h-20" />}

      {/* --- Panneau mobile ------------------------------------------------ */}
      <div
        id="menu-mobile"
        hidden={!menuOpen}
        className="fixed inset-0 z-[60] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div
          className="absolute inset-0 bg-earth-900/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        <div className="animate-fade-in absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-cream-50 shadow-lift">
          <div className="flex h-[4.5rem] items-center justify-between border-b border-earth-200 px-5">
            <Logo />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="grid size-11 place-items-center rounded-full text-earth-700 transition-colors hover:bg-cream-200"
            >
              <X className="size-6" aria-hidden="true" strokeWidth={1.75} />
            </button>
          </div>

          <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="flex flex-col gap-1">
              {mainNav.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-card px-4 py-3.5 text-lg font-medium transition-colors",
                        active
                          ? "bg-leaf-50 text-leaf-700"
                          : "text-earth-800 hover:bg-cream-100",
                      )}
                    >
                      {item.label}
                      {active ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-gari-400" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-earth-200 px-5 py-5">
            <Link href="/produits" className={buttonStyles({ size: "lg", className: "w-full" })}>
              <Phone className="size-4" aria-hidden="true" />
              Commander nos produits
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
