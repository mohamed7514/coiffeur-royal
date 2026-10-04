/**
 * Sélecteur de comparaison. Outil interne : il ne fait pas partie du
 * design et disparaîtra avec les pages /design une fois le choix fait.
 */
const options = [
  { key: "a", label: "A", name: "Lame" },
  { key: "b", label: "B", name: "Affiche" },
  { key: "c", label: "C", name: "Atelier" },
  { key: "d", label: "D", name: "Crisp" },
];

export function Switcher({ current }: { current: "a" | "b" | "c" | "d" }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        background: "#141414",
        border: "1px solid #303030",
        borderLeft: 0,
        fontFamily: "ui-monospace, monospace",
        fontSize: "0.72rem",
      }}
    >
      {options.map((o) => {
        const on = o.key === current;
        return (
          <a
            key={o.key}
            href={`/design/${o.key}`}
            title={o.name}
            style={{
              padding: "0.7rem 0.6rem",
              textAlign: "center",
              textDecoration: "none",
              color: on ? "#0a0a0a" : "#8a8a8a",
              background: on ? "#f0f0f0" : "transparent",
              fontWeight: on ? 700 : 400,
              borderBottom: "1px solid #303030",
            }}
          >
            {o.label}
          </a>
        );
      })}
      <a
        href="/design"
        title="Comparer"
        style={{
          padding: "0.7rem 0.6rem",
          textAlign: "center",
          textDecoration: "none",
          color: "#8a8a8a",
          fontSize: "0.8rem",
        }}
      >
        ⋯
      </a>
    </div>
  );
}
