import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";

export function RatingLink({ locale }: { locale: Locale }) {
  const c = content[locale];
  return (
    <a href={business.maps} target="_blank" rel="noopener noreferrer" className="landing-rating">
      <span className="text-signal" aria-hidden="true">★★★★★</span>
      <span>{c.reviews.lead(business.rating.score, business.rating.count)}</span>
    </a>
  );
}
