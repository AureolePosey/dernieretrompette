import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Consultez et modifiez les produits de votre panier avant de passer commande.",
  // Une page de panier n'a aucun intérêt dans les résultats de recherche :
  // son contenu est propre à chaque visiteur.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title="Mon panier"
        breadcrumb={[{ name: "Mon panier", href: "/panier" }]}
      />

      <div className="container-page py-12 md:py-16">
        <CartView />
      </div>
    </>
  );
}
