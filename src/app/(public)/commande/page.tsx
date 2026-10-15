import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = {
  title: "Passer commande",
  description: "Renseignez vos coordonnées de livraison pour finaliser votre commande.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title="Finaliser ma commande"
        description="Nous vous contactons ensuite par téléphone pour confirmer le montant, la livraison et le règlement."
        breadcrumb={[
          { name: "Mon panier", href: "/panier" },
          { name: "Commande", href: "/commande" },
        ]}
      />

      <div className="container-page py-12 md:py-16">
        <CheckoutForm />
      </div>
    </>
  );
}
