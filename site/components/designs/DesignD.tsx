"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { business, services, servicePath, vip } from "@/lib/business";
import { gallery } from "@/lib/gallery";
import { reviews } from "@/lib/reviews";
import { price } from "@/lib/content";
import { dayNames, formatTime, gatineauNow } from "@/lib/hours";
import { useOpen } from "@/lib/useOpen";
import s from "./DesignD.module.css";

/** Semaine commençant le lundi, à la québécoise. */
const week = [1, 2, 3, 4, 5, 6, 0];

type Group = { days: number[]; open: number; close: number };

/** CRISP affiche ses heures par plages (« Tuesday, Wednesday: 11AM-7PM »),
 *  jamais sept lignes. On regroupe donc les jours identiques — ici
 *  lundi–samedi, puis dimanche — au lieu de l'écrire à la main : les
 *  heures ne vivent qu'à un seul endroit, lib/business.ts. */
function grouped(): Group[] {
  const out: Group[] = [];
  for (const d of week) {
    const h = business.hours[d];
    const last = out[out.length - 1];
    if (last && last.open === h.open && last.close === h.close) last.days.push(d);
    else out.push({ days: [d], open: h.open, close: h.close });
  }
  return out;
}

const groupLabel = (g: Group) =>
  g.days.length === 1
    ? dayNames.fr[g.days[0]]
    : `${dayNames.fr[g.days[0]]} – ${dayNames.fr[g.days[g.days.length - 1]].toLowerCase()}`;

export function DesignD() {
  const { state, label, detail } = useOpen("fr");
  const [today, setToday] = useState<number | null>(null);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const tick = () => setToday(gatineauNow().day);
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // L'en-tête est posé sur la photo du hero, donc clair ; passé le hero
  // la page est beige et il doit repasser en noir.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;
  const hours = grouped();

  return (
    <div className={s.root}>
      <header className={`${s.head} ${solid ? s.headSolid : ""}`}>
        <nav className={s.headLinks}>
          <a href="#tarifs">Tarifs</a>
          <a href="#travaux">Travaux</a>
          <a href="#trouver">Nous trouver</a>
        </nav>

        <a href="#" className={s.mark}>
          RoyalMK
        </a>

        <div className={s.headRight}>
          <span className={s.lang}>
            <a href="#" className={s.langOn}>
              FR
            </a>
            <a href="#">EN</a>
          </span>
          <a href={`tel:${business.phone}`} className={s.headBook}>
            Appeler
          </a>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────
          Photo plein cadre, voile noir, titre centré en bas et une seule
          action : la structure de CRISP, au mot près. */}
      <section className={s.hero}>
        <Image
          src="/salon-hd.webp"
          alt="La salle du Barbier RoyalMK : mur de brique rouge, fauteuils de barbier et miroirs encadrés de noir."
          fill
          priority
          sizes="100vw"
          className={s.heroImg}
        />
        <div className={s.heroVeil} aria-hidden />
        <div className={s.heroGrain} aria-hidden />

        <div className={s.heroIn}>
          <div className={`${s.status} ${s.rise}`} style={{ ["--d" as string]: "80ms" }}>
            {state && (
              <>
                <span className={`${s.statusDot} ${state.open ? s.statusOn : ""}`} />
                {label} — {detail}
              </>
            )}
          </div>

          {/* Deux lignes tenues à la main : laissées libres, elles se
              coupent après « à » et le titre perd son aplomb. */}
          <h1
            className={`${s.wide} ${s.h1} ${s.heroTitle} ${s.rise}`}
            style={{ ["--d" as string]: "180ms" }}
          >
            <span>Barbier à Gatineau,</span>
            <span>sept jours sur sept</span>
          </h1>

          <a
            href={`tel:${business.phone}`}
            className={`${s.btn} ${s.btnLight} ${s.rise}`}
            style={{ ["--d" as string]: "320ms" }}
          >
            Appeler
          </a>
        </div>
      </section>

      <div className={s.wrapper}>
        {/* La grille du gabarit laissée visible, comme chez CRISP. */}
        <div className={s.lines} aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* ── Le salon ─────────────────────────────────────────────── */}
        <section className={`${s.section} ${s.story}`}>
          {/* La photo tient 33 % de la largeur : à cette taille, les
              fichiers de 510 px sont nets au lieu d'être agrandis. */}
          <div className={s.storyImg}>
            <Image
              src={gallery[2].src}
              alt={gallery[2].alt}
              fill
              sizes="(max-width: 60rem) 100vw, 33vw"
            />
          </div>

          <div className={s.storyRight}>
            <div className={s.secHead}>
              <span className={s.mini}>Le salon</span>
              <h2 className={`${s.wide} ${s.h2}`}>
                Sans rendez-vous. Coupe à 25 $.
              </h2>
            </div>

            <p className={s.storyText}>
              Barbier RoyalMK est ouvert sept jours sur sept sur le boulevard Saint-Joseph,
              dans le secteur Hull. Coupe, barbe, rasage à l’ancienne : on prend les clients
              sans rendez-vous, sept jours sur sept.
            </p>

            <div className={s.storyFoot}>
              <nav className={s.anchors}>
                <a href="#tarifs">Tarifs</a>
                <a href="#travaux">Travaux</a>
                <a href="#trouver">Nous trouver</a>
              </nav>

              <a href={business.maps} target="_blank" rel="noopener" className={s.score}>
                <b>4,9</b>
                <span className={s.scoreTxt}>
                  {business.rating.count} avis
                  <br />
                  sur Google
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Tarifs ───────────────────────────────────────────────── */}
        <section id="tarifs" className={s.section}>
          <div className={s.secHead}>
            <span className={s.mini}>Nos services</span>
            <h2 className={`${s.wide} ${s.h2}`}>Voici la liste des prix.</h2>
          </div>

          <div className={s.price}>
            <div>
              <div className={s.colHead}>
                <h3 className={`${s.wide} ${s.h3}`}>À la carte</h3>
                <p className={s.colNote}>Prix de base, taxes en sus. Chaque ligne ouvre sa page.</p>
              </div>

              {services.map((v) => (
                <a key={v.id} href={servicePath(v, "fr")} className={s.row}>
                  <span className={s.rowName}>{v.name}</span>
                  <span className={s.rowPrice}>{price(v.price, "fr")}</span>
                </a>
              ))}
            </div>

            <div className={s.vipBox}>
              <div className={s.colHead}>
                <h3 className={`${s.wide} ${s.h3}`}>Forfait VIP</h3>
                <p className={s.colNote}>Tout, en une heure.</p>
              </div>

              {/* Pas de prix à la pièce en regard de chaque ligne : les
                  quatre ne s'additionnent pas au total barré, et le
                  visiteur qui ferait la somme y verrait une erreur. */}
              <ul className={s.vipList}>
                {(vip.includes ?? []).map((i) => (
                  <li key={i}>
                    {i}
                    <span>inclus</span>
                  </li>
                ))}
              </ul>

              <div className={s.vipTotal}>
                <div>
                  <div className={s.vipPrice}>{price(vip.price, "fr")}</div>
                  <p className={s.vipWas}>
                    au lieu de {price(vip.partsTotal ?? 0, "fr")} à la pièce
                  </p>
                </div>
              </div>

              <div className={s.btnWrap}>
                <a href={`tel:${business.phone}`} className={s.btn}>
                  Appeler le salon
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Travaux ──────────────────────────────────────────────── */}
        <section id="travaux" className={s.section}>
          <div className={s.secHead}>
            <span className={s.mini}>Notre travail</span>
            <h2 className={`${s.wide} ${s.h2}`}>Ce qu’on fait de mieux.</h2>
          </div>

          <div className={s.shots}>
            {gallery.map((shot) => (
              <figure key={shot.src} className={s.shot}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 60rem) 50vw, 25vw"
                />
              </figure>
            ))}
          </div>
        </section>

        {/* ── Avis ────────────────────────────────────────────────────
            La note globale est vérifiée ; les trois avis sont ceux de la
            fiche Google, écrits en anglais et traduits ici. Rien n'est
            balisé en aggregateRating : Google interdit de marquer ses
            propres avis sur son propre site. */}
        <section className={s.section}>
          <div className={s.secHead}>
            <span className={s.mini}>Ce qu’en disent les clients</span>
            <h2 className={`${s.wide} ${s.h2}`}>
              4,9 sur 5, sur {business.rating.count} avis.
            </h2>
          </div>

          <div className={s.quotes}>
            {reviews.map((r) => (
              <figure key={r.source} className={s.quote}>
                <div className={s.stars} aria-label={`${r.stars} étoiles sur 5`}>
                  {"★".repeat(r.stars)}
                </div>
                <blockquote>{r.textFr ?? r.text}</blockquote>
                <figcaption>
                  {r.author} ·{" "}
                  {r.approx
                    ? new Date(r.date).getFullYear()
                    : new Date(r.date).toLocaleDateString("fr-CA", {
                        month: "long",
                        year: "numeric",
                      })}
                  {r.lang !== "fr" && <span> · traduit de l’anglais</span>}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className={s.btnWrap}>
            <a href={business.maps} target="_blank" rel="noopener" className={s.btn}>
              Lire tous les avis
            </a>
          </div>
        </section>

        {/* ── Nous trouver ─────────────────────────────────────────── */}
        <section id="trouver" className={s.section}>
          <div className={s.secHead}>
            <span className={s.mini}>De Gatineau, avec soin</span>
            <h2 className={`${s.wide} ${s.h2}`}>Un seul salon, sur Saint-Joseph.</h2>
          </div>

          <div className={s.place}>
            <div>
              <div className={s.label}>Adresse</div>
              <p className={s.addr}>
                {business.address.street}
                <br />
                <span>
                  {business.address.city} ({business.address.region}), {business.address.sector}
                </span>
              </p>

              <div className={s.placeActions}>
                <a href={directions} target="_blank" rel="noopener" className={s.btn}>
                  Itinéraire
                </a>
                <a href={`tel:${business.phone}`} className={s.tel}>
                  {business.phoneDisplay}
                </a>
              </div>
            </div>

            <div>
              <div className={s.label}>Heures d’ouverture</div>
              <div className={s.hours}>
                {hours.map((g) => (
                  <div
                    key={g.days.join()}
                    className={`${s.hourRow} ${today !== null && g.days.includes(today) ? s.today : ""}`}
                  >
                    <span>{groupLabel(g)}</span>
                    <span>
                      {formatTime(g.open, "fr")} – {formatTime(g.close, "fr")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Appel final ──────────────────────────────────────────── */}
        <section className={`${s.section} ${s.shout}`}>
          <span className={s.mini}>Une coupe fraîche</span>
          <h2 className={`${s.wide} ${s.h2}`}>Passez nous voir.</h2>
          <a href={`tel:${business.phone}`} className={s.btn}>
            Appeler
          </a>
          <a href={`tel:${business.phone}`} className={s.tel}>
            {business.phoneDisplay}
          </a>
        </section>
      </div>

      <footer className={s.foot}>
        <div className={s.footWrap}>
          <div>
            <div className={s.footMark}>RoyalMK</div>
            <p style={{ marginTop: "0.6rem" }}>
              {business.address.street}
              <br />
              {business.address.city} ({business.address.region})
              <br />
              <a href={`tel:${business.phone}`}>{business.phoneDisplay}</a>
            </p>
          </div>

          <div>
            {hours.map((g) => (
              <p key={g.days.join()}>
                {groupLabel(g)} : {formatTime(g.open, "fr")} – {formatTime(g.close, "fr")}
              </p>
            ))}
          </div>

          <div>
            <p>
              <a href={business.maps} target="_blank" rel="noopener">
                Fiche Google
              </a>
            </p>
            <p>
              <a href={`tel:${business.phone}`}>
                Appeler le salon
              </a>
            </p>
          </div>
        </div>

        <div className={s.footCopy}>
          <span>
            © {new Date().getFullYear()} {business.name}
          </span>
          <span>Sans rendez-vous, sept jours sur sept</span>
        </div>
      </footer>

      {/* Le badge d'appel n'apparaît qu'une fois le hero passé : par-dessus
          la photo, il ferait doublon avec le bouton de réservation. */}
      <a href={`tel:${business.phone}`} className={`${s.float} ${solid ? s.floatOn : ""}`}>
        {state && (
          <span className={s.floatText}>
            <b>{label}</b>
            <span>{detail}</span>
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      </a>

      <div className={s.bar}>
        <a href={`tel:${business.phone}`}>Appeler</a>
        <a href={business.maps} target="_blank" rel="noopener" className={s.barBook}>
          Itinéraire
        </a>
      </div>
    </div>
  );
}
