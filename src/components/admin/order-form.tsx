"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { updateOrder } from "@/server/actions/content";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/components/admin/order-status";
import { Field, fieldAria, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma";

/**
 * Suivi d'une commande : statut logistique, statut de paiement, note interne.
 *
 * Les deux statuts sont indépendants — une commande peut être livrée et encore
 * impayée, ou payée d'avance mais pas encore expédiée. Les confondre en un
 * seul champ obligerait à mentir sur l'un des deux.
 */
export function OrderForm({
  orderId,
  status,
  paymentStatus,
  adminNote,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNote: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateOrder, {
    status: "idle",
  });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="orderId" value={orderId} />

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card border border-leaf-200 bg-leaf-50 px-4 py-2.5 text-sm text-leaf-700"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-card border border-clay-500/30 bg-clay-100 px-4 py-2.5 text-sm text-clay-600"
        >
          {state.message}
        </p>
      ) : null}

      <Field id="status" label="Statut de la commande" required>
        <Select {...fieldAria("status", {})} name="status" defaultValue={status}>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="paymentStatus" label="Statut du paiement" required>
        <Select
          {...fieldAria("paymentStatus", {})}
          name="paymentStatus"
          defaultValue={paymentStatus}
        >
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        id="adminNote"
        label="Note interne"
        hint="Jamais visible par le client."
        error={state.errors?.adminNote?.[0]}
      >
        <Textarea
          {...fieldAria("adminNote", { error: state.errors?.adminNote?.[0], hasHint: true })}
          name="adminNote"
          rows={4}
          defaultValue={adminNote ?? ""}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Enregistrement…
          </>
        ) : (
          <>
            <Save className="size-4" aria-hidden="true" strokeWidth={2} />
            Enregistrer
          </>
        )}
      </Button>
    </form>
  );
}
