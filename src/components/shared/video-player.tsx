"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lecteur vidéo à chargement différé.
 *
 * LE POINT IMPORTANT : tant que le visiteur n'a pas cliqué, SEULE l'image
 * d'aperçu (~50 Ko) est téléchargée. La vidéo elle-même (plusieurs mégaoctets)
 * n'est demandée qu'au clic.
 *
 * Ce n'est pas un détail de confort : une bonne partie des visiteurs
 * consultera le site en données mobiles, où quelques mégaoctets imposés sans
 * prévenir coûtent réellement de l'argent. Une lecture automatique serait donc
 * un mauvais service rendu, même si elle paraît plus spectaculaire.
 */
export function VideoPlayer({
  src,
  poster,
  caption,
  alt,
  className,
}: {
  src: string;
  poster: string;
  /** Légende affichée sous la vidéo. */
  caption?: string;
  /** Décrit le contenu de l'aperçu pour les lecteurs d'écran. */
  alt: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden rounded-card bg-leaf-900">
        {playing ? (
          <video
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            className="aspect-[9/16] w-full bg-leaf-900 object-contain"
          >
            {/* Repli pour un navigateur qui ne saurait pas lire la vidéo. */}
            <a href={src} download>
              Télécharger la vidéo
            </a>
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block w-full cursor-pointer"
            aria-label={`Lire la vidéo : ${alt}`}
          >
            <Image
              src={poster}
              alt={alt}
              width={360}
              height={640}
              sizes="(max-width: 768px) 100vw, 360px"
              className="aspect-[9/16] w-full object-cover"
            />

            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-earth-900/35 transition-colors duration-300 group-hover:bg-earth-900/20"
            >
              <span className="grid size-16 place-items-center rounded-full bg-cream-50/95 text-leaf-700 shadow-lift transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 size-7 fill-current" strokeWidth={0} />
              </span>
            </span>
          </button>
        )}
      </div>

      {caption ? (
        <figcaption className="text-sm leading-relaxed text-earth-500">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
