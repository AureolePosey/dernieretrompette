import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { Logo } from "@/components/layout/logo";
import { getSettings } from "@/lib/settings";
import { mailtoLink, telLink } from "@/lib/whatsapp";
import { isTodo, legalNav, mainNav, site } from "@content/site";
import { cn } from "@/lib/utils";

/**
 * Pied de page.
 *
 * Les coordonnées non encore fournies par le client s'affichent en « à
 * renseigner » plutôt que d'être masquées : c'est un rappel visible pendant la
 * phase de recette, et il disparaît de lui-même dès que la valeur est saisie
 * dans /admin/parametres.
 */

const socialLinks = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
  { key: "tiktok", label: "TikTok", Icon: TiktokIcon },
] as const;

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  const tel = telLink(settings.phone);
  const mail = mailtoLink(settings.email);

  const activeSocial = socialLinks
    .map((entry) => ({ ...entry, url: settings.social[entry.key] }))
    .filter((entry) => entry.url && !isTodo(entry.url));

  return (
    <footer className="bg-earth-900 text-cream-200">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          {/* --- Identité --- */}
          <div className="max-w-sm">
            <Logo onDark />
            <p className="mt-6 text-sm leading-relaxed text-cream-200/75">
              {settings.shortDescription}
            </p>

            {activeSocial.length > 0 ? (
              <ul className="mt-7 flex gap-2">
                {activeSocial.map(({ key, label, Icon, url }) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} sur ${label}`}
                      className="grid size-10 place-items-center rounded-full border border-cream-200/20 text-cream-200/80 transition-colors duration-200 hover:border-gari-300 hover:text-gari-300"
                    >
                      <Icon className="size-[17px]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* --- Navigation --- */}
          <nav aria-label="Navigation du pied de page">
            <h2 className="font-display text-sm font-semibold tracking-[0.14em] text-gari-300 uppercase">
              Le site
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-200/80 transition-colors duration-200 hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Contact --- */}
          <div>
            <h2 className="font-display text-sm font-semibold tracking-[0.14em] text-gari-300 uppercase">
              Nous joindre
            </h2>

            <ul className="mt-5 flex flex-col gap-4 text-sm">
              <FooterContact
                Icon={Phone}
                label="Téléphone"
                value={settings.phone}
                href={tel}
              />
              {settings.phoneSecondary && !isTodo(settings.phoneSecondary) ? (
                <FooterContact
                  Icon={Phone}
                  label="Second numéro"
                  value={settings.phoneSecondary}
                  href={telLink(settings.phoneSecondary)}
                />
              ) : null}
              <FooterContact Icon={Mail} label="Email" value={settings.email} href={mail} />
              <FooterContact
                Icon={MapPin}
                label={settings.address.includes("\n\n") ? "Adresses" : "Adresse"}
                value={settings.address}
                multiline
              />
            </ul>
          </div>
        </div>
      </div>

      {/* --- Barre légale --- */}
      <div className="border-t border-cream-200/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-cream-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {isTodo(settings.legalName) ? site.name : settings.legalName}. Tous droits
            réservés.
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-cream-100">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="transition-colors hover:text-cream-100">
                Administration
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterContact({
  Icon,
  label,
  value,
  href,
  multiline = false,
}: {
  Icon: typeof Phone;
  label: string;
  value: string;
  href?: string | null;
  /** Conserve les sauts de ligne : utilisé pour les adresses multi-sites. */
  multiline?: boolean;
}) {
  const pending = isTodo(value);

  const content = (
    <span
      className={cn(
        multiline && "leading-relaxed whitespace-pre-line",
        pending ? "text-cream-200/70 italic" : "text-cream-200/85",
      )}
    >
      {pending ? "À renseigner" : value}
    </span>
  );

  return (
    <li className="flex gap-3">
      <Icon
        className="mt-0.5 size-[18px] shrink-0 text-gari-300/70"
        aria-hidden="true"
        strokeWidth={1.75}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.6875rem] tracking-wider text-cream-200/70 uppercase">
          {label}
        </span>
        {href && !pending ? (
          <a href={href} className="transition-colors hover:text-gari-300">
            {content}
          </a>
        ) : (
          content
        )}
      </span>
    </li>
  );
}
