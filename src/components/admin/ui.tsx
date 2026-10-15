import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Primitives de l'administration.
 *
 * Séparées des composants publics : l'administration privilégie la densité
 * d'information et la rapidité de lecture, là où le site public privilégie
 * l'espace et l'atmosphère. Mélanger les deux mènerait à un back-office
 * inutilement aéré ou à un site public qui ressemble à un tableur.
 */

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl text-earth-900 md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-earth-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={cn("rounded-card border border-earth-200 bg-cream-50", className)}>
      {title ? (
        <div className="border-b border-earth-200 px-5 py-4">
          <h2 className="font-display text-base text-earth-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-earth-500">{description}</p> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  href?: string;
  tone?: "neutral" | "accent" | "alert";
}) {
  const tones = {
    neutral: "border-earth-200 bg-cream-50",
    accent: "border-gari-200 bg-gari-50",
    alert: "border-clay-500/25 bg-clay-100",
  } as const;

  const body = (
    <div
      className={cn(
        "flex items-start gap-4 rounded-card border p-5 transition-[border-color,box-shadow] duration-200",
        tones[tone],
        href && "hover:border-earth-300 hover:shadow-soft",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-100 text-leaf-600">
        <Icon className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
      </span>

      <div className="min-w-0">
        <p className="font-display text-2xl font-semibold text-earth-900 tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-earth-500">{label}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

/**
 * Tableau responsive.
 *
 * Le conteneur est focalisable au clavier (`tabIndex={0}`) : quand le tableau
 * déborde horizontalement sur mobile, c'est la seule façon de le faire défiler
 * sans souris.
 */
export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div
      className="overflow-x-auto rounded-card border border-earth-200 bg-cream-50"
      tabIndex={0}
      role="region"
      aria-label="Tableau de données"
    >
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-earth-200 bg-cream-100">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-earth-500 uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-earth-200">{children}</tbody>
      </table>

      {empty}
    </div>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-cream-100/60">{children}</tr>;
}

export function TableCell({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 text-earth-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Bandeau de confirmation ou d'erreur après une action. */
export function FeedbackBanner({
  status,
  message,
}: {
  status: "success" | "error";
  message: string;
}) {
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "mb-6 rounded-card border px-4 py-3 text-sm leading-relaxed",
        status === "success"
          ? "border-leaf-200 bg-leaf-50 text-leaf-700"
          : "border-clay-500/30 bg-clay-100 text-clay-600",
      )}
    >
      {message}
    </p>
  );
}
