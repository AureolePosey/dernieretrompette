"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitContactForm } from "@/server/actions/contact";
import { Field, fieldAria, Honeypot, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Formulaire de contact.
 *
 * Progressivement amélioré : construit sur un vrai <form> avec une Server
 * Action, il fonctionne même si le JavaScript n'a pas fini de charger — ce qui
 * arrive régulièrement sur une connexion mobile lente.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitContactForm, {
    status: "idle",
  });

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-card border border-leaf-200 bg-leaf-50 p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto size-9 text-leaf-600"
          aria-hidden="true"
          strokeWidth={1.75}
        />
        <p className="mt-4 font-display text-xl text-earth-900">Message envoyé</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-earth-600">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Honeypot />

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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Nom" required error={fieldError("name")}>
          <Input
            {...fieldAria("contact-name", { error: fieldError("name") })}
            name="name"
            autoComplete="name"
            required
            hasError={Boolean(fieldError("name"))}
          />
        </Field>

        <Field id="contact-email" label="Email" required error={fieldError("email")}>
          <Input
            {...fieldAria("contact-email", { error: fieldError("email") })}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            hasError={Boolean(fieldError("email"))}
          />
        </Field>
      </div>

      <Field
        id="contact-phone"
        label="Téléphone"
        hint="Facultatif — utile si vous préférez être rappelé."
        error={fieldError("phone")}
      >
        <Input
          {...fieldAria("contact-phone", { error: fieldError("phone"), hasHint: true })}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hasError={Boolean(fieldError("phone"))}
        />
      </Field>

      <Field id="contact-subject" label="Sujet" required error={fieldError("subject")}>
        <Input
          {...fieldAria("contact-subject", { error: fieldError("subject") })}
          name="subject"
          required
          placeholder="Commande, formation, partenariat…"
          hasError={Boolean(fieldError("subject"))}
        />
      </Field>

      <Field id="contact-message" label="Message" required error={fieldError("message")}>
        <Textarea
          {...fieldAria("contact-message", { error: fieldError("message") })}
          name="message"
          rows={6}
          required
          hasError={Boolean(fieldError("message"))}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" strokeWidth={2} />
            Envoyer le message
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-earth-400">
        Les informations transmises servent uniquement à répondre à votre demande. Consultez notre{" "}
        <a
          href="/confidentialite"
          className="underline underline-offset-2 transition-colors hover:text-leaf-700"
        >
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
