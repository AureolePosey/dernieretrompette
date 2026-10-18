import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Media } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import { priceLabel } from "@/lib/format";
import type { ProductCardData } from "@/server/queries";
import { cn } from "@/lib/utils";

/**
 * Carte produit du catalogue.
 *
 * Toute la carte est cliquable via un lien qui couvre la surface (`after:`),
 * ce qui donne une grande cible tactile, tout en ne produisant QU'UN seul lien
 * dans l'ordre de tabulation — contrairement à une carte où l'image, le titre
 * et le bouton seraient trois liens vers la même page.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[0];
  const price = priceLabel(product.price);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-earth-200 bg-cream-50",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-1 hover:border-earth-300 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        {/*
          Cadre CARRÉ et non 4/3 : les photos de packaging sont verticales, et
          un cadre paysage leur couperait le haut du sachet — donc la marque et
          le nom du produit, précisément ce qu'il faut voir.
        */}
        <Media
          src={image?.url}
          alt={image?.alt ?? product.name}
          ratio="square"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          placeholderLabel="Photo à fournir"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {!product.inStock ? (
          <div className="absolute top-3 left-3">
            <Badge tone="danger">Rupture temporaire</Badge>
          </div>
        ) : null}

        {product.category ? (
          <div className="absolute bottom-3 left-3">
            <Badge tone="info" className="bg-cream-50/95 backdrop-blur-sm">
              {product.category.name}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug text-earth-900">
          <Link
            href={`/produits/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        {product.shortDesc ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-earth-500">
            {product.shortDesc}
          </p>
        ) : null}

        <div className="mt-5 flex items-end justify-between gap-3 pt-4 border-t border-earth-200/70">
          <p className="flex flex-col">
            <span className="font-display text-xl font-semibold text-leaf-700">{price}</span>
            {product.unit ? (
              <span className="mt-0.5 text-xs text-earth-400">{product.unit}</span>
            ) : null}
          </p>

          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-cream-100 text-earth-500 transition-[background-color,color,transform] duration-300 group-hover:bg-leaf-600 group-hover:text-cream-50"
          >
            <ArrowRight className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </article>
  );
}
