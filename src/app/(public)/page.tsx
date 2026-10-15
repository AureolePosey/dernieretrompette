import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Presentation } from "@/components/home/presentation";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Missions } from "@/components/home/missions";
import { SavoirFaire } from "@/components/home/savoir-faire";
import { TrainingsPreview } from "@/components/home/trainings-preview";
import { NewsPreview } from "@/components/home/news-preview";
import { CallToAction } from "@/components/home/cta";
import { organizationJsonLd, websiteJsonLd, JsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { site } from "@content/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.metaDescription,
  alternates: { canonical: "/" },
};

/**
 * Page d'accueil.
 *
 * Revalidation toutes les heures : le contenu vient de la base mais change
 * rarement. Les visiteurs reçoivent une page statique servie depuis le CDN, et
 * une publication depuis l'administration se répercute au plus tard en une
 * heure — ou immédiatement, car les Server Actions invalident le cache.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={websiteJsonLd()} />

      <Hero />
      <Presentation />
      <FeaturedProducts />
      <Missions />
      <SavoirFaire />
      <TrainingsPreview />
      <NewsPreview />
      <CallToAction />
    </>
  );
}
