"use client";

import Image from "next/image";
import { business, services, vip } from "@/lib/business";
import { gallery } from "@/lib/gallery";
import { serviceCopy } from "@/lib/services-content";
import { duration, price } from "@/lib/content";
import { dayNames, formatTime, gatineauNow } from "@/lib/hours";
import { useOpen } from "@/lib/useOpen";
import { useEffect, useState } from "react";
import s from "./DesignA.module.css";

const week = [1, 2, 3, 4, 5, 6, 0];

export function DesignA() {
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
      <header className={s.shell}>
        <div className={s.head}>
          <span className={s.mark}>
            Royal<em>MK</em>
          </span>
          <div className={s.headRight}>
            <a href="#carte" className={s.navLink}>
              Services
            </a>
            <a href="#trouver" className={s.navLink}>
              Nous trouver
            </a>
            <span className={s.lang}>
              <a href="#" className={s.langOn}>
                FR
              </a>
              <a href="#" className={s.langOff}>
                EN
              </a>
            </span>
          </div>
        </div>
      </header>

      <section className={`${s.shell} ${s.hero} ${s.center}`}>
        <span className={s.openLine}>
          {state && (
            <>
              <span className={`${s.openDot} ${state.open ? s.openDotOn : ""}`} />
              {label} — {detail}
            </>
          )}
        </span>

        <h1 className={s.title}>
          Barbier
          <span className={s.titleItal}>à Gatineau</span>
        </h1>

        <div className={s.hairline} />

        <p className={s.lead}>
          Ouvert sept jours sur sept, sans rendez-vous. Coupe à 25 $, sur le boulevard
          Saint-Joseph.
        </p>

        <div className={s.actions}>
          <a href={business.booking} target="_blank" rel="noopener" className={`${s.btn} ${s.btnRed}`}>
            Réserver en ligne
          </a>
          <a href={`tel:${business.phone}`} className={`${s.btn} ${s.btnLine}`}>
            {business.phoneDisplay}
          </a>
        </div>

        <a href={business.maps} target="_blank" rel="noopener" className={s.score}>
          <b>4,9</b> sur 5 — 103 avis Google
        </a>

        <figure className={s.plate}>
          <div className={s.plateFrame}>
            <Image
              src="/salon.jpg"
              alt="La salle du Barbier RoyalMK, mur de brique et trois fauteuils."
              fill
              priority
              sizes="(max-width: 520px) 100vw, 480px"
            />
          </div>
          <figcaption className={s.caption}>
            331 boulevard Saint-Joseph, secteur Hull
          </figcaption>
        </figure>
      </section>

      <section id="carte" className={`${s.shell} ${s.section}`}>
        <div className={s.center}>
          <h2 className={s.sectionTitle}>La carte</h2>
          <p className={s.sectionNote}>Taxes en sus. Paiement au salon.</p>
        </div>

        <div className={s.menu}>
          {services.map((v) => (
            <a key={v.id} href={`/services/${v.slug}`} className={s.item}>
              <span className={s.itemName}>{v.name}</span>
              <span className={s.dots} aria-hidden />
              <span className={s.itemMin}>{duration(v.minutes, "fr")}</span>
              <span className={s.itemPrice}>{price(v.price, "fr")}</span>
            </a>
          ))}
        </div>

        <div className={s.vip}>
          <div className={s.vipLabel}>Forfait VIP</div>
          <div className={s.vipPrice}>{price(vip.price, "fr")}</div>
          <p className={s.vipWas}>
            au lieu de {price(vip.partsTotal ?? 0, "fr")} à la pièce — une heure réservée
          </p>
          <ul className={s.vipList}>
            {(vip.includes ?? []).map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <div className={s.actions}>
            <a
              href={business.booking}
              target="_blank"
              rel="noopener"
              className={`${s.btn} ${s.btnRed}`}
            >
              Réserver le forfait
            </a>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className={`${s.shell} ${s.section}`}>
          <div className={s.center}>
            <h2 className={s.sectionTitle}>Planches</h2>
            <p className={s.sectionNote}>Des coupes faites au salon.</p>
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

      <section id="trouver" className={`${s.shell} ${s.section}`}>
        <div className={s.center}>
          <h2 className={s.sectionTitle}>Nous trouver</h2>
        </div>

        <div className={s.two}>
          <div>
            <div className={s.label}>Adresse</div>
            <p className={s.addr}>{business.address.street}</p>
            <p style={{ color: "var(--steel)", marginTop: ".3rem" }}>
              {business.address.city} (QC), {business.address.sector}
            </p>
            <div className={s.actions} style={{ justifyContent: "flex-start" }}>
              <a href={directions} target="_blank" rel="noopener" className={`${s.btn} ${s.btnLine}`}>
                Itinéraire
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
                    <td>
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

      <footer className={`${s.shell} ${s.foot}`}>
        © 2026 {business.name}. Réservations gérées par Squire.
      </footer>

      <a href={`tel:${business.phone}`} className={s.float}>
        {state && <span className={s.floatText}>{state.open ? label : detail}</span>}
        <span className={s.floatRing} aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
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
