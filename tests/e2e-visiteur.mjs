/**
 * PARCOURS VISITEUR — bout en bout.
 *
 *   npm run test:e2e
 *
 * Couvre le scénario principal du site : accueil → catalogue → fiche produit →
 * panier → commande → confirmation, plus le formulaire de contact, la page 404
 * et le rendu responsive.
 *
 * Prérequis : le site doit tourner (npm run dev ou npm start) et la base doit
 * contenir au moins un produit publié.
 */
import { BASE_URL, clickByText, createReporter, launch, wait } from "./helpers.mjs";

const report = createReporter("Parcours visiteur");
const consoleErrors = [];

const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

page.on("console", (msg) => {
  // Les 404 de ressources sont attendues lors du test de la page 404.
  if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) {
    consoleErrors.push(msg.text());
  }
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

try {
  // ------------------------------------------------------------------------
  report.section("Accueil");
  await page.goto(`${BASE_URL}/`, { waitUntil: "load" });

  report.check(
    "Un seul titre H1, comme l'exige la hiérarchie sémantique",
    (await page.$$eval("h1", (els) => els.length)) === 1,
  );

  const navCount = await page.$$eval("header nav a", (els) => els.length);
  report.check("Navigation principale rendue", navCount >= 6, `${navCount} liens`);

  // ------------------------------------------------------------------------
  report.section("Catalogue");
  await page.goto(`${BASE_URL}/produits`, { waitUntil: "load" });

  const productLinks = await page.$$eval('a[href^="/produits/"]', (els) => [
    ...new Set(els.map((e) => e.getAttribute("href"))),
  ]);
  report.check("Produits listés", productLinks.length > 0, `${productLinks.length} produit(s)`);

  await page.type('input[type="search"]', "gari");
  await wait(1200);
  const afterSearch = await page.$$eval('a[href^="/produits/"]', (els) => els.length);
  report.check(
    "La recherche restreint les résultats",
    afterSearch < productLinks.length,
    `${afterSearch} résultat(s)`,
  );

  // ------------------------------------------------------------------------
  report.section("Fiche produit et panier");
  const firstProduct = productLinks[0];
  await page.goto(`${BASE_URL}${firstProduct}`, { waitUntil: "load" });

  await clickByText(page, "button", "Ajouter au panier", { settle: 800 });

  const badge = await page.evaluate(() => {
    const el = document.querySelector('a[href="/panier"] span');
    return el ? el.textContent.trim() : null;
  });
  report.check("Le compteur du panier s'incrémente", badge === "1", `compteur = ${badge}`);

  await page.goto(`${BASE_URL}/panier`, { waitUntil: "load" });
  const cartLines = await page.$$eval("main ul li", (els) => els.length);
  report.check(
    "Le panier survit au changement de page",
    cartLines >= 1,
    `${cartLines} ligne(s)`,
  );

  await page.evaluate(() => {
    [...document.querySelectorAll("button")]
      .find((b) => (b.getAttribute("aria-label") ?? "").startsWith("Augmenter"))
      .click();
  });
  await wait(500);
  const quantity = await page.evaluate(() => {
    const el = [...document.querySelectorAll("span")].find(
      (e) => /^\d+$/.test(e.textContent.trim()) && e.className.includes("tabular"),
    );
    return el?.textContent.trim() ?? null;
  });
  report.check("La quantité est modifiable", quantity === "2", `quantité = ${quantity}`);

  // ------------------------------------------------------------------------
  report.section("Commande");
  await page.goto(`${BASE_URL}/commande`, { waitUntil: "load" });

  await page.type('input[name="fullName"]', "Client de recette");
  await page.type('input[name="phone"]', "+229 01 23 45 67");
  await page.type('textarea[name="address"]', "Quartier de test, rue 12");
  await page.type('input[name="city"]', "Ville de test");

  await clickByText(page, "button", "Confirmer ma commande", { navigate: true });

  const confirmUrl = page.url();
  report.check(
    "Redirection vers la page de confirmation",
    confirmUrl.includes("/commande/confirmation/LDT-"),
    confirmUrl.replace(BASE_URL, ""),
  );

  await wait(1500);
  const remaining = await page.evaluate(() => {
    const raw = localStorage.getItem("ldt.cart.v1");
    return raw ? JSON.parse(raw).length : -1;
  });
  report.check("Le panier est vidé après la commande", remaining === 0, `${remaining} ligne(s)`);

  // ------------------------------------------------------------------------
  report.section("Contact");
  await page.goto(`${BASE_URL}/contact`, { waitUntil: "load" });

  await page.type('input[name="name"]', "Visiteur de recette");
  await page.type('input[name="email"]', "recette@example.com");
  await page.type('input[name="subject"]', "Question sur les conditionnements");
  await page.type(
    'textarea[name="message"]',
    "Bonjour, quels conditionnements proposez-vous pour le gari ?",
  );
  await clickByText(page, "button", "Envoyer le message");

  report.check(
    "Message de contact enregistré",
    await page.evaluate(() => document.body.textContent.includes("Message envoyé")),
  );

  // Cas valide pour le navigateur, invalide pour le serveur : prouve que la
  // validation serveur agit pour son propre compte.
  await page.goto(`${BASE_URL}/contact`, { waitUntil: "load" });
  await page.type('input[name="name"]', "Test validation");
  await page.type('input[name="email"]', "validation@example.com");
  await page.type('input[name="subject"]', "Test");
  await page.type('textarea[name="message"]', "court");
  await clickByText(page, "button", "Envoyer le message", { settle: 3000 });

  report.check(
    "Le serveur rejette un message trop court",
    await page.evaluate(() => document.body.textContent.includes("au moins 10 caractères")),
  );

  // ------------------------------------------------------------------------
  report.section("Erreurs et états");
  const notFound = await page.goto(`${BASE_URL}/page-inexistante-de-recette`, {
    waitUntil: "load",
  });
  report.check("Page inconnue : HTTP 404", notFound.status() === 404, `HTTP ${notFound.status()}`);

  // ------------------------------------------------------------------------
  report.section("Responsive");
  for (const [label, width, height] of [
    ["Mobile 375 px", 375, 812],
    ["Mobile 400 px", 400, 850],
    ["Tablette 768 px", 768, 1024],
    ["Portable 1280 px", 1280, 800],
    ["Grand écran 1920 px", 1920, 1080],
  ]) {
    await page.setViewport({ width, height });

    for (const path of ["/", "/produits", "/contact"]) {
      // `load` et non `networkidle2` : on ne mesure ici qu'une mise en page.
      // En production, Next.js précharge les liens visibles, si bien que le
      // réseau ne redevient jamais totalement inactif et que `networkidle2`
      // finirait systématiquement en dépassement de délai.
      await page.goto(BASE_URL + path, { waitUntil: "load" });
      await wait(250);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      if (overflows) {
        report.check(`${label} — ${path} : pas de débordement horizontal`, false);
      }
    }

    report.check(`${label} : aucune page ne déborde horizontalement`, true);
  }
} finally {
  await browser.close();
}

if (consoleErrors.length > 0) {
  console.log("\n--- Erreurs console ---");
  [...new Set(consoleErrors)].slice(0, 10).forEach((e) => console.log(`  ! ${e.slice(0, 180)}`));
  report.check("Aucune erreur JavaScript en console", false, `${consoleErrors.length} erreur(s)`);
} else {
  report.check("Aucune erreur JavaScript en console", true);
}

report.finish();
