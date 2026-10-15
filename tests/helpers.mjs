import { existsSync, readFileSync } from "node:fs";
import puppeteer from "puppeteer-core";

/**
 * Utilitaires communs aux tests de bout en bout.
 *
 * On pilote le Chrome DÉJÀ INSTALLÉ sur la machine (puppeteer-core) plutôt que
 * d'en télécharger un : cela évite ~150 Mo de dépendance pour un projet que
 * maintient une seule personne, et le navigateur testé est alors celui que les
 * visiteurs utilisent réellement.
 */

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export function findChrome() {
  const found = CHROME_CANDIDATES.find((path) => existsSync(path));
  if (!found) {
    throw new Error(
      "Aucun navigateur Chrome/Edge trouvé. Renseignez la variable CHROME_PATH " +
        "avec le chemin de l'exécutable.",
    );
  }
  return found;
}

export const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Identifiants du compte de DEVELOPPEMENT cree par le seed (domaine .test,
// reserve aux essais). Surchargeables par variables d environnement.
// Le compte de production est cree separement, avec son propre mot de passe.
export const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@laderniere-trompette.test";
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "MotDePasseTest2026!";

export async function launch() {
  return puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Charge axe-core depuis node_modules pour l'injecter dans la page. */
export function loadAxeSource() {
  return readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
}

/** Petit rapporteur de tests, sans dépendance de framework. */
export function createReporter(title) {
  const results = [];

  return {
    section(name) {
      console.log(`\n--- ${name} ---`);
    },
    check(name, ok, detail = "") {
      results.push({ name, ok, detail });
      console.log(`${ok ? "  OK  " : " ÉCHEC"} ${name}${detail ? ` — ${detail}` : ""}`);
      return ok;
    },
    /** Termine le processus avec un code non nul si un test a échoué (utile en CI). */
    finish() {
      const failed = results.filter((result) => !result.ok);
      console.log(`\n=== ${title} : ${results.length - failed.length}/${results.length} ===`);

      if (failed.length > 0) {
        console.log("Échecs :");
        failed.forEach((f) => console.log(`  - ${f.name} ${f.detail}`));
        process.exitCode = 1;
      }
    },
  };
}

/** Connecte un administrateur et laisse la page sur /admin. */
export async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle2" });
  await page.type('input[name="email"]', ADMIN_EMAIL);
  await page.type('input[name="password"]', ADMIN_PASSWORD);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
    page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Se connecter"))
        .click(),
    ),
  ]);
}

/** Clique le premier élément dont le texte contient `text`. */
export async function clickByText(page, selector, text, { navigate = false, settle = 2500 } = {}) {
  const act = page.evaluate(
    ([sel, txt]) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(txt));
      if (!el) throw new Error(`Élément introuvable : ${sel} contenant « ${txt} »`);
      el.click();
    },
    [selector, text],
  );

  if (navigate) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
      act,
    ]);
  } else {
    await act;
    await wait(settle);
  }
}

/** Soumet le formulaire qui contient le champ nommé `fieldName`. */
export async function submitFormContaining(page, fieldName, settle = 2500) {
  await page.evaluate((name) => {
    const form = document.querySelector(`[name="${name}"]`).closest("form");
    form.querySelector('button[type="submit"]').click();
  }, fieldName);
  await wait(settle);
}
