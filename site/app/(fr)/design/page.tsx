import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trois propositions de design",
  robots: { index: false, follow: false },
};

const options = [
  {
    key: "a",
    name: "Lame",
    idea: "Éditorial, centré, symétrique.",
    body: "Un didone à très fort contraste : à grande taille, les déliés deviennent fins comme une lame. Noir pur, acier froid, un seul rouge profond réservé à l’action. La photo est présentée petite et précise, en planche, là où tout le monde la met en grand. Les tarifs se lisent comme une carte imprimée, avec des points de conduite.",
    best: "Si tu veux que le salon paraisse soigné et cher.",
    risk: "Le plus calme des trois. Moins de choc, plus de tenue.",
  },
  {
    key: "b",
    name: "Affiche",
    idea: "Brutaliste, typo énorme, blocs inversés.",
    body: "Du condensé très lourd poussé jusqu’à déborder du cadre : le titre est recadré par l’écran, comme une affiche placardée. Noir, blanc franc, un rouge vif. Les lignes de tarif s’inversent entièrement au survol, et le forfait occupe un bloc blanc qui coupe le noir. Aucun angle arrondi.",
    best: "Si tu veux frapper fort et qu’on se souvienne du salon.",
    risk: "Le plus affirmé. Il ne plaît pas à tout le monde, et c’est le but.",
  },
  {
    key: "d",
    name: "Crisp",
    idea: "Le système de crispmtl.com, repris de près.",
    body: "Relevée directement dans la feuille de style de CRISP à Montréal : fond beige, encre noire, titres en grotesque large et lourde (92 px dans le hero, 72 px par section), petite étiquette en serif au-dessus de chaque titre, boutons noirs carrés en majuscules, et près de 200 px d’air entre les sections. La grille de six colonnes reste visible en filets, comme chez eux. La photo du salon tient le hero en plein cadre sous un voile noir ; les photos de coupes n’occupent qu’un tiers de largeur, là où leurs 510 px restent nets.",
    best: "Si tu veux le niveau de finition d’un salon de Montréal.",
    risk: "La seule page claire des quatre. Et elle réclame une photo de hero d’au moins 2000 px.",
  },
  {
    key: "c",
    name: "Atelier",
    idea: "Cinématographique, grille technique.",
    body: "La photo du salon en plein cadre, très assombrie, et le texte posé en bas à gauche comme un carton de film. Une plaque en monospace tient la fiche du lieu — état d’ouverture, note, coordonnées GPS réelles. Les services forment une table technique. Le laiton n’apparaît qu’en filets d’un pixel.",
    best: "Si tu veux montrer le lieu lui-même, et un côté métier.",
    risk: "Repose sur la photo. Plus il y aura de bonnes photos, plus il gagne.",
  },
];

export default function Page() {
  return (
    <main
      style={{
        background: "#0a0a0a",
        color: "#ededed",
        minHeight: "100vh",
        padding: "4rem 1.5rem 6rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "62rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3.2rem)", margin: 0, letterSpacing: "-0.03em" }}>
          Trois directions
        </h1>
        <p style={{ color: "#9a9a9a", marginTop: "1rem", maxWidth: "38rem", lineHeight: 1.6 }}>
          Les trois sont sur fond noir, avec le même contenu réel : vrais prix, vraies heures,
          vraie note Google, vraies photos. Seul le parti pris change. En français seulement —
          le choix fait, je l’applique partout, en français et en anglais.
        </p>

        <div style={{ display: "grid", gap: "1px", background: "#242424", marginTop: "3rem" }}>
          {options.map((o) => (
            <a
              key={o.key}
              href={`/design/${o.key}`}
              style={{
                background: "#0f0f0f",
                padding: "2rem 1.75rem",
                textDecoration: "none",
                color: "inherit",
                display: "grid",
                gap: "0.9rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "0.8rem",
                    color: "#d99a2b",
                    letterSpacing: "0.1em",
                  }}
                >
                  {o.key.toUpperCase()}
                </span>
                <h2 style={{ margin: 0, fontSize: "1.8rem", letterSpacing: "-0.02em" }}>{o.name}</h2>
                <span style={{ color: "#8a8a8a", fontSize: "0.95rem" }}>{o.idea}</span>
              </div>

              <p style={{ margin: 0, color: "#b4b4b4", lineHeight: 1.65, maxWidth: "48rem" }}>
                {o.body}
              </p>

              <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.3rem" }}>
                <span style={{ fontSize: "0.9rem", color: "#ededed" }}>→ {o.best}</span>
                <span style={{ fontSize: "0.9rem", color: "#7a7a7a" }}>{o.risk}</span>
              </div>
            </a>
          ))}
        </div>

        <p style={{ color: "#6a6a6a", marginTop: "2.5rem", fontSize: "0.88rem", lineHeight: 1.6 }}>
          Le site actuel reste en ligne sur <code style={{ color: "#9a9a9a" }}>/</code>. Ces pages
          ne sont pas indexables et disparaîtront une fois la direction choisie.
        </p>
      </div>
    </main>
  );
}
