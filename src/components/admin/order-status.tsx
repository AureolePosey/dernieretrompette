import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma";

/**
 * Libellés et couleurs des statuts de commande.
 *
 * Un seul endroit définit la correspondance statut → libellé français : la
 * liste, le détail et le tableau de bord ne peuvent donc pas afficher trois
 * traductions différentes du même état.
 */

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Nouvelle",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  NEW: "accent",
  CONFIRMED: "info",
  PREPARING: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  REFUNDED: "Remboursée",
  FAILED: "Échec",
};

const PAYMENT_STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  REFUNDED: "neutral",
  FAILED: "danger",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Paiement à la livraison",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CARD: "Carte bancaire",
  OTHER: "Autre",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONES[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
