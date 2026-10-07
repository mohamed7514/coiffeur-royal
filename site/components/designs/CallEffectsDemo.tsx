"use client";
import Image from "next/image";
import { useState } from "react";
import { business } from "@/lib/business";
import { content } from "@/lib/content";
import hero from "../HeroCanvas.module.css";
import styles from "./CallEffectsDemo.module.css";
import callEffects from "../CallEffects.module.css";
import { PhoneIcon } from "../PhoneIcon";

const effects = [
  { id: "combined", name: "Halo + sonnerie", description: "Les effets 1 et 3 ensemble : le halo respire doucement, et le t\u00e9l\u00e9phone fait deux petits mouvements au d\u00e9part." },
  { id: "halo", name: "Halo doux", description: "Un halo blanc respire doucement autour du bouton, puis laisse une pause." },
  { id: "sweep", name: "Balayage lumineux", description: "Un reflet traverse le bouton toutes les six secondes. Mon choix pour une touche moderne et discr\u00e8te." },
  { id: "ring", name: "Sonnerie visuelle", description: "Le t\u00e9l\u00e9phone fait deux petits mouvements au d\u00e9part, puis reste immobile. Rejoue pour le revoir." },
] as const;

export function CallEffectsDemo() {
  const [selected, setSelected] = useState<(typeof effects)[number]["id"]>("combined");
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = effects.find((effect) => effect.id === selected)!;
  const c = content.fr.hero;
  return (
    <main className={styles.page} data-paused={paused}>
      <header className={styles.header}>
        <a href="/" className="display">RoyalMK</a>
        <span className={styles.eyebrow}>Essai du bouton Appeler</span>
        <a href="/" className={styles.back}>Retour au site <span aria-hidden="true">{"\u2197"}</span></a>
      </header>
      <fieldset className={styles.selector}>
        <legend className={styles.legend}>Choisir un effet</legend>
        {effects.map((effect, index) => (
          <label key={effect.id} className={styles.option}>
            <input type="radio" name="call-effect" value={effect.id} checked={selected === effect.id} onChange={() => { setSelected(effect.id); setReplay(0); setPaused(false); }} />
            <span className={styles.optionBody}>
              <span className={styles.number}>{index === 0 ? "1 + 3" : "0" + index}</span>
              <span className={styles.optionName}>{effect.name}</span>
              {effect.id === "combined" && <span className={styles.recommended}>{"Ton choix"}</span>}
            </span>
          </label>
        ))}
      </fieldset>
      <section className={styles.stage} aria-label="Aperçu du bouton dans le hero">
        <div className={styles.backdrop} aria-hidden="true" />
        <div className={styles.photo}>
          <Image src="/frames/frame_0001.webp" alt="Coupe au salon RoyalMK vue de profil" fill unoptimized priority className={styles.image} />
        </div>
        <div className={hero.veil} aria-hidden="true" />
        <div className={styles.content}>
          <div className={hero.copy}>
            <h1 className={"display " + hero.title}>{c.h1a}<br />{c.h1b}</h1>
            <p className={hero.subtitle}>{c.lead1}</p>
            <a key={selected + replay} href={"tel:" + business.phone} className={hero.book + " " + callEffects.call + " " + (selected === "combined" ? callEffects.halo + " " + callEffects.ring : callEffects[selected])}>
              <span className={callEffects.callLabel}>
                <PhoneIcon />
                {c.call}
              </span>
              <span className={callEffects.arrow} aria-hidden="true">{"\u2192"}</span>
            </a>
          </div>
        </div>
      </section>
      <aside className={styles.details} aria-label="Commandes de l'aperçu">
        <div className={styles.description} role="status" aria-live="polite" aria-atomic="true">
          <h2>{active.name}</h2><p>{active.description}</p>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => { setReplay((value) => value + 1); setPaused(false); }} className={styles.control}>{"Rejouer l\u2019effet"} <span aria-hidden="true">{"\u21bb"}</span></button>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className={styles.control}>{paused ? "Reprendre" : "Pause"}</button>
        </div>
        <p className={styles.motionNote}>{"Animations d\u00e9sactiv\u00e9es selon les pr\u00e9f\u00e9rences de ton appareil."}</p>
      </aside>
      <p className={styles.footnote}>{"Le bouton Appeler utilise le vrai num\u00e9ro du salon : "}{business.phoneDisplay}.</p>
    </main>
  );
}