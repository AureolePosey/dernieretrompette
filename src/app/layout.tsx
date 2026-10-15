import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { CartProvider } from "@/context/cart";
import { env } from "@/lib/env";
import { site } from "@content/site";
import "./globals.css";

/**
 * Polices auto-hébergées par next/font : aucun appel à Google au moment du
 * rendu (meilleure confidentialité, une requête tierce en moins) et aucun saut
 * de mise en page grâce au calcul automatique des métriques de repli.
 *
 * Fraunces (serif douce, à contraste marqué) porte les titres : elle évoque
 * l'artisanal sans tomber dans le rustique.
 * Figtree (sans humaniste) porte le texte courant : très lisible aux petites
 * tailles, y compris sur écran mobile d'entrée de gamme.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  /**
   * Seules les graisses réellement employées par les titres sont demandées.
   * Fraunces est une police variable dotée d'axes optionnels (SOFT, WONK,
   * opsz) : chacun alourdit le fichier, et aucun n'est utilisé dans la charte.
   * Les déclarer « pour plus tard » coûterait des dizaines de kilooctets sur
   * chaque première visite, y compris en connexion mobile lente.
   */
  weight: ["400", "500", "600", "700"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.metaDescription,
  applicationName: site.name,
  keywords: [
    "La Dernière Trompette",
    "coopérative agricole",
    "gari",
    "tapioca",
    "fonio",
    "manioc",
    "produits agricoles transformés",
    "agroalimentaire",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.metaDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
  width: "device-width",
  initialScale: 1,
  // Pas de maximumScale : brider le zoom empêche les personnes malvoyantes
  // d'agrandir le texte (WCAG 1.4.4).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${figtree.variable}`}>
      <body className="min-h-dvh antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
