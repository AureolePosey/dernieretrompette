"use client";

import { useState } from "react";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/utils";

/**
 * Galerie d'une fiche produit.
 *
 * Les vignettes sont de vrais <button> dans une liste : navigables au clavier,
 * annoncées avec leur état sélectionné (`aria-current`). Une div cliquable
 * aurait l'air identique mais serait inutilisable sans souris.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <Media
        src={active?.url}
        alt={active?.alt ?? productName}
        ratio="square"
        priority
        sizes="(max-width: 1024px) 100vw, 560px"
        placeholderLabel="Photo du produit à fournir"
        className="rounded-card"
      />

      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? "true" : undefined}
                aria-label={`Voir l'image ${index + 1} sur ${images.length}`}
                className={cn(
                  "block w-full overflow-hidden rounded-[0.625rem] border-2 transition-colors duration-200",
                  index === activeIndex
                    ? "border-leaf-600"
                    : "border-transparent hover:border-earth-300",
                )}
              >
                <Media
                  src={image.url}
                  alt=""
                  ratio="square"
                  sizes="120px"
                  className="rounded-[0.5rem]"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
