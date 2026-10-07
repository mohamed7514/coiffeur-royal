"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { business, services, vip } from "@/lib/business";
import { gallery } from "@/lib/gallery";
import { serviceCopy } from "@/lib/services-content";
import { duration, price } from "@/lib/content";
import { dayNames, formatTime, gatineauNow } from "@/lib/hours";
import { useOpen } from "@/lib/useOpen";
import s from "./DesignC.module.css";

const week = [1, 2, 3, 4, 5, 6, 0];

export function DesignC() {
  const { state, label, detail } = useOpen("fr");
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setToday(gatineauNow().day);
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;

  /* Les coordonnées réelles du salon : un détail que seul un lieu possède. */
  const coords = `${business.geo.lat.toFixed(4)}° N  ${Math.abs(business.geo.lng).toFixed(4)}° O`;

  return (
    <div className={s.root}>
      <section className={s.hero}>
        <div className={s.heroImg}>
          <Image
            src="/salon-hd.webp"
            alt="La salle du Barbier RoyalMK, mur de brique et trois fauteuils."
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className={s.heroVeil} aria-hidden />

        <header className={s.head}>
          <div className={`${s.shell} ${s.headIn}`}>
            <span className={s.mark}>
              Royal<span>MK</span>
            </span>
            <div className={s.headRight}>
              <a href="#services" className={s.navLink}>
                Services
              </a>
              <a href="#trouver" className={s.navLink}>
                Nous trouver
              </a>
              <span className={s.lang}>
                <a href="#" className={s.langOn}>
                  FR
                </a>
                <span style={{ color: "var(--line)" }}>/</span>
                <a href="#">EN</a>
              </span>
            </div>
          </div>
        </header>

        <div className={`${s.shell} ${s.heroIn}`}>
          <div>
            <span className={s.tag}>Barbier · Hommes et enfants</span>
            <h1 className={s.title}>
              Barbier
              <br />
              à Gatineau
            </h1>
            <div className={s.rule} />
            <p className={s.lead}>
              Ouvert sept jours sur sept, sans rendez-vous. Coupe à 25 $, sur le boulevard
              Saint-Joseph.
            </p>
            <div className={s.actions}>
              <a href={`tel:${business.phone}`} className={s.btn}>
                Appeler le salon
              </a>
              <a href={`tel:${business.phone}`} className={`${s.btn} ${s.btnLine} ${s.mono}`}>
                {business.phoneDisplay}
              </a>
            </div>
          </div>

          <div className={s.spec}>
            <div className={s.specRow}>
              <span className={s.tag}>État</span>
              <span className={`${s.specVal} ${state?.open ? s.specOn : ""}`}>
                {state ? label.toUpperCase() : "—"}
              </span>
            </div>
            <div className={s.specRow}>
              <span className={s.tag}>Aujourd’hui</span>
              <span className={s.specVal}>{state ? detail : "—"}</span>
            </div>
            <div className={s.specRow}>
              <span className={s.tag}>Google</span>
              <span className={s.specVal}>4,9 / 103 avis</span>
            </div>
            <div className={s.specRow}>
              <span className={s.tag}>Position</span>
              <span className={s.specVal}>{coords}</span>
            </div>
            <div className={s.specRow}>
              <span className={s.tag}>Secteur</span>
              <span className={s.specVal}>Hull, Gatineau</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={`${s.shell} ${s.section}`}>
        <div className={s.secHead}>
          <h2 className={s.secTitle}>Services</h2>
          <span className={s.tag}>Taxes en sus · Paiement au salon</span>
        </div>

        <table className={s.table}>
          <thead>
            <tr>
              <th>Service</th>
              <th>Durée</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {services.map((v) => (
              <tr key={v.id}>
                <td>
                  <a href={`/services/${v.slug}`} className={s.svcLink}>
                    {v.name}
                  </a>
                  <span className={s.svcTag}>{serviceCopy[v.id].fr.tagline}</span>
                </td>
                <td className={s.cellMono}>{duration(v.minutes, "fr")}</td>
                <td className={s.cellPrice}>{price(v.price, "fr")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.vip}>
          <div>
            <span className={s.tag}>Forfait VIP</span>
            <h3 className={s.vipTitle}>Tout, en une heure</h3>
            <ul className={s.vipList}>
              {(vip.includes ?? []).map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className={s.vipPrice}>{price(vip.price, "fr")}</div>
            <p className={s.vipWas}>
              au lieu de {price(vip.partsTotal ?? 0, "fr")} à la pièce — une heure réservée
            </p>
            <div className={s.actions}>
              <a href={`tel:${business.phone}`} className={s.btn}>
                Appeler le salon
              </a>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className={`${s.shell} ${s.section}`}>
          <div className={s.secHead}>
            <h2 className={s.secTitle}>Le travail</h2>
            <span className={s.tag}>Des coupes faites au salon</span>
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
        <div className={s.secHead}>
          <h2 className={s.secTitle}>Nous trouver</h2>
          <span className={`${s.tag} ${s.mono}`}>{coords}</span>
        </div>

        <div className={s.two}>
          <div>
            <span className={s.tag}>Adresse</span>
            <p className={s.addr}>331 boul. Saint-Joseph</p>
            <p style={{ color: "var(--dim)", marginTop: ".4rem" }}>
              {business.address.city} (QC), {business.address.sector}
            </p>
            <div className={s.actions}>
              <a href={directions} target="_blank" rel="noopener" className={`${s.btn} ${s.btnLine}`}>
                Itinéraire
              </a>
              <a href={`tel:${business.phone}`} className={s.btn}>
                Appeler
              </a>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <span className={s.tag}>Téléphone</span>
              <br />
              <a href={`tel:${business.phone}`} className={s.tel}>
                {business.phoneDisplay}
              </a>
            </div>
          </div>

          <div>
            <span className={s.tag}>Heures</span>
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
        © 2026 {business.name} · Sans rendez-vous, sept jours sur sept
      </footer>

      <a href={`tel:${business.phone}`} className={s.float}>
        {state && (
          <span className={s.floatText}>
            <b>{label}</b>
            {detail}
          </span>
        )}
        <span className={s.floatIcon} aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
        </span>
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
