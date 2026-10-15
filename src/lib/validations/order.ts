import { z } from "zod";
import { honeypot, optionalEmail, phoneSchema, requiredText, trimmed } from "./shared";

/**
 * Commande client.
 *
 * POINT DE SÉCURITÉ CENTRAL : le client transmet uniquement des IDENTIFIANTS
 * et des QUANTITÉS. Aucun prix, aucun libellé, aucun total ne vient du
 * navigateur — tout est relu en base au moment de l'enregistrement.
 *
 * Sans cette règle, il suffirait de modifier le JSON du panier dans les outils
 * de développement pour commander à 0 FCFA.
 */

export const cartLineSchema = z.object({
  productId: requiredText("Le produit", 40),
  variantId: trimmed.max(40).optional().or(z.literal("").transform(() => undefined)),
  quantity: z.coerce
    .number()
    .int("La quantité doit être un nombre entier.")
    .min(1, "La quantité minimale est 1.")
    .max(999, "La quantité maximale est 999."),
});

export const checkoutSchema = z.object({
  fullName: requiredText("Le nom complet", 120),
  phone: phoneSchema,
  email: optionalEmail,
  address: requiredText("L'adresse de livraison", 400),
  city: trimmed.max(120).optional().or(z.literal("").transform(() => undefined)),
  customerNote: trimmed
    .max(1000, "Le message ne doit pas dépasser 1000 caractères.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  paymentMethod: z.enum(
    ["CASH_ON_DELIVERY", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "OTHER"],
    { message: "Choisissez un moyen de paiement." },
  ),
  items: z
    .array(cartLineSchema)
    .min(1, "Votre panier est vide.")
    .max(50, "Une commande ne peut pas dépasser 50 lignes."),
  website: honeypot,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Mise à jour d'une commande depuis l'administration. */
export const orderUpdateSchema = z.object({
  orderId: requiredText("La commande", 40),
  status: z.enum(["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED", "FAILED"]),
  adminNote: trimmed
    .max(2000, "La note ne doit pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Inscription à une formation depuis la page publique. */
export const trainingRegistrationSchema = z.object({
  trainingId: requiredText("La formation", 40),
  fullName: requiredText("Le nom complet", 120),
  phone: phoneSchema,
  email: optionalEmail,
  message: trimmed
    .max(1000, "Le message ne doit pas dépasser 1000 caractères.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  website: honeypot,
});
