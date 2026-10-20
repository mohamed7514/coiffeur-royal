import { business } from "@/lib/business";
import { reviews, selectCompactReviews, type ReviewContext } from "@/lib/reviews";
import { content, type Locale } from "@/lib/content";

/**
 * La note globale est vérifiée et s'affiche toujours. Les avis
 * individuels viennent de lib/reviews.ts — relevés un par un sur la
 * fiche Google. Rien n'est inventé ici.
 *
 * Note affichée à l'écran, jamais balisée en aggregateRating : Google
 * interdit de marquer ses propres avis sur son propre site.
 */
export function Reviews({ locale, compact = false, context }: {
  locale: Locale;
  compact?: boolean;
  context?: ReviewContext;
}) {
  const c = content[locale];
  const { score, count } = business.rating;
  const selected = compact ? selectCompactReviews(context) : reviews;

  return (
    <section className={`section shell${compact ? " landing-reviews" : ""}`}>
      <div className="flex flex-col gap-3">
        <span className="mini">{c.reviews.label}</span>
        <h2 className={`display ${compact ? "h3" : "h2"}`}>{c.reviews.title(score, count)}</h2>
      </div>

      {selected.length === 0 ? (
        <div className="mt-14 border border-dashed border-rule p-8 text-sm leading-relaxed text-mute">
          {c.reviews.empty}
        </div>
      ) : (
        <div className="mt-14 grid gap-8 border-t border-ink pt-10 lg:grid-cols-3 lg:gap-12">
          {selected.map((r) => {
            // Les avis sont écrits moitié en français, moitié en anglais :
            // chaque page montre la traduction quand il le faut, et le dit.
            const other = locale === "fr" ? r.textFr : r.textEn;
            const translated = r.lang !== locale && Boolean(other);
            const text = translated ? other : r.text;
            // Google ne donne qu'un écart (« il y a un an ») : quand la
            // date est reconstituée, l'année est tout ce qui est sûr.
            const when = r.approx
              ? String(new Date(r.date).getFullYear())
              : new Date(r.date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
                  month: "long",
                  year: "numeric",
                });

            return (
              <figure key={r.source} className="m-0 flex flex-col">
                <div
                  className="text-[0.85rem] tracking-[0.15em] text-signal"
                  aria-label={`${r.stars} / 5`}
                >
                  {"★".repeat(r.stars)}
                </div>

                <blockquote className="mt-4 text-[1.02rem] leading-relaxed">{text}</blockquote>

                {/* Les signatures s'alignent en bas, quelle que soit la
                    longueur de l'avis. */}
                <figcaption className="mt-auto pt-5 font-[family-name:var(--font-label)] text-[0.95rem] text-mute">
                  <a href={r.source} target="_blank" rel="noopener noreferrer" className="underlined">{r.author}</a> · <time dateTime={r.approx ? when : r.date}>{when}</time>
                  {translated && (
                    <span className="font-[family-name:var(--font-body)] text-[0.72rem] uppercase tracking-[0.04em]">
                      {" "}
                      · {c.reviews.translated}
                    </span>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <a href={business.maps} target="_blank" rel="noopener" className="btn">
          {c.reviews.all}
        </a>
      </div>
    </section>
  );
}

/** A short, sourced quote from the first review relevant to this page. */
export function ReviewHighlight({ locale, context }: { locale: Locale; context: ReviewContext }) {
  const review = selectCompactReviews(context)[0];
  if (!review) return null;

  const other = locale === "fr" ? review.textFr : review.textEn;
  const translated = review.lang !== locale && Boolean(other);
  const excerpt = review.excerpt?.[locale];
  const text = excerpt ?? (translated ? other : review.text);

  return (
    <figure className="review-highlight">
      <span className="review-highlight-label">
        {locale === "fr"
          ? excerpt ? "Extrait d’un avis Google" : "Avis Google"
          : excerpt ? "Excerpt from a Google review" : "Google review"}
      </span>
      <blockquote className="review-highlight-quote">{text}</blockquote>
      <figcaption className="review-highlight-source">
        <a href={review.source} target="_blank" rel="noopener noreferrer" className="underlined">
          {review.author}
        </a>
        {translated && (
          <span className="review-highlight-translated"> · {content[locale].reviews.translated}</span>
        )}
      </figcaption>
    </figure>
  );
}
