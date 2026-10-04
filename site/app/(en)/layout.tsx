import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { business } from "@/lib/business";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Barber in Gatineau, open 7 days a week | Barbier RoyalMK",
  description:
    "Men’s and kids’ barber at 331 boul. Saint-Joseph, Hull. $25 haircuts, walk-ins welcome, open every day. Book online.",
  alternates: {
    canonical: "/en",
    languages: { "en-CA": "/en", "fr-CA": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/en",
    siteName: business.name,
    title: "Barber in Gatineau, open 7 days a week",
    description: "$25 haircuts, walk-ins welcome, Hull. Rated 4.9 on Google.",
    // Voir le commentaire côté français : l'image de partage vient du
    // fichier app/opengraph-image.png.
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f4f1",
  colorScheme: "light",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
