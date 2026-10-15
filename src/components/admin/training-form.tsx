"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { createTraining, updateTraining } from "@/server/actions/content";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Checkbox, Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { Button, buttonStyles } from "@/components/ui/button";
import { Panel } from "@/components/admin/ui";
import type { ActionState } from "@/lib/validations/shared";
import { commerce } from "@content/site";

export type TrainingFormValues = {
  id?: string;
  title: string;
  summary: string | null;
  description: string | null;
  objectives: string[];
  program: string[];
  coverUrl: string | null;
  coverAlt: string | null;
  durationLabel: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  price: number | null;
  seats: number | null;
  conditions: string | null;
  published: boolean;
  position: number;
};

/** Convertit une date en valeur d'input `type="date"` (AAAA-MM-JJ). */
function toDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

/**
 * Création et modification d'une formation.
 *
 * Objectifs et programme sont saisis dans des zones de texte, une ligne par
 * entrée : c'est la façon la plus rapide d'écrire une liste, et le serveur la
 * convertit en tableau. Un éditeur de liste à boutons « + / − » serait plus
 * joli et bien plus lent à utiliser.
 */
export function TrainingForm({ training }: { training?: TrainingFormValues }) {
  const isEdit = Boolean(training?.id);
  const [coverUrl, setCoverUrl] = useState(training?.coverUrl ?? "");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateTraining : createTraining,
    { status: "idle" },
  );

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {training?.id ? <input type="hidden" name="id" value={training.id} /> : null}
      <input type="hidden" name="coverUrl" value={coverUrl} />

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
          <Panel title="Présentation">
            <div className="flex flex-col gap-5">
              <Field id="title" label="Titre" required error={fieldError("title")}>
                <Input
                  {...fieldAria("title", { error: fieldError("title") })}
                  name="title"
                  defaultValue={training?.title}
                  required
                  hasError={Boolean(fieldError("title"))}
                />
              </Field>

              <Field id="summary" label="Résumé" error={fieldError("summary")}>
                <Textarea
                  {...fieldAria("summary", { error: fieldError("summary") })}
                  name="summary"
                  rows={2}
                  defaultValue={training?.summary ?? ""}
                  hasError={Boolean(fieldError("summary"))}
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
                  defaultValue={training?.description ?? ""}
                  hasError={Boolean(fieldError("description"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Contenu pédagogique">
            <div className="flex flex-col gap-5">
              <Field
                id="objectives"
                label="Objectifs"
                hint="Un objectif par ligne."
                error={fieldError("objectives")}
              >
                <Textarea
                  {...fieldAria("objectives", { error: fieldError("objectives"), hasHint: true })}
                  name="objectives"
                  rows={5}
                  defaultValue={training?.objectives.join("\n") ?? ""}
                  hasError={Boolean(fieldError("objectives"))}
                />
              </Field>

              <Field
                id="program"
                label="Programme"
                hint="Une séquence par ligne, dans l'ordre."
                error={fieldError("program")}
              >
                <Textarea
                  {...fieldAria("program", { error: fieldError("program"), hasHint: true })}
                  name="program"
                  rows={6}
                  defaultValue={training?.program.join("\n") ?? ""}
                  hasError={Boolean(fieldError("program"))}
                />
              </Field>

              <Field
                id="conditions"
                label="Conditions d'inscription"
                error={fieldError("conditions")}
              >
                <Textarea
                  {...fieldAria("conditions", { error: fieldError("conditions") })}
                  name="conditions"
                  rows={3}
                  defaultValue={training?.conditions ?? ""}
                  hasError={Boolean(fieldError("conditions"))}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Publication">
            <div className="flex flex-col gap-5">
              <Checkbox
                id="published"
                name="published"
                label="Publier sur le site"
                defaultChecked={training?.published ?? false}
              />

              <Field
                id="position"
                label="Ordre d'affichage"
                error={fieldError("position")}
              >
                <Input
                  {...fieldAria("position", { error: fieldError("position") })}
                  name="position"
                  type="number"
                  min={0}
                  defaultValue={training?.position ?? 0}
                  hasError={Boolean(fieldError("position"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Organisation">
            <div className="flex flex-col gap-5">
              <Field
                id="durationLabel"
                label="Durée"
                hint="Ex. « 3 jours », « 2 demi-journées »."
                error={fieldError("durationLabel")}
              >
                <Input
                  {...fieldAria("durationLabel", {
                    error: fieldError("durationLabel"),
                    hasHint: true,
                  })}
                  name="durationLabel"
                  defaultValue={training?.durationLabel ?? ""}
                  hasError={Boolean(fieldError("durationLabel"))}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="startDate" label="Date de début" error={fieldError("startDate")}>
                  <Input
                    {...fieldAria("startDate", { error: fieldError("startDate") })}
                    name="startDate"
                    type="date"
                    defaultValue={toDateInput(training?.startDate ?? null)}
                    hasError={Boolean(fieldError("startDate"))}
                  />
                </Field>

                <Field id="endDate" label="Date de fin" error={fieldError("endDate")}>
                  <Input
                    {...fieldAria("endDate", { error: fieldError("endDate") })}
                    name="endDate"
                    type="date"
                    defaultValue={toDateInput(training?.endDate ?? null)}
                    hasError={Boolean(fieldError("endDate"))}
                  />
                </Field>
              </div>

              <Field id="location" label="Lieu" error={fieldError("location")}>
                <Input
                  {...fieldAria("location", { error: fieldError("location") })}
                  name="location"
                  defaultValue={training?.location ?? ""}
                  hasError={Boolean(fieldError("location"))}
                />
              </Field>

              <Field
                id="price"
                label={`Prix (${commerce.currencyLabel})`}
                hint="Vide = « Prix sur demande »."
                error={fieldError("price")}
              >
                <Input
                  {...fieldAria("price", { error: fieldError("price"), hasHint: true })}
                  name="price"
                  inputMode="decimal"
                  defaultValue={training?.price ?? ""}
                  hasError={Boolean(fieldError("price"))}
                />
              </Field>

              <Field id="seats" label="Nombre de places" error={fieldError("seats")}>
                <Input
                  {...fieldAria("seats", { error: fieldError("seats") })}
                  name="seats"
                  type="number"
                  min={0}
                  defaultValue={training?.seats ?? ""}
                  hasError={Boolean(fieldError("seats"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Image">
            <div className="flex flex-col gap-5">
              <ImageUploader value={coverUrl} onUploaded={setCoverUrl} label="Couverture" />

              <Field id="coverAlt" label="Texte alternatif" error={fieldError("coverAlt")}>
                <Input
                  {...fieldAria("coverAlt", { error: fieldError("coverAlt") })}
                  name="coverAlt"
                  defaultValue={training?.coverAlt ?? ""}
                  hasError={Boolean(fieldError("coverAlt"))}
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-earth-200 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" strokeWidth={2} />
              {isEdit ? "Enregistrer" : "Créer la formation"}
            </>
          )}
        </Button>

        <Link
          href="/admin/formations"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
