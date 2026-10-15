import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * État vide.
 *
 * Composant unique pour tout le site : une liste sans résultat ne doit jamais
 * se traduire par une page blanche. On dit ce qui manque, et si possible quoi
 * faire ensuite.
 */
export function EmptyState({
  Icon,
  title,
  description,
  action,
  className,
}: {
  Icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-earth-300 bg-cream-100/60 px-6 py-14 text-center",
        className,
      )}
    >
      <Icon className="mx-auto size-8 text-earth-300" aria-hidden="true" strokeWidth={1.5} />
      <p className="mt-4 font-display text-lg text-earth-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-earth-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
