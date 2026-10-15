import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ContactForm } from "@/components/shared/contact-form";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { generalWhatsappMessage, mailtoLink, telLink, whatsappLink } from "@/lib/whatsapp";
import { isTodo, site } from "@content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez La Dernière Trompette : téléphone, email, WhatsApp et formulaire de contact pour vos commandes, formations et partenariats.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | La Dernière Trompette",
    description: "Toutes les façons de joindre la coopérative.",
    url: "/contact",
  },
};

export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getSettings();

  const tel = telLink(settings.phone);
  const mail = mailtoLink(settings.email);
  const whatsappHref = whatsappLink(settings.whatsapp, generalWhatsappMessage(site.name));

  /**
   * L'adresse peut contenir PLUSIEURS implantations, séparées par des sauts de
   * ligne. On ne lui accole donc plus la ville ni le pays : ils figureraient en
   * queue du dernier site, comme s'ils ne concernaient que lui. Ces deux champs
   * restent exploités par les données structurées (voir lib/seo).
   */
  const isMultiSite = settings.address.includes("\n\n");

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Contact", href: "/contact" }])} />

      <PageHeader
        eyebrow="Nous joindre"
        title="Contact"
        description="Une question sur nos produits, une commande à passer ou une formation à suivre ? Écrivez-nous, nous répondons à chaque demande."
        breadcrumb={[{ name: "Contact", href: "/contact" }]}
      />

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* --- Coordonnées --- */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-display text-2xl text-earth-900">Nos coordonnées</h2>
              <p className="mt-2 text-sm leading-relaxed text-earth-500">
                Le plus rapide reste l&apos;appel ou le message WhatsApp.
              </p>
            </div>

            <ul className="flex flex-col gap-5">
              <ContactRow
                Icon={Phone}
                label="Téléphone"
                value={settings.phone}
                href={tel}
              />
              {settings.phoneSecondary && !isTodo(settings.phoneSecondary) ? (
                <ContactRow
                  Icon={Phone}
                  label="Second numéro"
                  value={settings.phoneSecondary}
                  href={telLink(settings.phoneSecondary)}
                />
              ) : null}
              <ContactRow Icon={Mail} label="Email" value={settings.email} href={mail} />
              <ContactRow
                Icon={MapPin}
                label={isMultiSite ? "Nos adresses" : "Adresse"}
                value={settings.address}
                multiline
              />
              {settings.hours.length > 0 && !settings.hours.every(isTodo) ? (
                <li className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-100 text-leaf-600">
                    <Clock className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-xs tracking-wider text-earth-400 uppercase">Horaires</p>
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {settings.hours.map((line) => (
                        <li key={line} className="text-sm text-earth-700">
                          {isTodo(line) ? (
                            <span className="text-earth-400 italic">À renseigner</span>
                          ) : (
                            line
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : null}
            </ul>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ size: "lg", className: "self-start" })}
              >
                <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
                Écrire sur WhatsApp
              </a>
            ) : null}

            {settings.mapEmbedUrl && !isTodo(settings.mapEmbedUrl) ? (
              <div className="overflow-hidden rounded-card border border-earth-200">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={`Localisation de ${site.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full border-0"
                />
              </div>
            ) : null}
          </div>

          {/* --- Formulaire --- */}
          <div className="rounded-card border border-earth-200 bg-cream-50 p-6 shadow-soft md:p-8">
            <h2 className="font-display text-2xl text-earth-900">Nous écrire</h2>
            <p className="mt-2 mb-7 text-sm leading-relaxed text-earth-500">
              Remplissez ce formulaire, nous vous répondons dans les meilleurs délais.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}

function ContactRow({
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

  return (
    <li className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-100 text-leaf-600">
        <Icon className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
      </span>

      <div className="min-w-0">
        <p className="text-xs tracking-wider text-earth-400 uppercase">{label}</p>
        {href && !pending ? (
          <a
            href={href}
            className="text-sm font-medium break-words text-earth-800 underline-offset-4 transition-colors hover:text-leaf-700 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p
            className={cn(
              "text-sm",
              multiline && "leading-relaxed whitespace-pre-line",
              pending ? "text-earth-400 italic" : "text-earth-800",
            )}
          >
            {pending ? "À renseigner" : value}
          </p>
        )}
      </div>
    </li>
  );
}
