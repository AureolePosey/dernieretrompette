import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo de la coopérative.
 *
 * LE POINT DÉLICAT : dans le logo fourni, les mains sont dessinées au trait
 * fin sombre. Posées telles quelles sur les fonds vert nuit du site, elles
 * deviennent invisibles — seuls les personnages colorés subsistent.
 *
 * Plutôt que de retoucher l'identité du client, on pose l'emblème sur une
 * pastille crème dès que le fond est sombre. L'artwork reste exactement celui
 * de la coopérative, et il est lisible partout.
 *
 * Le bloc de texte d'origine (« Société coopérative des transformateurs… »)
 * n'est pas repris ici : à la hauteur d'un en-tête, il serait illisible. Le nom
 * est donc composé en typographie, ce qui le rend net à toutes les tailles,
 * sélectionnable et exploitable par les moteurs de recherche. Le logo complet
 * reste disponible dans `public/images/logo.png` pour les documents imprimés.
 */

/** Emblème seul : mains et personnages, fond transparent. */
const MARK = "/images/logo-mark.png";

export function Logo({
  onDark = false,
  className,
  withText = true,
}: {
  onDark?: boolean;
  className?: string;
  withText?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="La Dernière Trompette — retour à l'accueil"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      {/*
        L'emblème est en format PORTRAIT (206 × 291). On le contraint donc par
        la HAUTEUR : contraint par la largeur, il déborderait du cadre et se
        ferait rogner en bas — les mains disparaîtraient.
      */}
      <span
        className={cn(
          "grid h-12 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-200",
          // Pastille claire sur fond sombre, sinon l'emblème se perd.
          onDark ? "bg-cream-50 group-hover:bg-white" : "bg-transparent",
        )}
      >
        <Image
          src={MARK}
          alt=""
          width={206}
          height={291}
          // Visible dès le premier écran : pas de chargement différé.
          priority
          className={cn("w-auto object-contain", onDark ? "h-10" : "h-11")}
        />
      </span>

      {withText ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.0625rem] font-semibold tracking-tight",
              onDark ? "text-cream-50" : "text-earth-900",
            )}
          >
            La Dernière Trompette
          </span>
          <span
            className={cn(
              "mt-1 text-[0.625rem] font-medium tracking-[0.16em] uppercase",
              onDark ? "text-cream-200/70" : "text-earth-400",
            )}
          >
            Coopérative agricole
          </span>
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Logo complet (emblème + bloc de texte d'origine), pour les grands formats :
 * page « À propos », documents, partage. À réserver aux zones où il dispose
 * d'au moins 200 px de large, sous peine d'illisibilité.
 */
export function LogoFull({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block overflow-hidden rounded-card",
        onDark ? "bg-cream-50 p-4" : "",
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt="Société coopérative des transformateurs du manioc et ses dérivés — La Dernière Trompette"
        width={469}
        height={408}
        className="h-auto w-full object-contain"
      />
    </span>
  );
}
