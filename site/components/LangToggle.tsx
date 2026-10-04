import { type Locale } from "@/lib/content";

/**
 * Les deux langues visibles d'un coup, l'active soulignée. Un bouton
 * unique qui n'affiche que l'autre langue laisse le visiteur deviner
 * s'il lit « la langue actuelle » ou « la langue à atteindre ».
 *
 * Pas de pastille ni de cadre : l'en-tête se pose sur une photo, et
 * tout habillage y deviendrait du bruit.
 */
export function LangToggle({ locale }: { locale: Locale }) {
  const langs = [
    { code: "FR", href: "/", label: "Français", active: locale === "fr" },
    { code: "EN", href: "/en", label: "English", active: locale === "en" },
  ];

  return (
    <div className="flex items-center gap-1.5 text-[0.75rem] font-bold tracking-[0.08em]">
      {langs.map((l) => (
        <a
          key={l.code}
          href={l.href}
          hrefLang={l.code.toLowerCase()}
          aria-current={l.active ? "page" : undefined}
          aria-label={l.label}
          className={
            l.active
              ? "underline underline-offset-4"
              : "opacity-45 transition-opacity hover:opacity-100"
          }
        >
          {l.code}
        </a>
      ))}
    </div>
  );
}
