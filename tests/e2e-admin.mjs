/**
 * PARCOURS ADMINISTRATEUR — bout en bout.
 *
 *   npm run test:admin
 *
 * Couvre les scénarios du cahier des charges : connexion, création et
 * modification d'un produit, publication et dépublication, création d'une
 * actualité et d'une formation avec vérification sur le site public, suivi
 * d'une commande, paramètres du site, déconnexion.
 *
 * ATTENTION : ces tests ÉCRIVENT en base. À exécuter sur une base de
 * développement, jamais en production.
 */
import {
  BASE_URL,
  clickByText,
  createReporter,
  launch,
  loginAsAdmin,
  submitFormContaining,
  wait,
} from "./helpers.mjs";

const report = createReporter("Parcours administrateur");
const consoleErrors = [];
const stamp = Date.now().toString().slice(-6);

const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

page.on("console", (msg) => {
  if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) {
    consoleErrors.push(msg.text());
  }
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

try {
  // ------------------------------------------------------------------------
  report.section("Authentification");

  await page.goto(`${BASE_URL}/admin`, { waitUntil: "load" });
  report.check("Accès non authentifié redirigé vers la connexion", page.url().includes("/admin/login"));

  await page.type('input[name="email"]', "admin@laderniere-trompette.test");
  await page.type('input[name="password"]', "mot-de-passe-invalide");
  await clickByText(page, "button", "Se connecter", { settle: 3000 });
  report.check(
    "Mot de passe erroné rejeté sans révéler l'existence du compte",
    await page.evaluate(() => document.body.textContent.includes("Identifiants incorrects")),
  );

  await loginAsAdmin(page);
  report.check("Connexion réussie", page.url().endsWith("/admin"));

  // ------------------------------------------------------------------------
  report.section("Produit : créer, modifier, publier, dépublier");

  await page.goto(`${BASE_URL}/admin/produits/nouveau`, { waitUntil: "load" });

  const productName = `Produit de recette ${stamp}`;
  await page.type('input[name="name"]', productName);
  await page.type('textarea[name="shortDesc"]', "Accroche du produit de recette.");
  await page.type('textarea[name="description"]', "Description longue du produit de recette.");
  await page.type('input[name="price"]', "3500");
  await page.type('input[name="unit"]', "le sachet de 1 kg");
  await clickByText(page, "button", "Créer le produit", { navigate: true });

  report.check("Produit créé", page.url().includes("/admin/produits"));
  report.check(
    "Produit visible dans la liste",
    await page.evaluate((n) => document.body.textContent.includes(n), productName),
  );

  const editHref = await page.evaluate((n) => {
    const row = [...document.querySelectorAll("tr")].find((r) => r.textContent.includes(n));
    return row?.querySelector('a[href^="/admin/produits/"]')?.getAttribute("href") ?? null;
  }, productName);

  await page.goto(`${BASE_URL}${editHref}`, { waitUntil: "load" });

  await page.evaluate(() => {
    document.querySelector('input[name="price"]').value = "";
  });
  await page.type('input[name="price"]', "4200");
  await clickByText(page, "button", "Enregistrer les modifications");
  report.check(
    "Modification du prix enregistrée",
    await page.evaluate(() => document.body.textContent.includes("Produit enregistré")),
  );

  await page.type('input[name="label"]', "Sachet 500 g");
  await submitFormContaining(page, "label");
  report.check(
    "Format de vente ajouté",
    await page.evaluate(() => document.body.textContent.includes("Sachet 500 g")),
  );

  const publicHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href^="/produits/"]')].find((a) =>
      a.textContent.includes("Voir sur le site"),
    );
    return link?.getAttribute("href") ?? null;
  });

  await page.goto(`${BASE_URL}${publicHref}`, { waitUntil: "load" });
  const onPublicSite = await page.evaluate(
    (n) => ({
      nom: document.body.textContent.includes(n),
      // Intl fr-FR sépare les milliers par une espace fine insécable.
      prix: /4[^0-9]?200/.test(document.body.textContent),
      format: document.body.textContent.includes("Sachet 500 g"),
    }),
    productName,
  );
  report.check("Site public : produit visible", onPublicSite.nom);
  report.check("Site public : nouveau prix affiché", onPublicSite.prix);
  report.check("Site public : format proposé", onPublicSite.format);

  await page.goto(`${BASE_URL}/admin/produits`, { waitUntil: "load" });
  await page.evaluate((n) => {
    const row = [...document.querySelectorAll("tr")].find((r) => r.textContent.includes(n));
    [...row.querySelectorAll("button")].find((b) => b.textContent.includes("Publié")).click();
  }, productName);
  await wait(2500);

  const afterUnpublish = await page.goto(`${BASE_URL}${publicHref}`, { waitUntil: "load" });
  report.check(
    "Produit dépublié : 404 côté public",
    afterUnpublish.status() === 404,
    `HTTP ${afterUnpublish.status()}`,
  );

  // ------------------------------------------------------------------------
  report.section("Actualité : créer et publier");

  await page.goto(`${BASE_URL}/admin/actualites/nouveau`, { waitUntil: "load" });
  const newsTitle = `Annonce de recette ${stamp}`;
  await page.type('input[name="title"]', newsTitle);
  await page.type('textarea[name="excerpt"]', "Résumé de l'annonce de recette.");
  await page.type(
    'textarea[name="content"]',
    "Premier paragraphe de l'annonce de recette.\n\nSecond paragraphe.",
  );
  await page.click('input[name="published"]');
  await clickByText(page, "button", "Créer l'actualité", { navigate: true });
  report.check("Actualité créée", page.url().includes("/admin/actualites"));

  await page.goto(`${BASE_URL}/actualites`, { waitUntil: "load" });
  report.check(
    "Site public : actualité listée",
    await page.evaluate((t) => document.body.textContent.includes(t), newsTitle),
  );

  // ------------------------------------------------------------------------
  report.section("Formation : créer et publier");

  await page.goto(`${BASE_URL}/admin/formations/nouveau`, { waitUntil: "load" });
  const trainingTitle = `Formation de recette ${stamp}`;
  await page.type('input[name="title"]', trainingTitle);
  await page.type('textarea[name="summary"]', "Résumé de la formation de recette.");
  await page.type('textarea[name="objectives"]', "Premier objectif\nDeuxième objectif");
  await page.type('textarea[name="program"]', "Séquence 1\nSéquence 2");
  await page.type('input[name="durationLabel"]', "2 jours");
  await page.type('input[name="price"]', "15000");
  await page.click('input[name="published"]');
  await clickByText(page, "button", "Créer la formation", { navigate: true });
  report.check("Formation créée", page.url().includes("/admin/formations"));

  await page.goto(`${BASE_URL}/formations`, { waitUntil: "load" });
  report.check(
    "Site public : formation listée",
    await page.evaluate((t) => document.body.textContent.includes(t), trainingTitle),
  );

  // ------------------------------------------------------------------------
  report.section("Commande : suivi du statut");

  await page.goto(`${BASE_URL}/admin/commandes`, { waitUntil: "load" });
  const orderHref = await page.evaluate(
    () => document.querySelector('a[href^="/admin/commandes/"]')?.getAttribute("href") ?? null,
  );

  if (orderHref) {
    await page.goto(`${BASE_URL}${orderHref}`, { waitUntil: "load" });
    await page.select('select[name="status"]', "CONFIRMED");
    await page.select('select[name="paymentStatus"]', "PAID");
    await page.type('textarea[name="adminNote"]', "Client rappelé, commande confirmée.");
    await clickByText(page, "button", "Enregistrer");

    report.check(
      "Statut de commande mis à jour",
      await page.evaluate(() => document.body.textContent.includes("Commande mise à jour")),
    );

    await page.reload({ waitUntil: "load" });
    const persisted = await page.evaluate(() => ({
      statut: document.body.textContent.includes("Confirmée"),
      paiement: document.body.textContent.includes("Payée"),
    }));
    report.check("Statut persisté après rechargement", persisted.statut && persisted.paiement);
  } else {
    report.check("Une commande est disponible pour le test de statut", false, "aucune commande");
  }

  // ------------------------------------------------------------------------
  report.section("Paramètres : saisie et répercussion publique");

  await page.goto(`${BASE_URL}/admin/parametres`, { waitUntil: "load" });

  const phone = "+229 01 96 00 00 00";
  await page.evaluate(() => {
    for (const name of ["contact.phone", "contact.whatsapp", "contact.email"]) {
      const el = document.querySelector(`[name="${name}"]`);
      if (el) el.value = "";
    }
  });
  await page.type('[name="contact.phone"]', phone);
  await page.type('[name="contact.whatsapp"]', "22901960000000");
  await page.type('[name="contact.email"]', "contact@recette-test.example");
  await clickByText(page, "button", "Enregistrer les paramètres", { settle: 3000 });

  report.check(
    "Paramètres enregistrés",
    await page.evaluate(() => document.body.textContent.includes("Paramètres enregistrés")),
  );

  await page.goto(`${BASE_URL}/contact`, { waitUntil: "load" });
  report.check(
    "Site public : téléphone saisi affiché",
    await page.evaluate((p) => document.body.textContent.includes(p), phone),
  );
  report.check(
    "Site public : bouton WhatsApp apparu une fois le numéro renseigné",
    await page.evaluate(() => Boolean(document.querySelector('a[href*="wa.me"]'))),
  );

  // ------------------------------------------------------------------------
  report.section("Déconnexion");

  await page.goto(`${BASE_URL}/admin`, { waitUntil: "load" });
  await page.evaluate(() => {
    [...document.querySelectorAll("button")]
      .find((b) => b.getAttribute("aria-label") === "Se déconnecter")
      .click();
  });
  await wait(3000);
  report.check("Déconnexion effective", page.url().includes("/admin/login"));

  await page.goto(`${BASE_URL}/admin/produits`, { waitUntil: "load" });
  report.check("Accès refusé après déconnexion", page.url().includes("/admin/login"));
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
