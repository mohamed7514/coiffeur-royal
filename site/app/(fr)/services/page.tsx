import type { Metadata } from "next";
import { ServicesIndex } from "@/components/ServicesIndex";

export const metadata: Metadata = {
  title: "Services et tarifs du barbier | Barbier RoyalMK, Gatineau",
  description:
    "Coupe 25 $, coupe enfant 20 $, taillage de barbe 19 $, rasage à l’ancienne 25 $, forfait VIP 55 $. Barbier au 331 boul. Saint-Joseph, secteur Hull.",
  alternates: {
    canonical: "/services",
    languages: { "fr-CA": "/services", "en-CA": "/en/services" },
  },
};

export default function Page() {
  return <ServicesIndex locale="fr" />;
}
