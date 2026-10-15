"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { createNews, updateNews } from "@/server/actions/content";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Checkbox, Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { Button, buttonStyles } from "@/components/ui/button";
import { Panel } from "@/components/admin/ui";
import type { ActionState } from "@/lib/validations/shared";

export type NewsFormValues = {
  id?: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  coverAlt: string | null;
  category: string | null;
  author: string | null;
  published: boolean;
};

/**
 * Rédaction d'une actualité.
 *
 * Le contenu est saisi en texte brut, pas en HTML : une ligne vide sépare deux
 * paragraphes. C'est un choix délibéré — un éditeur riche demanderait une
 * dépendance lourde et introduirait une surface d'injection HTML, pour un
 * besoin qui se limite à des annonces de quelques paragraphes.
 */
export function NewsForm({ news }: { news?: NewsFormValues }) {
  const isEdit = Boolean(news?.id);
  const [coverUrl, setCoverUrl] = useState(news?.coverUrl ?? "");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateNews : createNews,
    { status: "idle" },
  );

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {news?.id ? <input type="hidden" name="id" value={news.id} /> : null}
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
        <Panel title="Contenu">
          <div className="flex flex-col gap-5">
            <Field id="title" label="Titre" required error={fieldError("title")}>
              <Input
                {...fieldAria("title", { error: fieldError("title") })}
                name="title"
                defaultValue={news?.title}
                required
                hasError={Boolean(fieldError("title"))}
              />
            </Field>

            <Field
              id="excerpt"
              label="Résumé"
              hint="Affiché en liste et utilisé pour le partage sur les réseaux."
              error={fieldError("excerpt")}
            >
              <Textarea
                {...fieldAria("excerpt", { error: fieldError("excerpt"), hasHint: true })}
                name="excerpt"
                rows={2}
                defaultValue={news?.excerpt ?? ""}
                hasError={Boolean(fieldError("excerpt"))}
              />
            </Field>

            <Field
              id="content"
              label="Texte de l'annonce"
              required
              hint="Laissez une ligne vide entre deux paragraphes."
              error={fieldError("content")}
            >
              <Textarea
                {...fieldAria("content", { error: fieldError("content"), hasHint: true })}
                name="content"
                rows={16}
                defaultValue={news?.content}
                required
                hasError={Boolean(fieldError("content"))}
              />
            </Field>
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Publication">
            <div className="flex flex-col gap-5">
              <Checkbox
                id="published"
                name="published"
                label="Publier sur le site"
                defaultChecked={news?.published ?? false}
              />

              <Field
                id="category"
                label="Catégorie"
                hint="Ex. Annonce, Production, Événement."
                error={fieldError("category")}
              >
                <Input
                  {...fieldAria("category", { error: fieldError("category"), hasHint: true })}
                  name="category"
                  defaultValue={news?.category ?? ""}
                  hasError={Boolean(fieldError("category"))}
                />
              </Field>

              <Field id="author" label="Auteur" error={fieldError("author")}>
                <Input
                  {...fieldAria("author", { error: fieldError("author") })}
                  name="author"
                  defaultValue={news?.author ?? ""}
                  hasError={Boolean(fieldError("author"))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Image de couverture">
            <div className="flex flex-col gap-5">
              <ImageUploader value={coverUrl} onUploaded={setCoverUrl} label="Couverture" />

              <Field
                id="coverAlt"
                label="Texte alternatif"
                hint="Décrivez l'image en une phrase."
                error={fieldError("coverAlt")}
              >
                <Input
                  {...fieldAria("coverAlt", { error: fieldError("coverAlt"), hasHint: true })}
                  name="coverAlt"
                  defaultValue={news?.coverAlt ?? ""}
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
              {isEdit ? "Enregistrer" : "Créer l'actualité"}
            </>
          )}
        </Button>

        <Link
          href="/admin/actualites"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
