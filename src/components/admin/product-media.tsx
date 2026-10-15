"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { addProductImage, addProductVariant } from "@/server/actions/products";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Field, fieldAria, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validations/shared";
import { commerce } from "@content/site";

/**
 * Ajout d'une photo à un produit.
 *
 * Deux étapes distinctes : le fichier est d'abord envoyé et validé, puis
 * l'URL obtenue est associée au produit avec son texte alternatif. Séparer les
 * deux permet de montrer un aperçu avant l'enregistrement, et évite de perdre
 * l'envoi si le texte alternatif est mal saisi.
 */
export function AddProductImageForm({ productId }: { productId: string }) {
  const [url, setUrl] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addProductImage, {
    status: "idle",
  });

  /**
   * Réinitialise l'aperçu après un ajout réussi, prêt pour la photo suivante.
   *
   * Ajusté pendant le rendu plutôt que dans un effet : on compare le résultat
   * d'action courant au dernier traité. L'aperçu de la photo tout juste
   * enregistrée disparaît donc immédiatement, sans rendu intermédiaire où elle
   * réapparaîtrait un instant alors qu'elle est déjà rattachée au produit.
   */
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "success") setUrl("");
  }

  const altError = state.errors?.alt?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="url" value={url} />

      <ImageUploader
        value={url}
        onUploaded={setUrl}
        label="Nouvelle photo"
        hint="Privilégiez les photographies réelles de la coopérative."
      />

      <Field
        id="alt"
        label="Texte alternatif"
        required
        hint="Décrivez la photo en une phrase : lu par les lecteurs d'écran et par les moteurs de recherche."
        error={altError}
      >
        <Input
          {...fieldAria("alt", { error: altError, hasHint: true })}
          name="alt"
          required
          hasError={Boolean(altError)}
          placeholder="Sachets de gari conditionnés par la coopérative"
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm font-medium text-clay-600">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || url === ""} className="self-start">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Ajout…
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Ajouter la photo
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Ajout d'un format de vente (« Sachet 500 g », « Sac 25 kg »).
 * Un format sans prix reprend automatiquement celui du produit.
 */
export function AddProductVariantForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addProductVariant, {
    status: "idle",
  });

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <input type="hidden" name="productId" value={productId} />

      <Field id="variant-label" label="Format" required className="flex-1">
        <Input
          {...fieldAria("variant-label", {})}
          name="label"
          required
          placeholder="Sachet 500 g"
        />
      </Field>

      <Field
        id="variant-price"
        label={`Prix (${commerce.currencyLabel})`}
        hint="Vide = prix du produit"
        className="sm:w-44"
      >
        <Input
          {...fieldAria("variant-price", { hasHint: true })}
          name="price"
          inputMode="decimal"
        />
      </Field>

      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
        )}
        Ajouter
      </Button>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm font-medium text-clay-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
