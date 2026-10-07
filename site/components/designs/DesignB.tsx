"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { business, services, vip } from "@/lib/business";
import { gallery } from "@/lib/gallery";
import { duration, price } from "@/lib/content";
import { dayNames, formatTime, gatineauNow } from "@/lib/hours";
import { useOpen } from "@/lib/useOpen";
import s from "./DesignB.module.css";

const week = [1, 2, 3, 4, 5, 6, 0];

export function DesignB() {
  const { state, label, detail } = useOpen("fr");
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setToday(gatineauNow().day);
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;

  return (
    <div className={s.root}>
      <div className={s.shell}>
        <header className={s.head}>
          <span className={s.mark}>
            Royal<span>MK</span>
          </span>
          <div className={s.headRight}>
            <a href="#tarifs" className={s.navLink}>
              Tarifs
            </a>
            <span className={s.lang}>
              <a href="#" className={s.langOn}>
                FR
              </a>
              <a href="#">EN</a>
            </span>
            <a href={business.booking} target="_blank" rel="noopener" className={s.cta}>
              Réserver
            </a>
          </div>
        </header>
      </div>

      <section className={`${s.shell} ${s.hero}`}>
        <div className={s.status}>
          {state && (
            <>
              <span className={`${s.statusDot} ${state.open ? s.statusOn : ""}`} />
              {label} — {detail}
            </>
          )}
        </div>

        <h1 className={s.title}>
          <span className={`${s.poster} ${s.titleOut}`} style={{ display: "block" }}>
            Barbier
          </span>
          <span className={`${s.poster} ${s.titleOut} ${s.titleRed}`} style={{ display: "block" }}>
            Gatineau
          </span>
        </h1>

        <div className={s.heroGrid}>
          <div>
            <p className={s.lead}>
              Ouvert sept jours sur sept, sans rendez-vous. Boulevard Saint-Joseph, secteur Hull.
            </p>
            <div className={s.actions}>
              <a href={business.booking} target="_blank" rel="noopener" className={s.cta}>
                Réserver en ligne
              </a>
              <a href={`tel:${business.phone}`} className={`${s.cta} ${s.ctaLine} ${s.mono}`}>
                {business.phoneDisplay}
              </a>
            </div>
            <a href={business.maps} target="_blank" rel="noopener" className={s.scoreRow}>
              <b>4,9</b>
              <span>
                103 avis
                <br />
                sur Google
              </span>
            </a>
          </div>

          <div className={s.priceBlock}>
            <b>25 $</b>
            <span>La coupe, 30 minutes</span>
          </div>
        </div>
      </section>

      <div className={s.band}>
        <Image
          src="/salon-hd.webp"
          alt="La salle du Barbier RoyalMK, mur de brique et trois fauteuils."
          fill
          priority
          sizes="100vw"
        />
      </div>

      <section id="tarifs" className={`${s.shell} ${s.section}`}>
        <div className={s.secHead}>
          <h2 className={`${s.poster} ${s.secTitle}`}>Tarifs</h2>
          <p className={s.secNote}>Taxes en sus. Paiement au salon. Chaque ligne ouvre sa page.</p>
        </div>

        <div className={s.rows}>
          {services.map((v) => (
            <a key={v.id} href={`/services/${v.slug}`} className={s.row}>
              <span className={s.rowName}>{v.name}</span>
              <span className={`${s.rowMeta} ${s.mono}`}>{duration(v.minutes, "fr")}</span>
              <span className={s.rowPrice}>{price(v.price, "fr")}</span>
            </a>
          ))}
        </div>

        <div className={s.invert}>
          <div className={s.invertGrid}>
            <div>
              <h3 className={`${s.poster} ${s.invertTitle}`}>Tout, en une heure</h3>
              <ul className={s.invertList}>
                {(vip.includes ?? []).map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className={s.invertPrice}>{price(vip.price, "fr")}</div>
              <p className={s.invertWas}>
                au lieu de {price(vip.partsTotal ?? 0, "fr")} à la pièce
              </p>
              <a
                href={business.booking}
                target="_blank"
                rel="noopener"
                className={`${s.cta} ${s.ctaBlack}`}
              >
                Réserver le forfait
              </a>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className={`${s.shell} ${s.section}`}>
          <div className={s.secHead}>
            <h2 className={`${s.poster} ${s.secTitle}`}>Le travail</h2>
            <p className={s.secNote}>Des coupes faites au salon.</p>
          </div>
          <div className={s.grid}>
            {gallery.map((g) => (
              <figure key={g.src} className={s.cell}>
                <Image src={g.src} alt={g.alt} fill sizes="(max-width: 832px) 50vw, 25vw" />
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className={`${s.shell} ${s.section}`}>
        <div className={s.secHead}>
          <h2 className={`${s.poster} ${s.secTitle}`}>Nous trouver</h2>
        </div>

        <div className={s.two}>
          <div>
            <div className={s.label}>Adresse</div>
            <p className={s.addr}>331 boul. Saint-Joseph</p>
            <p style={{ color: "var(--dim)", marginTop: ".4rem" }}>
              {business.address.city} (QC), {business.address.sector}
            </p>
            <div className={s.actions}>
              <a href={directions} target="_blank" rel="noopener" className={`${s.cta} ${s.ctaLine}`}>
                Itinéraire
              </a>
              <a href={business.booking} target="_blank" rel="noopener" className={s.cta}>
                Réserver
              </a>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <div className={s.label}>Téléphone</div>
              <a href={`tel:${business.phone}`} className={s.tel}>
                {business.phoneDisplay}
              </a>
            </div>
          </div>

          <div>
            <div className={s.label}>Heures</div>
            <table className={s.hours}>
              <tbody>
                {week.map((d) => (
                  <tr key={d} className={today === d ? s.today : undefined}>
                    <th scope="row">{dayNames.fr[d]}</th>
                    <td className={s.mono}>
                      {formatTime(business.hours[d].open, "fr")} –{" "}
                      {formatTime(business.hours[d].close, "fr")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className={s.shell}>
        <footer className={s.foot}>
          © 2026 {business.name} — Réservations gérées par Squire
        </footer>
      </div>

      <a href={`tel:${business.phone}`} className={s.float}>
        {state && <span className={s.floatText}>{state.open ? "Appelez" : detail}</span>}
        <span className={s.floatIcon} aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
        </span>
      </a>

      <div className={s.bar}>
        <a href={`tel:${business.phone}`}>Appeler</a>
        <a href={business.booking} target="_blank" rel="noopener" className={s.barBook}>
          Réserver
        </a>
      </div>
    </div>
  );
}
