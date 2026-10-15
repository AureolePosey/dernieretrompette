"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { submitTrainingRegistration } from "@/server/actions/contact";
import { Field, fieldAria, Honeypot, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Demande d'inscription à une formation.
 *
 * En cas de succès, le formulaire est remplacé par un message de confirmation
 * plutôt que réinitialisé : cela évite qu'un visiteur ne renvoie deux fois la
 * même demande en croyant que rien ne s'est passé.
 */
export function TrainingRegistrationForm({
  trainingId,
  trainingTitle,
}: {
  trainingId: string;
  trainingTitle: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitTrainingRegistration,
    { status: "idle" },
  );

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-card border border-leaf-200 bg-leaf-50 p-6 text-center"
      >
        <CheckCircle2
          className="mx-auto size-8 text-leaf-600"
          aria-hidden="true"
          strokeWidth={1.75}
        />
        <p className="mt-4 font-display text-lg text-earth-900">Demande envoyée</p>
        <p className="mt-2 text-sm leading-relaxed text-earth-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="trainingId" value={trainingId} />
      <Honeypot />

      <div>
        <h2 className="font-display text-xl text-earth-900">S&apos;inscrire à cette formation</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-earth-500">
          Laissez vos coordonnées : nous vous rappelons pour confirmer votre place à «&nbsp;
          {trainingTitle}&nbsp;».
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3.5"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-clay-600"
            aria-hidden="true"
            strokeWidth={2}
          />
          <p className="text-sm leading-relaxed text-clay-600">{state.message}</p>
        </div>
      ) : null}

      <Field id="reg-fullName" label="Nom complet" required error={fieldError("fullName")}>
        <Input
          {...fieldAria("reg-fullName", { error: fieldError("fullName") })}
          name="fullName"
          autoComplete="name"
          required
          hasError={Boolean(fieldError("fullName"))}
        />
      </Field>

      <Field id="reg-phone" label="Téléphone" required error={fieldError("phone")}>
        <Input
          {...fieldAria("reg-phone", { error: fieldError("phone") })}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          hasError={Boolean(fieldError("phone"))}
        />
      </Field>

      <Field id="reg-email" label="Email" hint="Facultatif" error={fieldError("email")}>
        <Input
          {...fieldAria("reg-email", { error: fieldError("email"), hasHint: true })}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          hasError={Boolean(fieldError("email"))}
        />
      </Field>

      <Field id="reg-message" label="Message" hint="Facultatif" error={fieldError("message")}>
        <Textarea
          {...fieldAria("reg-message", { error: fieldError("message"), hasHint: true })}
          name="message"
          rows={3}
          hasError={Boolean(fieldError("message"))}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Envoi…
          </>
        ) : (
          "Envoyer ma demande"
        )}
      </Button>
    </form>
  );
}
