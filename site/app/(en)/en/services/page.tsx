import type { Metadata } from "next";
import { ServicesIndex } from "@/components/ServicesIndex";

export const metadata: Metadata = {
  title: "Barber services and prices | Barbier RoyalMK, Gatineau",
  description:
    "Haircut $25, kids’ haircut $20, beard trim $19, traditional shave $25, VIP package $55. Barber at 331 boul. Saint-Joseph, Hull.",
  alternates: {
    canonical: "/en/services",
    languages: { "en-CA": "/en/services", "fr-CA": "/services" },
  },
};

export default function Page() {
  return <ServicesIndex locale="en" />;
}
