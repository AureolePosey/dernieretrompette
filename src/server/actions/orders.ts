"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyNewOrder } from "@/lib/mailer";
import { limitByIp } from "@/lib/rate-limit";
import { buildOrderReference } from "@/lib/utils";
import { formatPriceWithCurrency } from "@/lib/format";
import { checkoutSchema } from "@/lib/validations/order";
import { type ActionState, zodErrorToState } from "@/lib/validations/shared";
import { commerce } from "@content/site";

/**
 * Enregistrement d'une commande.
 *
 * RÈGLE DE SÉCURITÉ FONDAMENTALE
 * Le navigateur n'envoie que des identifiants de produits et des quantités.
 * Les libellés, les prix et les totaux sont TOUS relus en base ici. Un panier
 * modifié dans les outils de développement ne peut donc pas imposer son prix.
 *
 * La création est transactionnelle : client, commande et lignes sont écrits
 * ensemble ou pas du tout. On ne peut pas se retrouver avec une commande
 * orpheline ou une commande sans ses lignes.
 */

export type CheckoutState = ActionState & { reference?: string };

export async function createOrder(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const limit = await limitByIp("checkout", 10, 600); // 10 commandes / 10 minutes
  if (!limit.success) {
    return {
      status: "error",
      message: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  // Les lignes du panier voyagent en JSON dans un champ caché : un FormData
  // plat ne sait pas représenter un tableau d'objets de façon fiable.
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { status: "error", message: "Votre panier n'a pas pu être lu. Rechargez la page." };
  }

  const parsed = checkoutSchema.safeParse({
    ...Object.fromEntries(formData),
    items: rawItems,
  });

  if (!parsed.success) {
    return zodErrorToState(parsed.error);
  }

  if (parsed.data.website) {
    // Robot : on simule un succès sans rien enregistrer.
    return { status: "success", message: "Commande enregistrée." };
  }

  const { items, fullName, phone, email, address, city, customerNote, paymentMethod } = parsed.data;

  // Le moyen de paiement doit être ACTIVÉ dans la configuration : un champ
  // <select> falsifié ne doit pas permettre de choisir un mode désactivé.
  const method = commerce.paymentMethods.find(
    (candidate) => candidate.value === paymentMethod && candidate.enabled,
  );
  if (!method) {
    return { status: "error", message: "Ce moyen de paiement n'est pas disponible." };
  }

  let reference: string;

  try {
    // --- Relecture des produits en base : source de vérité des prix -------
    const productIds = [...new Set(items.map((item) => item.productId))];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
      include: { variants: true },
    });

    const productById = new Map(products.map((product) => [product.id, product]));

    const lines = items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new OrderError("Un produit de votre panier n'est plus disponible.");
      }

      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : undefined;

      if (item.variantId && !variant) {
        throw new OrderError(`Le format choisi pour « ${product.name} » n'est plus disponible.`);
      }

      if (!product.inStock || (variant && !variant.inStock)) {
        throw new OrderError(`« ${product.name} » est momentanément en rupture.`);
      }

      // Prix serveur, jamais celui transmis par le client.
      const unitPrice = variant?.price ?? product.price;

      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        nameSnapshot: product.name,
        variantSnapshot: variant?.label ?? null,
        priceSnapshot: unitPrice,
        quantity: item.quantity,
        // Une ligne « prix sur demande » compte pour 0 dans le total : le
        // montant définitif sera confirmé par la coopérative.
        lineTotal: (unitPrice ?? 0) * item.quantity,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const deliveryFee = commerce.defaultDeliveryFee;

    // --- Écriture transactionnelle ---------------------------------------
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: { fullName, phone, email: email ?? null, address, city: city ?? null },
      });

      // Référence calculée dans la transaction : deux commandes simultanées ne
      // peuvent pas obtenir le même numéro (la contrainte d'unicité couvre le
      // cas résiduel, voir la reprise ci-dessous).
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const yearlyCount = await tx.order.count({ where: { createdAt: { gte: yearStart } } });

      return tx.order.create({
        data: {
          reference: buildOrderReference(yearlyCount),
          customerId: customer.id,
          paymentMethod: method.value as "CASH_ON_DELIVERY",
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          customerNote: customerNote ?? null,
          items: { create: lines },
        },
        include: { items: true },
      });
    });

    reference = order.reference;

    await notifyNewOrder({
      reference: order.reference,
      customerName: fullName,
      phone,
      total: formatPriceWithCurrency(order.total) ?? "Prix sur demande",
      itemCount: order.items.length,
      siteUrl: env.SITE_URL,
    });
  } catch (cause) {
    if (cause instanceof OrderError) {
      return { status: "error", message: cause.message };
    }

    console.error("[checkout] création de commande impossible", cause);
    return {
      status: "error",
      message:
        "Votre commande n'a pas pu être enregistrée. Réessayez, ou contactez-nous directement.",
    };
  }

  // La redirection est HORS du try : redirect() fonctionne en levant une
  // exception interne à Next.js, qui serait sinon interceptée par le catch.
  redirect(`/commande/confirmation/${reference}`);
}

/** Erreur métier destinée à être affichée telle quelle au visiteur. */
class OrderError extends Error {}
