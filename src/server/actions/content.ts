"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils";
import { newsSchema, trainingSchema } from "@/lib/validations/catalog";
import { orderUpdateSchema } from "@/lib/validations/order";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings-fields";
import { type ActionState, zodErrorToState } from "@/lib/validations/shared";

/**
 * Actualités, formations, commandes, messages et paramètres.
 *
 * Comme pour le catalogue : authentification revérifiée dans chaque action, et
 * invalidation ciblée du cache des pages publiques après chaque écriture.
 */

// ---------------------------------------------------------------------------
// ACTUALITÉS
// ---------------------------------------------------------------------------

function revalidateNews(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/actualites");
  if (slug) revalidatePath(`/actualites/${slug}`);
  revalidatePath("/admin/actualites");
}

export async function createNews(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = newsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  const data = parsed.data;
  let slug: string;

  try {
    slug = await uniqueSlug(data.title, async (candidate) =>
      Boolean(await prisma.news.findUnique({ where: { slug: candidate } })),
    );

    await prisma.news.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        category: data.category ?? null,
        author: data.author ?? null,
        published: data.published,
        // La date de publication n'est posée qu'au moment où l'article devient
        // public : un brouillon n'a pas de date de parution.
        publishedAt: data.published ? new Date() : null,
      },
    });
  } catch (cause) {
    console.error("[admin] création d'actualité impossible", cause);
    return { status: "error", message: "L'actualité n'a pas pu être créée." };
  }

  revalidateNews(slug);
  redirect("/admin/actualites?cree=1");
}

export async function updateNews(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Actualité introuvable." };

  const parsed = newsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  const data = parsed.data;

  try {
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { slug: true, title: true, published: true, publishedAt: true },
    });
    if (!existing) return { status: "error", message: "Actualité introuvable." };

    const slug =
      existing.title === data.title
        ? existing.slug
        : await uniqueSlug(data.title, async (candidate) => {
            const found = await prisma.news.findUnique({ where: { slug: candidate } });
            return Boolean(found && found.id !== id);
          });

    await prisma.news.update({
      where: { id },
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        category: data.category ?? null,
        author: data.author ?? null,
        published: data.published,
        // La date d'origine est conservée : dépublier puis republier un article
        // ne doit pas le faire remonter en tête de liste comme s'il était neuf.
        publishedAt: data.published ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    revalidateNews(existing.slug);
    revalidateNews(slug);
  } catch (cause) {
    console.error("[admin] mise à jour d'actualité impossible", cause);
    return { status: "error", message: "La modification n'a pas pu être enregistrée." };
  }

  return { status: "success", message: "Actualité enregistrée." };
}

export async function toggleNewsPublished(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    const news = await prisma.news.findUnique({
      where: { id },
      select: { slug: true, published: true, publishedAt: true },
    });
    if (!news) return;

    const nowPublished = !news.published;

    await prisma.news.update({
      where: { id },
      data: {
        published: nowPublished,
        publishedAt: nowPublished ? (news.publishedAt ?? new Date()) : null,
      },
    });

    revalidateNews(news.slug);
  } catch (cause) {
    console.error("[admin] publication impossible", cause);
  }
}

export async function deleteNews(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    const news = await prisma.news.delete({ where: { id }, select: { slug: true } });
    revalidateNews(news.slug);
  } catch (cause) {
    console.error("[admin] suppression d'actualité impossible", cause);
  }

  redirect("/admin/actualites?supprime=1");
}

// ---------------------------------------------------------------------------
// FORMATIONS
// ---------------------------------------------------------------------------

function revalidateTraining(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/formations");
  if (slug) revalidatePath(`/formations/${slug}`);
  revalidatePath("/admin/formations");
}

/** Champs communs à la création et à la mise à jour d'une formation. */
function trainingData(data: ReturnType<typeof trainingSchema.parse>) {
  return {
    title: data.title,
    summary: data.summary ?? null,
    description: data.description ?? null,
    objectives: data.objectives,
    program: data.program,
    coverUrl: data.coverUrl ?? null,
    coverAlt: data.coverAlt ?? null,
    durationLabel: data.durationLabel ?? null,
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location ?? null,
    price: data.price ?? null,
    seats: data.seats,
    conditions: data.conditions ?? null,
    published: data.published,
    position: data.position ?? 0,
  };
}

export async function createTraining(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = trainingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  let slug: string;

  try {
    slug = await uniqueSlug(parsed.data.title, async (candidate) =>
      Boolean(await prisma.training.findUnique({ where: { slug: candidate } })),
    );

    await prisma.training.create({ data: { slug, ...trainingData(parsed.data) } });
  } catch (cause) {
    console.error("[admin] création de formation impossible", cause);
    return { status: "error", message: "La formation n'a pas pu être créée." };
  }

  revalidateTraining(slug);
  redirect("/admin/formations?cree=1");
}

export async function updateTraining(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Formation introuvable." };

  const parsed = trainingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  try {
    const existing = await prisma.training.findUnique({
      where: { id },
      select: { slug: true, title: true },
    });
    if (!existing) return { status: "error", message: "Formation introuvable." };

    const slug =
      existing.title === parsed.data.title
        ? existing.slug
        : await uniqueSlug(parsed.data.title, async (candidate) => {
            const found = await prisma.training.findUnique({ where: { slug: candidate } });
            return Boolean(found && found.id !== id);
          });

    await prisma.training.update({
      where: { id },
      data: { slug, ...trainingData(parsed.data) },
    });

    revalidateTraining(existing.slug);
    revalidateTraining(slug);
  } catch (cause) {
    console.error("[admin] mise à jour de formation impossible", cause);
    return { status: "error", message: "La modification n'a pas pu être enregistrée." };
  }

  return { status: "success", message: "Formation enregistrée." };
}

export async function toggleTrainingPublished(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    const training = await prisma.training.findUnique({
      where: { id },
      select: { slug: true, published: true },
    });
    if (!training) return;

    await prisma.training.update({
      where: { id },
      data: { published: !training.published },
    });

    revalidateTraining(training.slug);
  } catch (cause) {
    console.error("[admin] publication impossible", cause);
  }
}

export async function deleteTraining(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    const training = await prisma.training.delete({ where: { id }, select: { slug: true } });
    revalidateTraining(training.slug);
  } catch (cause) {
    console.error("[admin] suppression de formation impossible", cause);
  }

  redirect("/admin/formations?supprime=1");
}

export async function updateRegistrationStatus(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("registrationId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return;

  try {
    await prisma.trainingRegistration.update({
      where: { id },
      data: { status: status as "PENDING" },
    });
    revalidatePath("/admin/formations");
  } catch (cause) {
    console.error("[admin] mise à jour d'inscription impossible", cause);
  }
}

// ---------------------------------------------------------------------------
// COMMANDES
// ---------------------------------------------------------------------------

export async function updateOrder(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorToState(parsed.error);

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        paymentStatus: parsed.data.paymentStatus,
        adminNote: parsed.data.adminNote ?? null,
      },
    });

    revalidatePath("/admin/commandes");
    revalidatePath(`/admin/commandes/${parsed.data.orderId}`);
  } catch (cause) {
    console.error("[admin] mise à jour de commande impossible", cause);
    return { status: "error", message: "La commande n'a pas pu être mise à jour." };
  }

  return { status: "success", message: "Commande mise à jour." };
}

// ---------------------------------------------------------------------------
// MESSAGES
// ---------------------------------------------------------------------------

export async function markMessageRead(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      select: { read: true },
    });
    if (!message) return;

    await prisma.contactMessage.update({ where: { id }, data: { read: !message.read } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
  } catch (cause) {
    console.error("[admin] mise à jour de message impossible", cause);
  }
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
  } catch (cause) {
    console.error("[admin] suppression de message impossible", cause);
  }
}

// ---------------------------------------------------------------------------
// PARAMÈTRES DU SITE
// ---------------------------------------------------------------------------

/**
 * Enregistrement des paramètres éditables.
 *
 * Réservé au rôle ADMIN : ces valeurs (coordonnées, mentions, textes légaux)
 * engagent la coopérative, contrairement à une fiche produit.
 *
 * Seules les clés déclarées dans SETTING_KEYS sont acceptées : un champ
 * supplémentaire injecté dans le formulaire est ignoré, et ne peut donc pas
 * créer de paramètre parasite en base.
 */
export async function saveSettings(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const allowed = new Set<string>(SETTING_KEYS);
  const updates: { key: SettingKey; value: string }[] = [];

  for (const [key, raw] of formData.entries()) {
    if (!allowed.has(key) || typeof raw !== "string") continue;
    // Borne haute : évite qu'un copier-coller malheureux ne stocke un roman.
    updates.push({ key: key as SettingKey, value: raw.trim().slice(0, 5000) });
  }

  if (updates.length === 0) {
    return { status: "error", message: "Aucun paramètre à enregistrer." };
  }

  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.siteSetting.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: { key: update.key, value: update.value },
        }),
      ),
    );
  } catch (cause) {
    console.error("[admin] enregistrement des paramètres impossible", cause);
    return { status: "error", message: "Les paramètres n'ont pas pu être enregistrés." };
  }

  // Les coordonnées apparaissent dans l'en-tête et le pied de page de TOUTES
  // les pages : on purge donc la totalité du cache de rendu.
  revalidatePath("/", "layout");

  return { status: "success", message: "Paramètres enregistrés." };
}
