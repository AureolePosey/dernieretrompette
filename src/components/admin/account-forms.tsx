"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Save } from "lucide-react";
import { changePassword, updateProfile } from "@/server/actions/account";
import { Field, fieldAria, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";

/** Message de confirmation ou d'erreur, commun aux deux formulaires. */
function Feedback({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const success = state.status === "success";

  return (
    <p
      role={success ? "status" : "alert"}
      className={
        success
          ? "flex items-center gap-2 rounded-card border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-leaf-700"
          : "rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3 text-sm text-clay-600"
      }
    >
      {success ? (
        <CheckCircle2 className="size-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
      ) : null}
      {state.message}
    </p>
  );
}

export function ProfileForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfile, {
    status: "idle",
  });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Feedback state={state} />

      <Field id="profile-name" label="Nom affiché" required error={state.errors?.name?.[0]}>
        <Input
          {...fieldAria("profile-name", { error: state.errors?.name?.[0] })}
          name="name"
          defaultValue={name}
          required
          hasError={Boolean(state.errors?.name?.[0])}
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
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

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePassword, {
    status: "idle",
  });
  const [visible, setVisible] = useState(false);

  /**
   * Vide les champs après un changement réussi.
   *
   * On remonte le formulaire en changeant sa `key`, plutôt que d'appeler
   * `reset()` sur une ref : React interdit de toucher le DOM pendant le rendu,
   * et un effet laisserait les trois mots de passe en clair un rendu de plus
   * dans la page. Le changement de clé les efface dès le rendu suivant.
   *
   * Le message de confirmation vit HORS du formulaire : il doit survivre au
   * remontage, sinon il disparaîtrait aussitôt affiché.
   */
  const [handled, setHandled] = useState(state);
  const [formKey, setFormKey] = useState(0);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "success") setFormKey((k) => k + 1);
  }

  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <div className="flex flex-col gap-5">
      <Feedback state={state} />

      <form key={formKey} action={formAction} className="flex flex-col gap-5">

      <Field
        id="currentPassword"
        label="Mot de passe actuel"
        required
        error={err("currentPassword")}
      >
        <Input
          {...fieldAria("currentPassword", { error: err("currentPassword") })}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          hasError={Boolean(err("currentPassword"))}
        />
      </Field>

      <Field
        id="newPassword"
        label="Nouveau mot de passe"
        required
        hint="12 caractères minimum. Une phrase dont vous vous souvenez vaut mieux qu'un mot court compliqué."
        error={err("newPassword")}
      >
        <div className="relative">
          <Input
            {...fieldAria("newPassword", { error: err("newPassword"), hasHint: true })}
            name="newPassword"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={12}
            hasError={Boolean(err("newPassword"))}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-earth-400 transition-colors hover:text-earth-700"
          >
            {visible ? (
              <EyeOff className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <Eye className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </Field>

      <Field
        id="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        required
        error={err("confirmPassword")}
      >
        <Input
          {...fieldAria("confirmPassword", { error: err("confirmPassword") })}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          hasError={Boolean(err("confirmPassword"))}
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Modification…
          </>
        ) : (
          <>
            <KeyRound className="size-4" aria-hidden="true" strokeWidth={2} />
            Changer le mot de passe
          </>
        )}
        </Button>
      </form>
    </div>
  );
}
