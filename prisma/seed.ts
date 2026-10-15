import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

/**
 * INITIALISATION DE LA BASE
 *
 *   npm run db:seed          Compte administrateur + catégories. Sûr en production.
 *   npm run db:seed -- --demo  Ajoute en plus des contenus de DÉMONSTRATION.
 *
 * Le contenu de démonstration est strictement séparé, pour une raison simple :
 * il ne doit jamais atterrir par accident sur le site du client. Il sert à
 * montrer la maquette en attendant les vraies fiches produits, les vraies
 * photos et les vrais prix.
 *
 * Rien ici n'invente de fait sur la coopérative : aucun prix, aucune date,
 * aucun chiffre de production. Les descriptions décrivent les produits en
 * général, et chaque élément à compléter est marqué [À COMPLÉTER].
 *
 * Le script est IDEMPOTENT : on peut le relancer sans créer de doublon ni
 * écraser une saisie faite depuis l'administration.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const withDemo = process.argv.includes("--demo");

// ---------------------------------------------------------------------------
// COMPTE ADMINISTRATEUR
// ---------------------------------------------------------------------------

async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrateur";

  if (!email || !password) {
    console.log(
      "→ Compte administrateur ignoré (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD absents du .env).",
    );
    return;
  }

  if (password.length < 10) {
    throw new Error(
      "SEED_ADMIN_PASSWORD doit contenir au moins 10 caractères. " +
        "C'est le compte qui protège toute l'administration du site.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`→ Compte administrateur déjà présent : ${email} (inchangé).`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  console.log(`✓ Compte administrateur créé : ${email}`);
}

// ---------------------------------------------------------------------------
// CATÉGORIES
// ---------------------------------------------------------------------------

/**
 * Structure du catalogue, déduite de l'activité déclarée de la coopérative.
 * Le client peut renommer, réordonner ou supprimer ces catégories depuis
 * l'administration.
 */
const CATEGORIES = [
  {
    slug: "produits-manioc",
    name: "Produits à base de manioc",
    description:
      "Gari, tapioca, farines et autres dérivés issus de la transformation du manioc.",
    position: 1,
  },
  {
    slug: "fonio",
    name: "Fonio",
    description: "Fonio nettoyé, précuit et conditionné.",
    position: 2,
  },
  {
    slug: "produits-transformes",
    name: "Produits transformés",
    description: "Autres préparations réalisées par la coopérative.",
    position: 3,
  },
  {
    slug: "autres-produits-agricoles",
    name: "Autres produits agricoles",
    description: "Productions agricoles proposées selon les saisons.",
    position: 4,
  },
];

async function seedCategories(): Promise<void> {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      // Ne rien écraser : le client a pu ajuster le libellé depuis l'admin.
      update: {},
      create: category,
    });
  }
  console.log(`✓ ${CATEGORIES.length} catégories vérifiées.`);
}

// ---------------------------------------------------------------------------
// CONTENU DE DÉMONSTRATION
// ---------------------------------------------------------------------------

const DEMO_PRODUCTS = [
  {
    slug: "gari",
    name: "Gari",
    categorySlug: "produits-manioc",
    shortDesc:
      "Semoule de manioc fermentée puis torréfiée, prête à consommer ou à cuisiner.",
    description:
      "Le gari est obtenu à partir de manioc râpé, pressé, fermenté puis torréfié. Il se conserve longtemps à température ambiante et se prépare aussi bien en accompagnement qu'en bouillie.\n\n[À COMPLÉTER] Préciser ici la variété de manioc utilisée, le grain proposé (fin ou gros) et les particularités de la préparation de la coopérative.",
    extraInfo:
      "Conservation : à l'abri de l'humidité, dans un récipient hermétique.\n[À COMPLÉTER] Durée de conservation et conditionnements disponibles.",
    unit: "[À COMPLÉTER] unité de vente",
    featured: true,
    position: 1,
    variants: [
      { label: "[À COMPLÉTER] Format 1", position: 1 },
      { label: "[À COMPLÉTER] Format 2", position: 2 },
    ],
  },
  {
    slug: "tapioca",
    name: "Tapioca",
    categorySlug: "produits-manioc",
    shortDesc: "Perles d'amidon de manioc, utilisées en bouillie comme en dessert.",
    description:
      "Le tapioca est produit à partir de l'amidon extrait du manioc, façonné en perles puis séché. Il gonfle à la cuisson et sert de base à de nombreuses préparations sucrées ou salées.\n\n[À COMPLÉTER] Préciser le calibre des perles et les usages recommandés.",
    extraInfo: "[À COMPLÉTER] Conditionnements et durée de conservation.",
    unit: "[À COMPLÉTER] unité de vente",
    featured: true,
    position: 2,
    variants: [],
  },
  {
    slug: "fonio-precuit",
    name: "Fonio",
    categorySlug: "fonio",
    shortDesc: "Céréale à petit grain, nettoyée et conditionnée par la coopérative.",
    description:
      "Le fonio est une céréale traditionnelle à grain très fin, appréciée pour sa cuisson rapide et sa légèreté. Il se prépare en accompagnement, en salade ou en bouillie.\n\n[À COMPLÉTER] Préciser si le fonio proposé est brut, nettoyé ou précuit.",
    extraInfo: "[À COMPLÉTER] Origine, conditionnements et conservation.",
    unit: "[À COMPLÉTER] unité de vente",
    featured: true,
    position: 3,
    variants: [],
  },
  {
    slug: "farine-de-manioc",
    name: "Farine de manioc",
    categorySlug: "produits-manioc",
    shortDesc: "Manioc séché et moulu, pour pâtes et préparations culinaires.",
    description:
      "Farine obtenue par séchage et mouture du manioc.\n\n[À COMPLÉTER] Décrire la finesse de la mouture et les usages proposés.",
    extraInfo: "[À COMPLÉTER]",
    unit: "[À COMPLÉTER] unité de vente",
    featured: true,
    position: 4,
    variants: [],
  },
];

async function seedDemoProducts(): Promise<void> {
  const categories = await prisma.category.findMany();
  const byslug = new Map(categories.map((category) => [category.slug, category.id]));

  for (const product of DEMO_PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) continue;

    const { variants, categorySlug, ...data } = product;

    await prisma.product.create({
      data: {
        ...data,
        categoryId: byslug.get(categorySlug) ?? null,
        // Prix délibérément absent : ils s'afficheront en « Prix sur demande »
        // jusqu'à ce que la tarification soit arrêtée avec le client.
        price: null,
        published: true,
        inStock: true,
        variants: variants.length > 0 ? { create: variants } : undefined,
      },
    });
  }

  console.log(`✓ ${DEMO_PRODUCTS.length} produits de démonstration vérifiés.`);
}

async function seedDemoContent(): Promise<void> {
  const newsSlug = "bienvenue-sur-le-site-de-la-cooperative";

  if (!(await prisma.news.findUnique({ where: { slug: newsSlug } }))) {
    await prisma.news.create({
      data: {
        slug: newsSlug,
        title: "Bienvenue sur le site de La Dernière Trompette",
        excerpt:
          "Le site de la coopérative est en ligne : produits, formations et actualités sont désormais accessibles.",
        content:
          "Le site de La Dernière Trompette est désormais en ligne.\n\nVous y trouverez le catalogue de nos produits, le programme de nos formations et les annonces de la coopérative.\n\n[À COMPLÉTER] Remplacer cette annonce par le premier vrai communiqué de la coopérative.",
        category: "Annonce",
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  const trainingSlug = "formation-transformation-du-manioc";

  if (!(await prisma.training.findUnique({ where: { slug: trainingSlug } }))) {
    await prisma.training.create({
      data: {
        slug: trainingSlug,
        title: "[À COMPLÉTER] Transformation du manioc",
        summary:
          "[À COMPLÉTER] Résumer en une phrase l'objet de la formation et le public visé.",
        description:
          "[À COMPLÉTER] Décrire le déroulement de la formation, le matériel fourni et le niveau requis.",
        objectives: [
          "[À COMPLÉTER] Premier objectif pédagogique",
          "[À COMPLÉTER] Deuxième objectif pédagogique",
        ],
        program: [
          "[À COMPLÉTER] Première séquence",
          "[À COMPLÉTER] Deuxième séquence",
        ],
        durationLabel: "[À COMPLÉTER]",
        location: "[À COMPLÉTER]",
        conditions: "[À COMPLÉTER] Conditions d'inscription.",
        price: null,
        published: true,
        position: 1,
      },
    });
  }

  console.log("✓ Actualité et formation de démonstration vérifiées.");
}

// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("\nInitialisation de la base — La Dernière Trompette\n");

  await seedAdmin();
  await seedCategories();

  if (withDemo) {
    await seedDemoProducts();
    await seedDemoContent();
    console.log(
      "\n⚠ Contenu de DÉMONSTRATION inséré. Remplacez-le par les contenus réels\n" +
        "  avant la mise en ligne (chaque champ à remplir est marqué [À COMPLÉTER]).",
    );
  } else {
    console.log("\n→ Contenu de démonstration non inséré. Utilisez --demo pour l'ajouter.");
  }

  console.log("");
}

main()
  .catch((error) => {
    console.error("\n✗ Échec de l'initialisation :", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
