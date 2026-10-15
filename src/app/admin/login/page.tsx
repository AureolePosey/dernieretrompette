import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/session";
import { site } from "@content/site";

export const metadata = { title: "Connexion" };

/** Toujours dynamique : l'affichage dépend du cookie de session. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ from?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  // Déjà connecté : inutile de réafficher le formulaire.
  const session = await getSession();
  if (session) redirect("/admin");

  const { from } = await searchParams;

  return (
    <div className="grid min-h-dvh place-items-center bg-leaf-900 px-5 py-12">
      <div className="texture-grain pointer-events-none fixed inset-0 opacity-[0.12]" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto grid h-20 w-16 place-items-center rounded-2xl bg-cream-50 shadow-soft">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={206}
              height={291}
              priority
              className="h-16 w-auto object-contain"
            />
          </span>
          <h1 className="mt-5 font-display text-2xl text-cream-50">{site.name}</h1>
          <p className="mt-1.5 text-sm text-cream-200/70">Espace d&apos;administration</p>
        </div>

        <div className="mt-8 rounded-card bg-cream-50 p-7 shadow-lift md:p-8">
          <LoginForm from={from} />
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm text-cream-200/70 transition-colors hover:text-cream-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={2} />
          Retour au site
        </Link>
      </div>
    </div>
  );
}
