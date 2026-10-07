import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { business } from "@/lib/business";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Barbier à Gatineau, ouvert 7 jours sur 7 | Barbier RoyalMK",
  description:
    "Barbier pour hommes et enfants au 331 boul. Saint-Joseph, secteur Hull. Coupe 25 $, sans rendez-vous, ouvert tous les jours.",
  alternates: {
    canonical: "/",
    languages: { "fr-CA": "/", "en-CA": "/en" },
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "/",
    siteName: business.name,
    title: "Barbier à Gatineau, ouvert 7 jours sur 7",
    description:
      "Coupe 25 $, sans rendez-vous, secteur Hull. Noté 4,9 sur Google.",
    // Pas de `images` ici : Next sert app/opengraph-image.png, au format
    // 1200 × 630 attendu par les réseaux. L'ancienne valeur pointait sur
    // une photo verticale, que tous recadraient de travers.
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f4f1",
  colorScheme: "light",
};

export default function FrLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
