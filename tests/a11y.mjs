/**
 * AUDIT D'ACCESSIBILITÉ — WCAG 2.1 niveau AA.
 *
 *   npm run test:a11y
 *
 * Analyse chaque page avec axe-core, côté public ET côté administration.
 * L'administration est incluse volontairement : c'est l'outil de travail
 * quotidien du client, il doit être utilisable au clavier et lisible.
 *
 * Un audit automatique ne couvre pas tout (environ 60 % des critères).
 * Il attrape en revanche sans faute les régressions de contraste, les champs
 * sans libellé et les images sans alternative — les fautes les plus fréquentes.
 */
import { BASE_URL, createReporter, launch, loadAxeSource, loginAsAdmin } from "./helpers.mjs";

const PUBLIC_PAGES = [
  "/",
  "/produits",
  "/a-propos",
  "/formations",
  "/actualites",
  "/contact",
  "/panier",
  "/commande",
  "/mentions-legales",
  "/confidentialite",
];

const ADMIN_PAGES = [
  "/admin",
  "/admin/produits",
  "/admin/produits/nouveau",
  "/admin/commandes",
  "/admin/actualites",
  "/admin/actualites/nouveau",
  "/admin/formations",
  "/admin/formations/nouveau",
  "/admin/messages",
  "/admin/categories",
  "/admin/parametres",
];

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const report = createReporter("Accessibilité WCAG 2.1 AA");
const axeSource = loadAxeSource();

const browser = await launch();

async function audit(page, path) {
  // Voir la note de e2e-visiteur.mjs sur le choix de `load`.
  await page.goto(BASE_URL + path, { waitUntil: "load" });
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.evaluate(axeSource);

  const { violations } = await page.evaluate(
    async (tags) => await window.axe.run(document, { runOnly: { type: "tag", values: tags } }),
    AXE_TAGS,
  );

  const ok = report.check(
    path,
    violations.length === 0,
    violations.length ? `${violations.length} violation(s)` : "",
  );

  if (!ok) {
    for (const violation of violations) {
      console.log(`        [${violation.impact}] ${violation.id} — ${violation.help}`);
      violation.nodes.slice(0, 3).forEach((node) => {
        console.log(`           ${node.html.slice(0, 140)}`);
      });
    }
  }
}

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  report.section("Pages publiques");
  for (const path of PUBLIC_PAGES) await audit(page, path);

  report.section("Pages publiques — affichage mobile");
  await page.setViewport({ width: 375, height: 812 });
  for (const path of ["/", "/produits", "/contact"]) await audit(page, path);

  report.section("Page de connexion");
  await page.setViewport({ width: 1280, height: 900 });
  await audit(page, "/admin/login");

  report.section("Administration");
  await loginAsAdmin(page);
  for (const path of ADMIN_PAGES) await audit(page, path);
} finally {
  await browser.close();
}

report.finish();
