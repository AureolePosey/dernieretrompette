"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { login } from "@/server/actions/auth";
import { Field, fieldAria, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Formulaire de connexion.
 *
 * Le message d'erreur est identique pour un email inconnu, un compte désactivé
 * ou un mot de passe faux : rien ne doit permettre d'énumérer les comptes.
 */
export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(login, {
    status: "idle",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {from ? <input type="hidden" name="from" value={from} /> : null}

      <div>
        <h2 className="font-display text-xl text-earth-900">Connexion</h2>
        <p className="mt-1 text-sm text-earth-500">
          Identifiez-vous pour gérer le contenu du site.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 size-4.5 shrink-0 text-clay-600"
            aria-hidden="true"
            strokeWidth={2}
          />
          <p className="text-sm leading-relaxed text-clay-600">{state.message}</p>
        </div>
      ) : null}

      <Field id="login-email" label="Email" required>
        <Input
          {...fieldAria("login-email", {})}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoFocus
          required
        />
      </Field>

      <Field id="login-password" label="Mot de passe" required>
        <div className="relative">
          <Input
            {...fieldAria("login-password", {})}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-earth-400 transition-colors hover:text-earth-700"
          >
            {showPassword ? (
              <EyeOff className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <Eye className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Connexion…
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden="true" strokeWidth={2} />
            Se connecter
          </>
        )}
      </Button>
    </form>
  );
}
