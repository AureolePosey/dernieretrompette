"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { saveSettings } from "@/server/actions/content";
import { SETTING_FIELDS } from "@/lib/settings-fields";
import { Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/admin/ui";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Édition des paramètres du site.
 *
 * Les champs sont décrits une seule fois dans lib/settings.ts (SETTING_FIELDS)
 * et rendus automatiquement ici, groupe par groupe. Ajouter un paramètre
 * éditable ne demande donc aucune modification de ce composant — seulement une
 * entrée dans la liste, qui sert aussi de liste blanche côté serveur.
 */
export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveSettings, {
    status: "idle",
  });

  // Préserve l'ordre de déclaration des groupes.
  const groups = SETTING_FIELDS.reduce<Map<string, typeof SETTING_FIELDS>>((map, field) => {
    const existing = map.get(field.group) ?? [];
    map.set(field.group, [...existing, field]);
    return map;
  }, new Map());

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-leaf-700"
        >
          <CheckCircle2 className="size-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3 text-sm text-clay-600"
        >
          <AlertCircle className="size-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      {[...groups.entries()].map(([group, fields]) => (
        <Panel key={group} title={group}>
          <div className="flex flex-col gap-5">
            {fields.map((field) => {
              const id = `setting-${field.key.replace(/\./g, "-")}`;

              return (
                <Field
                  key={field.key}
                  id={id}
                  label={field.label}
                  hint={field.hint}
                >
                  {field.multiline ? (
                    <Textarea
                      {...fieldAria(id, { hasHint: Boolean(field.hint) })}
                      name={field.key}
                      rows={3}
                      defaultValue={values[field.key] ?? ""}
                    />
                  ) : (
                    <Input
                      {...fieldAria(id, { hasHint: Boolean(field.hint) })}
                      name={field.key}
                      defaultValue={values[field.key] ?? ""}
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </Panel>
      ))}

      {/*
        Barre d'enregistrement collée en bas : le formulaire est long, et
        remonter chercher un bouton en haut de page est une friction inutile.
      */}
      <div className="sticky bottom-0 -mx-4 border-t border-earth-200 bg-cream-100/95 px-4 py-4 backdrop-blur-sm md:-mx-8 md:px-8">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" strokeWidth={2} />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
