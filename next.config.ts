import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Formats servis par l'optimiseur d'images, du plus léger au plus
     * compatible. Next choisit celui que le navigateur annonce accepter.
     */
    formats: ["image/avif", "image/webp"],
    /**
     * Seules ces origines distantes sont autorisées. Sans cette liste blanche,
     * n'importe qui pourrait faire de notre optimiseur un proxy d'images.
     */
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
    /** Un mois de cache : les photos produits changent rarement. */
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /**
   * En-tête HSTS : une fois le domaine visité en HTTPS, le navigateur refuse
   * toute connexion en clair. Les autres en-têtes de sécurité sont posés par
   * le proxy (src/proxy.ts), qui peut les adapter par route.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  /** Les erreurs de typage doivent casser le build, jamais être ignorées. */
  typescript: { ignoreBuildErrors: false },

  /** Retire l'en-tête X-Powered-By, qui annonce inutilement la stack. */
  poweredByHeader: false,

  /**
   * Next.js dépose par défaut à la racine un fichier d'instructions
   * régénéré à chaque build. Ce dépôt documente ses choix dans le README et
   * dans le code lui-même : ce fichier n'y ajouterait que du bruit.
   */
  agentRules: false,
};

export default nextConfig;
