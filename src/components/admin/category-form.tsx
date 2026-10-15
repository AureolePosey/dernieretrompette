"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Plus, Save } from "lucide-react";
import { saveCategory } from "@/server/actions/products";
import { Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";

/**
 * Création ou modification d'une catégorie.
 *
 * En création, le formulaire se vide après un enregistrement réussi pour
 * enchaîner les saisies. En modification, les valeurs sont conservées : on ne
 * vide pas un formulaire que l'utilisateur vient peut-être de corriger.
 */
export function CategoryForm({
  category,
}: {
  category?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    position: number;
  };
}) {
  const isEdit = Boolean(category?.id);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCategory, {
    status: "idle",
  });

  useEffect(() => {
    if (!isEdit && state.status === "success") formRef.current?.reset();
  }, [state.status, isEdit]);

  const fieldError = (name: string) => state.errors?.[name]?.[0];
  const idPrefix = category?.id ?? "new";

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card border border-leaf-200 bg-leaf-50 px-3.5 py-2.5 text-sm text-leaf-700"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-card border border-clay-500/30 bg-clay-100 px-3.5 py-2.5 text-sm text-clay-600"
        >
          {state.message}
        </p>
      ) : null}

      <Field
        id={`${idPrefix}-name`}
        label="Nom de la catégorie"
        required
        error={fieldError("name")}
      >
        <Input
          {...fieldAria(`${idPrefix}-name`, { error: fieldError("name") })}
          name="name"
          defaultValue={category?.name}
          required
          hasError={Boolean(fieldError("name"))}
          placeholder="Produits à base de manioc"
        />
      </Field>

      <Field
        id={`${idPrefix}-description`}
        label="Description"
        error={fieldError("description")}
      >
        <Textarea
          {...fieldAria(`${idPrefix}-description`, { error: fieldError("description") })}
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
          hasError={Boolean(fieldError("description"))}
        />
      </Field>

      <Field
        id={`${idPrefix}-position`}
        label="Ordre d'affichage"
        error={fieldError("position")}
      >
        <Input
          {...fieldAria(`${idPrefix}-position`, { error: fieldError("position") })}
          name="position"
          type="number"
          min={0}
          defaultValue={category?.position ?? 0}
          hasError={Boolean(fieldError("position"))}
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Enregistrement…
          </>
        ) : isEdit ? (
          <>
            <Save className="size-4" aria-hidden="true" strokeWidth={2} />
            Enregistrer
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Créer la catégorie
          </>
        )}
      </Button>
    </form>
  );
}
