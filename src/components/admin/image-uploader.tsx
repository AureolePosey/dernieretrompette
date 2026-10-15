"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { uploadProductImage } from "@/server/actions/products";
import { cn } from "@/lib/utils";

/**
 * Envoi d'une image.
 *
 * Deux usages :
 *   - `onUploaded` seul : l'appelant reçoit l'URL et la place dans un champ
 *     caché (couverture d'actualité, de formation) ;
 *   - avec `name` : l'URL est écrite dans un input caché du formulaire parent.
 *
 * Le fichier part vers une Server Action, qui vérifie le contenu réel du
 * fichier avant tout stockage. Aucune confiance n'est accordée au navigateur.
 */
export function ImageUploader({
  value,
  onUploaded,
  name,
  label = "Image",
  hint,
}: {
  value?: string | null;
  onUploaded?: (url: string) => void;
  name?: string;
  label?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProductImage({ status: "idle" }, formData);

      if (result.status === "error" || !result.url) {
        setError(result.message ?? "L'envoi a échoué.");
        return;
      }

      setUrl(result.url);
      onUploaded?.(result.url);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-earth-700">{label}</span>
      {hint ? <p className="text-xs leading-relaxed text-earth-400">{hint}</p> : null}

      {name ? <input type="hidden" name={name} value={url} /> : null}

      <div className="flex items-start gap-4">
        {url ? (
          <div className="relative size-28 shrink-0 overflow-hidden rounded-card border border-earth-200 bg-cream-100">
            <Image src={url} alt="" fill sizes="112px" className="object-cover" />
            <button
              type="button"
              onClick={() => {
                setUrl("");
                onUploaded?.("");
              }}
              aria-label="Retirer l'image"
              className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-earth-900/70 text-cream-50 transition-colors hover:bg-clay-600"
            >
              <X className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}

        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className={cn(
              "flex h-28 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed",
              "border-earth-300 bg-cream-100/60 text-sm text-earth-500 transition-colors",
              "hover:border-leaf-400 hover:bg-leaf-50 hover:text-leaf-700",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            {pending ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Envoi en cours…
              </>
            ) : (
              <>
                <ImagePlus className="size-5" aria-hidden="true" strokeWidth={1.75} />
                {url ? "Remplacer l'image" : "Choisir une image"}
              </>
            )}
          </button>

          <p className="mt-1.5 text-xs text-earth-400">
            JPEG, PNG, WebP ou AVIF — 5 Mo maximum.
          </p>

          {/*
            Champ masqué, déclenché par le bouton ci-dessus. Masqué ne veut pas
            dire anonyme : sans `aria-label`, un lecteur d'écran annoncerait un
            champ de fichier sans nom (violation WCAG 4.1.2).
          */}
          <input
            ref={inputRef}
            type="file"
            aria-label={`${label} — choisir un fichier image`}
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              // Réinitialise la valeur pour autoriser un nouvel envoi du même fichier.
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-clay-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
