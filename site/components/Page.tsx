import { type Locale } from "@/lib/content";
import { Nav } from "./Nav";
import { HeroCanvas } from "./HeroCanvas";
import { Story } from "./Story";
import { Services } from "./Services";
import { Reviews } from "./Reviews";
import { Visit, Shout, Footer, ActionBar } from "./Visit";
import { CallBadge } from "./CallBadge";
import { JsonLd } from "./JsonLd";
import { Lines } from "./Lines";

export function Page({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd locale={locale} />
      <Nav locale={locale} overHero />

      <main>
        {/* Hero en séquence d'images, piloté au défilement. La version
            fixe reste dans Hero.tsx si cette direction est abandonnée. */}
        <HeroCanvas locale={locale} />

        {/* Tout ce qui suit le hero vit sur le beige, dans le même
            rythme et sous la même grille de filets. */}
        {/* L'identifiant sert de repère à la barre de navigation : c'est
            l'arrivée de ce bloc en haut de l'écran qui la fait basculer
            du clair au noir, pas une distance devinée. */}
        <div className="wrapper" id="apres-hero">
          <Lines />
          <Story locale={locale} />
          <Services locale={locale} />
          <Reviews locale={locale} />
          <Visit locale={locale} />
          <Shout locale={locale} />
        </div>
      </main>

      <Footer locale={locale} />
      {/* Desktop : badge flottant. Mobile : barre d'action en bas. */}
      <CallBadge locale={locale} />
      <ActionBar locale={locale} />
    </>
  );
}
