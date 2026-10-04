import Image from "next/image";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { OpenNow } from "./OpenNow";

/**
 * Photo plein cadre, voile noir, titre centré en bas, une seule action.
 *
 * La photo du salon fait 618 × 800 px : le voile et le grain tiennent
 * l'agrandissement, mais c'est le point faible de la page tant qu'une
 * photo d'au moins 2000 px de large n'a pas remplacé celle-ci.
 */
export function Hero({ locale }: { locale: Locale }) {
  const c = content[locale];

  return (
    <section className="relative flex h-[100svh] min-h-[34rem] flex-col items-center justify-end overflow-hidden bg-[#111] px-4 pb-14 pt-8 text-center text-paper md:px-8">
      <Image
        src="/salon.jpg"
        alt={c.hero.photoAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.15) 60%), rgb(0 0 0 / 0.5)",
        }}
      />

      {/* Grain fin : il casse le lissage de l'agrandissement. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <div className="rise" style={{ ["--d" as string]: "80ms" }}>
          <OpenNow locale={locale} />
        </div>

        {/* Deux lignes tenues à la main : laissées libres, elles se
            coupent après « à » et le titre perd son aplomb. */}
        <h1 className="display h1 rise" style={{ ["--d" as string]: "180ms" }}>
          <span className="block">{c.hero.h1a}</span>
          <span className="block">{c.hero.h1b}</span>
        </h1>

        <a
          href={business.booking}
          target="_blank"
          rel="noopener"
          className="btn btn-light rise"
          style={{ ["--d" as string]: "320ms" }}
        >
          {c.nav.book}
        </a>
      </div>
    </section>
  );
}
