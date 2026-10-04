import { business, services, vip, nameFor, servicePath } from "@/lib/business";
import { content, price, type Locale } from "@/lib/content";

/**
 * La liste des prix — la pièce maîtresse de l'accueil.
 *
 * C'est la première question du visiteur, et l'objet que tout barbier a
 * déjà sur son mur. Deux colonnes : les services à la pièce, et le
 * forfait en regard, exactement comme CRISP met ses niveaux de barbier
 * côte à côte.
 *
 * Chaque ligne mène à la page du service plutôt qu'à Squire : comme
 * Squire ne présélectionne rien, un clic direct vers la réservation ne
 * ferait économiser aucune étape, alors qu'une page donne le détail et
 * le vocabulaire que les gens cherchent. Réserver reste à un geste près
 * partout — en-tête, badge flottant, barre mobile.
 */
export function Services({ locale }: { locale: Locale }) {
  const c = content[locale];
  const items = (locale === "fr" ? vip.includes : vip.includesEn) ?? [];

  return (
    <section id="services" className="section shell">
      <div className="flex flex-col gap-3">
        <span className="mini">{c.services.label}</span>
        <h2 className="display h2">{c.services.title}</h2>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <div className="col-head">
            <h3 className="display h3">{c.services.aLaCarte}</h3>
            <p className="mt-2 text-[0.85rem] text-mute">{c.services.lead}</p>
          </div>

          {services.map((s) => (
            <a key={s.id} href={servicePath(s, locale)} className="row">
              <span className="font-semibold">{nameFor(s, locale)}</span>
              <span className="row-price">{price(s.price, locale)}</span>
            </a>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="col-head">
            <h3 className="display h3">{c.vip.label}</h3>
            <p className="mt-2 text-[0.85rem] text-mute">{c.vip.title}</p>
          </div>

          {/* Pas de prix à la pièce en regard de chaque ligne : les
              quatre ne s'additionnent pas au total barré, et le visiteur
              qui ferait la somme y verrait une erreur. */}
          <ul className="m-0 list-none p-0">
            {items.map((it) => (
              <li
                key={it}
                className="flex items-baseline justify-between gap-4 border-b border-rule py-[1.05rem]"
              >
                {it}
                <span className="text-[0.85rem] text-mute">{c.vip.included}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <div className="display num text-[clamp(3rem,8vw,4.5rem)] leading-[0.85]">
              {price(vip.price, locale)}
            </div>
            <p className="mt-2 text-[0.85rem] text-mute">
              {c.vip.insteadOf(vip.partsTotal ?? 0)}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href={business.booking} target="_blank" rel="noopener" className="btn">
              {c.vip.book}
            </a>
            <a href={servicePath(vip, locale)} className="self-center underlined text-[0.95rem]">
              {c.services.go}
            </a>
          </div>
        </div>
      </div>

      <p className="mt-10 text-[0.85rem] text-mute">{c.services.note}</p>
    </section>
  );
}
