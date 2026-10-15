import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { generalWhatsappMessage, telLink, whatsappLink } from "@/lib/whatsapp";
import { site } from "@content/site";

/**
 * Appel à l'action de fin de page.
 *
 * Trois chemins possibles, dans l'ordre de l'effort demandé au visiteur :
 * commander en ligne, écrire sur WhatsApp, ou appeler. Les deux derniers ne
 * s'affichent que si le client a fourni les coordonnées correspondantes.
 */
export async function CallToAction() {
  const settings = await getSettings();
  const whatsapp = whatsappLink(settings.whatsapp, generalWhatsappMessage(site.name));
  const tel = telLink(settings.phone);

  return (
    <section className="relative overflow-hidden bg-earth-900">
      <div className="texture-grain absolute inset-0 opacity-[0.12]" aria-hidden="true" />

      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-tight text-cream-50 md:text-4xl">
            Prêt à goûter le travail de la coopérative ?
          </h2>

          <p className="mt-5 text-base leading-relaxed text-cream-200/80 md:text-lg">
            Passez commande en quelques clics, écrivez-nous, ou venez découvrir nos formations.
            Nous répondons à chaque demande.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/produits" className={buttonStyles({ variant: "accent", size: "lg" })}>
              Commander nos produits
              <ArrowRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
            </Link>

            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "onDark", size: "lg" })}
              >
                <MessageCircle className="size-4" aria-hidden="true" strokeWidth={2} />
                Écrire sur WhatsApp
              </a>
            ) : (
              <Link href="/contact" className={buttonStyles({ variant: "onDark", size: "lg" })}>
                Nous contacter
              </Link>
            )}

            {tel ? (
              <a href={tel} className={buttonStyles({ variant: "ghost", size: "lg", className: "text-cream-200 hover:bg-cream-50/10 hover:text-cream-50" })}>
                <Phone className="size-4" aria-hidden="true" strokeWidth={2} />
                {settings.phone}
              </a>
            ) : null}
          </div>

          <p className="mt-8 text-sm text-cream-200/70">
            Une question sur nos formations ?{" "}
            <Link
              href="/formations"
              className="font-semibold text-gari-300 underline underline-offset-4 transition-colors hover:text-gari-200"
            >
              Découvrir le programme
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
