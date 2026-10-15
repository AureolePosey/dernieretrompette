"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Checkbox, Field, fieldAria, Input, Select, Textarea } from "@/components/ui/field";
import { Button, buttonStyles } from "@/components/ui/button";
import { Panel } from "@/components/admin/ui";
import type { ActionState } from "@/lib/validations/shared";
import { commerce } from "@content/site";

/**
 * Formulaire produit (création et modification).
 *
 * Le même composant sert les deux cas : dupliquer un formulaire de 20 champs
 * pour changer une seule action garantit qu'ils divergeront tôt ou tard.
 */

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  categoryId: string | null;
  shortDesc: string | null;
  description: string | null;
  extraInfo: string | null;
  price: number | null;
  unit: string | null;
  weightGrams: number | null;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  position: number;
  metaTitle: string | null;
  metaDescription: string | null;
};

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductFormValues;
  categories: Category[];
}) {
  const isEdit = Boolean(product?.id);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProduct : createProduct,
    { status: "idle" },
  );

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-3 rounded-card border border-clay-500/30 bg-clay-100 px-4 py-3 text-sm text-clay-600"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="flex items-start gap-3 rounded-card border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-leaf-700"
        >
          <CheckCircle2 className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <Panel title="Informations principales">
            <div className="flex flex-col gap-5">
              <Field id="name" label="Nom du produit" required error={fieldError("name")}>
                <Input
                  {...fieldAria("name", { error: fieldError("name") })}
                  name="name"
                  defaultValue={product?.name}
                  required
                  hasError={Boolean(fieldError("name"))}
                  placeholder="Gari, Tapioca, Fonio…"
                />
              </Field>

              <Field
                id="shortDesc"
                label="Accroche"
                hint="Une phrase affichée sur la carte du catalogue."
                error={fieldError("shortDesc")}
              >
                <Textarea
                  {...fieldAria("shortDesc", { error: fieldError("shortDesc"), hasHint: true })}
                  name="shortDesc"
                  rows={2}
                  defaultValue={product?.shortDesc ?? ""}
                  hasError={Boolean(fieldError("shortDesc"))}
                />
              </Field>

              <Field
                id="description"
                label="Description"
                hint="Laissez une ligne vide entre deux paragraphes."
                error={fieldError("description")}
              >
                <Textarea
                  {...fieldAria("description", { error: fieldError("description"), hasHint: true })}
                  name="description"
                  rows={8}
                  defaultValue={product?.description ?? ""}
                  hasError={Boolean(fieldError("description"))}
                />
              </Field>

              <Field
                id="extraInfo"
                label="Bon à savoir"
                hint="Conservation, origine, conseils d'utilisation."
                error={fieldError("extraInfo")}
              >
                <Textarea
                  {...fieldAria("extraInfo", { error: fieldError("extraInfo"), hasHint: true })}
                  name="extraInfo"
                  rows={4}
                  defaultValue={product?.extraInfo ?? ""}
                  hasError={Boolean(fieldError("extraInfo"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Référencement"
            description="Facultatif : à défaut, le nom et l'accroche sont utilisés."
          >
            <div className="flex flex-col gap-5">
              <Field
                id="metaTitle"
                label="Titre SEO"
                hint="60 caractères environ."
                error={fieldError("metaTitle")}
              >
                <Input
                  {...fieldAria("metaTitle", { error: fieldError("metaTitle"), hasHint: true })}
                  name="metaTitle"
                  defaultValue={product?.metaTitle ?? ""}
                  hasError={Boolean(fieldError("metaTitle"))}
                />
              </Field>

              <Field
                id="metaDescription"
                label="Description SEO"
                hint="150 à 160 caractères."
                error={fieldError("metaDescription")}
              >
                <Textarea
                  {...fieldAria("metaDescription", {
                    error: fieldError("metaDescription"),
                    hasHint: true,
                  })}
                  name="metaDescription"
                  rows={3}
                  defaultValue={product?.metaDescription ?? ""}
                  hasError={Boolean(fieldError("metaDescription"))}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Publication">
            <div className="flex flex-col gap-4">
              <Checkbox
                id="published"
                name="published"
                label="Visible sur le site"
                defaultChecked={product?.published ?? true}
              />
              <Checkbox
                id="inStock"
                name="inStock"
                label="En stock"
                defaultChecked={product?.inStock ?? true}
              />
              <Checkbox
                id="featured"
                name="featured"
                label="Mettre en avant sur l'accueil"
                defaultChecked={product?.featured ?? false}
              />

              <Field
                id="position"
                label="Ordre d'affichage"
                hint="Les plus petits nombres apparaissent en premier."
                error={fieldError("position")}
              >
                <Input
                  {...fieldAria("position", { error: fieldError("position"), hasHint: true })}
                  name="position"
                  type="number"
                  min={0}
                  defaultValue={product?.position ?? 0}
                  hasError={Boolean(fieldError("position"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Classement et prix">
            <div className="flex flex-col gap-5">
              <Field id="categoryId" label="Catégorie" error={fieldError("categoryId")}>
                <Select
                  {...fieldAria("categoryId", { error: fieldError("categoryId") })}
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                >
                  <option value="">Non classé</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                id="price"
                label={`Prix (${commerce.currencyLabel})`}
                hint="Laissez vide pour afficher « Prix sur demande »."
                error={fieldError("price")}
              >
                <Input
                  {...fieldAria("price", { error: fieldError("price"), hasHint: true })}
                  name="price"
                  inputMode="decimal"
                  defaultValue={product?.price ?? ""}
                  hasError={Boolean(fieldError("price"))}
                />
              </Field>

              <Field
                id="unit"
                label="Unité de vente"
                hint="Ex. « le kg », « le sachet de 500 g »."
                error={fieldError("unit")}
              >
                <Input
                  {...fieldAria("unit", { error: fieldError("unit"), hasHint: true })}
                  name="unit"
                  defaultValue={product?.unit ?? ""}
                  hasError={Boolean(fieldError("unit"))}
                />
              </Field>

              <Field
                id="weightGrams"
                label="Poids net (grammes)"
                error={fieldError("weightGrams")}
              >
                <Input
                  {...fieldAria("weightGrams", { error: fieldError("weightGrams") })}
                  name="weightGrams"
                  type="number"
                  min={0}
                  defaultValue={product?.weightGrams ?? ""}
                  hasError={Boolean(fieldError("weightGrams"))}
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-earth-200 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" strokeWidth={2} />
              {isEdit ? "Enregistrer les modifications" : "Créer le produit"}
            </>
          )}
        </Button>

        <Link href="/admin/produits" className={buttonStyles({ variant: "secondary", size: "lg" })}>
          Annuler
        </Link>

        {isEdit ? (
          <p className="ml-auto text-sm text-earth-400">
            Les photos et formats se gèrent plus bas, après enregistrement.
          </p>
        ) : (
          <p className="ml-auto text-sm text-earth-400">
            Les photos et formats pourront être ajoutés après la création.
          </p>
        )}
      </div>
    </form>
  );
}
