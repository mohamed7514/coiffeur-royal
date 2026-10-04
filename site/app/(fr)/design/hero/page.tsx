import type { Metadata } from "next";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Lines } from "@/components/Lines";
import { Story } from "@/components/Story";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Visit";

export const metadata: Metadata = {
  title: "Hero en séquence d’images",
  robots: { index: false, follow: false },
};

/**
 * Essai du hero piloté au défilement, posé sur les vraies sections qui
 * le suivraient. L'accueil n'est pas touché : voir le README pour la
 * ligne à changer si cette version est retenue.
 */
export default function Page() {
  return (
    <>
      <HeroCanvas locale="fr" />
      <div className="wrapper">
        <Lines />
        <Story locale="fr" />
        <Services locale="fr" />
      </div>
      <Footer locale="fr" />
    </>
  );
}
