import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

/**
 * Protection de l'espace d'administration (Next.js 16 : « proxy », ex-middleware).
 *
 * PREMIÈRE barrière, pas la seule : un visiteur non authentifié est renvoyé
 * vers la page de connexion avant même d'atteindre une fonction serverless.
 * Chaque page et chaque Server Action sous /admin revérifie la session côté
 * serveur via requireAuth(), car les Server Actions sont des points d'entrée
 * HTTP autonomes qui ne passent pas nécessairement par ce chemin.
 *
 * Voir OWASP : ne jamais faire reposer une autorisation sur le seul routage.
 */

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const response = NextResponse.next();
  applySecurityHeaders(response);

  // La page de connexion doit rester accessible, sinon la redirection boucle.
  if (pathname === "/admin/login") return response;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySession(token, process.env.SESSION_SECRET ?? "");

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      // Mémorise la destination pour y revenir après connexion.
      loginUrl.searchParams.set("from", `${pathname}${search}`);

      const redirect = NextResponse.redirect(loginUrl);
      // Purge un cookie expiré ou falsifié pour éviter de réessayer à chaque requête.
      if (token) redirect.cookies.delete(SESSION_COOKIE);
      applySecurityHeaders(redirect);
      return redirect;
    }
  }

  return response;
}

/**
 * En-têtes de sécurité appliqués à toute réponse.
 * Pas de Content-Security-Policy stricte ici : Next.js injecte des scripts
 * inline dont le nonce doit être propagé au rendu. Une CSP mal calibrée casse
 * l'hydratation sans rien protéger de plus que les en-têtes ci-dessous.
 */
function applySecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
}

export const config = {
  /**
   * Exclut les ressources statiques : les faire transiter par le proxy
   * coûterait une invocation par image sans apporter aucune protection.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|images|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml)$).*)"],
};
