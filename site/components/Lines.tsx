/**
 * La grille du gabarit laissée visible : six filets verticaux sur grand
 * écran, deux sur mobile. Purement décoratif, donc hors du flux et sans
 * interception du survol — voir `.lines` dans globals.css.
 */
export function Lines() {
  return (
    <div className="lines" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
