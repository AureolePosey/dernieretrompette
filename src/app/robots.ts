import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Directives d'exploration.
 *
 * Les zones interdites ne sont PAS une mesure de sécurité — robots.txt est
 * public et n'empêche personne d'ouvrir une URL. C'est une mesure d'hygiène de
 * référencement : on évite que les moteurs gaspillent leur budget
 * d'exploration sur des pages sans valeur ou propres à un visiteur.
 * La vraie protection de /admin est assurée par le proxy et l'authentification.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/panier", "/commande", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
