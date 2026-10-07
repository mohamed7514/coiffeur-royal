"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { business } from "@/lib/business";
import { content, type AnyCopy, type Locale } from "@/lib/content";
import styles from "./HeroCanvas.module.css";
import callEffects from "./CallEffects.module.css";
import { PhoneIcon } from "./PhoneIcon";

/**
 * Hero en séquence d'images, pilotée au défilement.
 *
 * Les 72 frames de `public/frames/` sont extraites de la vidéo du salon
 * (orbite autour de la tête du client, profil → nuque) par la commande
 * documentée dans le README. Le défilement fait tourner la tête, et rien
 * d'autre : pas de lecture automatique au repos. L'image ne bouge que
 * quand le visiteur, lui, fait quelque chose.
 *
 * Trois choses méritent d'être lues avant de toucher au code :
 *
 * 1. Le cadrage. Le Canvas n'a pas d'`object-fit` : il est refait à la
 *    main (`drawCover`), avec un point focal réglable. Une image 9:16
 *    recadrée en 16:9 perd 60 % de sa hauteur, et un centrage naïf
 *    coupe le dessus du crâne — c'est-à-dire la coupe.
 *
 * 2. La qualité. Les frames sont en 1080 × 1920, WebP qualité 90.
 *    Seules les images proches de la position courante sont décodées,
 *    pour garder les détails sans retenir toute la séquence en mémoire.
 *
 * 3. L'épinglage. Pendant la rotation, la page ne bouge plus : le
 *    visiteur défile et c'est l'image qui répond. Plus c'est long, plus
 *    la liste des prix est loin.
 */

const FRAME_COUNT = 72;
const FRAME_SRC = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

/** Durée de l'épinglage, en hauteurs d'écran. Plus c'est long, plus la
 *  liste des prix est loin — et plus il y a de défilement entre deux
 *  images, donc moins le mouvement est fin. 500 % sur ordinateur tient la séquence
 *  entière sans que la page paraisse bloquée. */
const PIN_DESKTOP = "+=500%";

/** Point focal de l'image, en fractions de sa largeur et de sa hauteur.
 *  La tête du client est au tiers haut : c'est ce point-là qui doit
 *  rester au centre de l'écran, pas le centre géométrique du fichier. */
const FOCUS_X = 0.5;
const FOCUS_Y = 0.4;

type Overlay = {
  from: number;
  to: number;
  title: string;
  sub: string;
};

/**
 * Les deux textes et leur fenêtre de progression, en fractions du
 * défilement.
 *
 * Le premier est le `h1` de la page : c'est lui qui porte « barbier à
 * Gatineau », et il doit rester ce qu'un moteur de recherche lit en
 * premier. Le second est la récompense du défilement, au moment où la
 * nuque apparaît — celui-là peut parler métier.
 */
const overlaysFor = (c: AnyCopy): Overlay[] => [
  {
    from: 0,
    to: 0.42,
    title: `${c.hero.h1a} ${c.hero.h1b}`,
    sub: c.hero.lead1,
  },
  {
    from: 0.42,
    to: 1,
    title: c.hero.craft,
    sub: c.hero.craftSub,
  },
];

/** Largeur de la rampe d'apparition et de disparition d'un texte. */
const FADE = 0.08;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function HeroCanvas({ locale }: { locale: Locale }) {
  const c = content[locale];
  const OVERLAYS = overlaysFor(c);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** Images préchargées et index courant, gardés hors du state React :
   *  ils changent à chaque frame de défilement, et un rendu React par
   *  frame coûterait le lissage. */
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const requestFramesRef = useRef<(frame: number) => void>(() => {});
  const lastDrawn = useRef(-1);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* ── Préchargement ──────────────────────────────────────────────── */

  useEffect(() => {
    let alive = true;
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;
    const pending = new Map<number, HTMLImageElement>();
    const failed = new Set<number>();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let wanted: number[] = [];
    let lastCenter = -1;
    let lastReduced = false;
    let firstFrameReady = false;

    // Dix images au plus dans le cache, trois décodages simultanés.
    // Garder les 72 images Full HD décodées coûterait près de 600 Mo.
    const pump = () => {
      if (!alive) return;
      for (const index of wanted) {
        if (pending.size >= 3) break;
        if (images[index] || pending.has(index) || failed.has(index)) continue;
        const img = new Image();
        img.decoding = "async";
        img.fetchPriority = index === wanted[0] ? "high" : "low";
        pending.set(index, img);
        let counted = false;
        const done = async () => {
          if (counted || !alive) return;
          counted = true;
          try { await img.decode(); } catch { /* échec traité ci-dessous */ }
          if (!alive || pending.get(index) !== img) return;
          pending.delete(index);
          if (img.naturalWidth && wanted.includes(index)) {
            images[index] = img;
            if (!firstFrameReady && (index === Math.floor(frameRef.current) || index === Math.ceil(frameRef.current))) {
              firstFrameReady = true;
              setProgress(1);
              setReady(true);
            }
            const current = Math.floor(frameRef.current);
            if (index === current || index === current + 1) draw(true);
          } else if (!img.naturalWidth) {
            failed.add(index);
          }
          pump();
        };
        img.onload = done;
        img.onerror = done;
        img.src = FRAME_SRC(index);
        if (img.complete) void done();
      }
    };

    const request = (frame: number) => {
      const reduced = motionQuery.matches;
      const center = reduced ? 0 : Math.floor(Math.max(0, Math.min(frame, FRAME_COUNT - 1)));
      if (center === lastCenter && reduced === lastReduced) return;
      lastCenter = center;
      lastReduced = reduced;
      wanted = reduced ? [0] : [center, center + 1, center - 1, center + 2,
        center - 2, center + 3, center - 3, center + 4, center - 4, center + 5]
        .filter((index) => index >= 0 && index < FRAME_COUNT);
      // Libérer les images éloignées ; les fichiers restent dans le cache HTTP.
      for (let index = 0; index < images.length; index++) {
        if (images[index] && !wanted.includes(index)) delete images[index];
      }
      for (const [index, img] of pending) {
        if (!wanted.includes(index)) {
          img.onload = img.onerror = null;
          pending.delete(index);
          img.src = "";
        }
      }
      pump();
    };
    requestFramesRef.current = request;
    request(frameRef.current);

    return () => {
      alive = false;
      requestFramesRef.current = () => {};
      for (const img of pending.values()) {
        img.onload = img.onerror = null;
        img.src = "";
      }
      pending.clear();
      imagesRef.current = [];
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Rendu ──────────────────────────────────────────────────────── */

  /**
   * Deux cadrages, parce qu'une seule règle ne peut pas tenir les deux
   * écrans.
   *
   * En portrait (mobile), l'écran a presque le format du fichier : un
   * `cover` classique, point focal au centre, et l'image remplit tout.
   *
   * En paysage (desktop), ce même `cover` agrandirait l'image deux fois
   * pour remplir la largeur — on n'y verrait plus qu'une oreille floue.
   * L'image est donc posée à pleine hauteur, en panneau vertical calé à
   * droite, et le fond est rempli par la même image réduite à quelques
   * pixels puis réétirée : un flou gratuit, qui suit les couleurs de
   * chaque frame au lieu d'un aplat noir.
   */
  const backdropRef = useRef<HTMLCanvasElement | null>(null);
  /** Les dégradés de bord ne dépendent que de la taille du Canvas :
   *  les recréer à chaque image coûtait une allocation par frame. */
  const edgesRef = useRef<{ key: string; left: CanvasGradient; right: CanvasGradient } | null>(
    null,
  );

  const isPortrait = (w: number, h: number) => w / h < 0.95;

  /** Portrait : l'écran a presque le format du fichier, donc `cover`. */
  function drawFull(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
  ) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(
      img,
      Math.min(0, Math.max(w - dw, w / 2 - dw * FOCUS_X)),
      Math.min(0, Math.max(h - dh, h / 2 - dh * FOCUS_Y)),
      dw,
      dh,
    );
  }

  /** Géométrie du panneau : calculée une fois par taille de Canvas. */
  function panelBox(img: HTMLImageElement, w: number, h: number) {
    const scale = h / img.naturalHeight;
    const dw = img.naturalWidth * scale;
    return { x: w * 0.66 - dw / 2, w: dw };
  }

  /**
   * Fond flou : réduction à 32 px de large, puis étirement lissé.
   *
   * L'assombrissement se fait au moment de réduire, sur 32 px de côté.
   * Appliqué à l'étirement plein écran, le même `ctx.filter` refaisait un
   * filtre logiciel sur des millions de pixels à chaque image.
   *
   * Dessiné une seule fois par image, jamais fondu : entre deux frames
   * voisines, un fond déjà flou ne change pas assez pour que l'œil le
   * voie, et le fondre revenait à rastériser tout l'écran deux fois.
   */
  function drawBackdrop(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
  ) {
    let small = backdropRef.current;
    if (!small) {
      small = document.createElement("canvas");
      small.width = 32;
      small.height = Math.round((32 * img.naturalHeight) / img.naturalWidth);
      backdropRef.current = small;
    }
    const sctx = small.getContext("2d");
    if (!sctx) return;
    sctx.filter = "brightness(0.5) saturate(0.7)";
    sctx.drawImage(img, 0, 0, small.width, small.height);
    ctx.drawImage(small, 0, 0, w, h);
  }

  /** Panneau net, à pleine hauteur, décalé vers la droite pour laisser la
   *  colonne de texte respirer à gauche. C'est la seule partie fondue. */
  function drawPanel(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
  ) {
    const box = panelBox(img, w, h);
    ctx.drawImage(img, box.x, 0, box.w, h);
  }

  /** Les deux bords du panneau, assombris : sans ça, la couture avec le
   *  fond flou se voit comme un trait. Appliqués après le fondu, sinon la
   *  vignette se superposait à elle-même pendant les transitions. */
  function drawEdges(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
  ) {
    const box = panelBox(img, w, h);
    const feather = Math.min(110, box.w / 3);
    const key = `${Math.round(w)}x${Math.round(h)}`;
    if (edgesRef.current?.key !== key) {
      const left = ctx.createLinearGradient(box.x, 0, box.x + feather, 0);
      left.addColorStop(0, "rgb(0 0 0 / 0.8)");
      left.addColorStop(1, "rgb(0 0 0 / 0)");
      const right = ctx.createLinearGradient(box.x + box.w, 0, box.x + box.w - feather, 0);
      right.addColorStop(0, "rgb(0 0 0 / 0.8)");
      right.addColorStop(1, "rgb(0 0 0 / 0)");
      edgesRef.current = { key, left, right };
    }
    ctx.fillStyle = edgesRef.current.left;
    ctx.fillRect(box.x, 0, feather, h);
    ctx.fillStyle = edgesRef.current.right;
    ctx.fillRect(box.x + box.w - feather, 0, feather, h);
  }

  /** `forced` : un redimensionnement ou une image fraîchement décodée
   *  doit redessiner même si l'index n'a pas bougé. */
  function draw(forced = false) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // L'index est gardé en décimal et les deux images voisines sont
    // fondues selon la fraction : à 72 images sur l'épinglage, l'écart
    // entre deux frames est assez faible pour que le fondu passe pour du
    // flou de mouvement plutôt que pour un dédoublement.
    const f = Math.min(Math.max(frameRef.current, 0), FRAME_COUNT - 1);
    requestFramesRef.current(f);

    // Le lissage du `scrub` continue d'appeler le rendu bien après que
    // l'image a cessé de changer visiblement. Un vingtième de frame vaut
    // ici environ un pixel de défilement : en dessous, il n'y a rien à
    // redessiner, et chaque redessin évité est un écran entier de moins
    // à rastériser.
    if (!forced && Math.abs(f - lastDrawn.current) < 0.05) return;

    const i0 = Math.floor(f);
    const i1 = Math.min(i0 + 1, FRAME_COUNT - 1);

    // Courbe du fondu. Linéaire, la séquence passe autant de temps à
    // 50/50 — deux poses superposées, donc une image qui paraît floue —
    // qu'à l'état net. Cette courbe traverse vite le milieu et s'attarde
    // aux extrémités : l'image est nette la plupart du temps, et le
    // mélange ne sert qu'à masquer le saut.
    const t = f - i0;
    const mix = t * t * t * (t * (t * 6 - 15) + 10);

    const img = imagesRef.current[i0];
    const next = imagesRef.current[i1];
    if (!img?.naturalWidth) return;
    lastDrawn.current = f;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // La source Full HD conserve les détails sur les écrans Retina.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const blend = mix > 0.01 && next?.naturalWidth && next !== img ? mix : 0;

    if (isPortrait(w, h)) {
      // L'image couvre tout l'écran : rien à effacer avant, elle recouvre.
      drawFull(ctx, img, w, h);
      if (blend) {
        ctx.globalAlpha = blend;
        drawFull(ctx, next, w, h);
        ctx.globalAlpha = 1;
      }
      return;
    }

    // Paysage : le fond flou et les vignettes sont posés une seule fois,
    // et seul le panneau net est fondu d'une frame à l'autre.
    drawBackdrop(ctx, img, w, h);
    drawPanel(ctx, img, w, h);
    if (blend) {
      ctx.globalAlpha = blend;
      drawPanel(ctx, next, w, h);
      ctx.globalAlpha = 1;
    }
    drawEdges(ctx, img, w, h);
  }

  const barRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const lastUi = useRef({ step: "", hint: "" });

  /** Opacité et décalage des textes, écrits directement dans le style :
   *  une mise à jour de state par frame de défilement serait du gâchis. */
  function paintUi(p: number) {
    // La jauge : sans elle, le visiteur ne sait pas combien de temps la
    // page va rester bloquée, et c'est ce qui rend un hero épinglé
    // pénible. Elle dit où on en est et qu'il y a une fin.
    if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;

    const step = `${String(OVERLAYS.filter((o) => p >= o.from).length).padStart(2, "0")} / ${String(
      OVERLAYS.length,
    ).padStart(2, "0")}`;
    if (stepRef.current && lastUi.current.step !== step) {
      stepRef.current.textContent = step;
      lastUi.current.step = step;
    }

    // L'invitation à défiler disparaît dès le premier geste ; à la fin,
    // elle annonce ce qui vient après, pour que la section se termine
    // sur une direction plutôt que sur un vide.
    const hint = p < 0.02 ? c.hero.scroll : p > 0.9 ? c.hero.next : "";
    if (hintRef.current && lastUi.current.hint !== hint) {
      hintRef.current.textContent = hint;
      hintRef.current.style.opacity = hint ? "1" : "0";
      lastUi.current.hint = hint;
    }

    OVERLAYS.forEach((o, i) => {
      const el = overlayRefs.current[i];
      if (!el) return;
      // Un texte qui commence à 0 est déjà là à l'arrivée sur la page :
      // pas de rampe d'entrée, sinon le hero s'ouvre sur un titre vide.
      const rampIn = o.from === 0 ? 1 : (p - o.from) / FADE;
      // Et un texte qui va jusqu'au bout reste lisible jusqu'au bout :
      // sinon il s'éteint pile au moment où l'épinglage se relâche.
      const rampOut = o.to >= 1 ? 1 : (o.to - p) / FADE;
      const alpha = clamp01(Math.min(rampIn, rampOut, 1));
      el.style.opacity = String(alpha);
      el.style.transform = `translate3d(0, ${(1 - alpha) * 10}px, 0)`;
      if (i > 0) el.setAttribute("aria-hidden", String(alpha === 0));
    });
  }

  /* ── Défilement et redimensionnement ────────────────────────────── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 768px)",
        mobile: "(max-width: 767px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduced } = context.conditions!;
        const onResize = () => draw(true);
        window.addEventListener("resize", onResize);
        if (reduced) {
          frameRef.current = 0;
          paintUi(0);
          draw(true);
          return () => window.removeEventListener("resize", onResize);
        }

        const docEl = document.documentElement;
        const previousBehavior = docEl.style.scrollBehavior;
        docEl.style.scrollBehavior = "auto";
        const state = { progress: 0 };
        let settleTween: gsap.core.Tween | null = null;

        const render = () => {
          const p = clamp01(state.progress);
          // Court arrêt au profil et à la nuque, avant la sortie du hero.
          frameRef.current = clamp01((p - 0.06) / 0.84) * (FRAME_COUNT - 1);
          draw();
          // L'image, les textes et la jauge suivent le même amorti.
          paintUi(p);
        };
        const settle = () => {
          settleTween?.kill();
          const target = Math.round(frameRef.current);
          if (Math.abs(target - frameRef.current) < 0.01) return;
          const at = { frame: frameRef.current };
          settleTween = gsap.to(at, {
            frame: target,
            duration: 0.18,
            ease: "power2.out",
            onUpdate: () => {
              frameRef.current = at.frame;
              draw(true);
            },
          });
        };
        const tween = gsap.to(state, {
          progress: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: desktop ? PIN_DESKTOP : "+=400%",
            pin: true,
            anticipatePin: 1,
            scrub: 0.5,
            // Garder le rattrapage sur un geste rapide, sans fastScrollEnd.
            invalidateOnRefresh: true,
            onUpdate: () => settleTween?.kill(),
            onScrubComplete: settle,
          },
        });
        render();
        draw(true);
        return () => {
          settleTween?.kill();
          tween.scrollTrigger?.kill();
          tween.kill();
          window.removeEventListener("resize", onResize);
          docEl.style.scrollBehavior = previousBehavior;
        };
      },
    );
    return () => media.revert();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Rendu JSX ──────────────────────────────────────────────────── */

  return (
    <section
      ref={rootRef}
      className={styles.hero}
      aria-label={c.hero.sequenceAlt}
    >
      {/* La première image décide du LCP : elle part en même temps que le
          document, sans attendre que le JavaScript s'exécute. */}
      <link rel="preload" href={FRAME_SRC(0)} as="image" fetchPriority="high" />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      <div aria-hidden className={styles.veil} />

      {/* Chargement : un compteur, pas un spinner. Le visiteur voit ce
          qu'il attend et combien il en reste. */}
      <div
        className={`${styles.loading} transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="text-[0.75rem] uppercase tracking-[0.12em] text-paper/60">
          {Math.round(progress * 100)} %
        </span>
        <span className="h-px flex-1 origin-left bg-paper/15 ml-4">
          <span
            className="block h-px bg-paper/70 transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </div>

      {/* La grille garde le bord inférieur des deux textes aligné. */}
      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.overlays}>
            {OVERLAYS.map((o, i) => (
              <div
                key={o.title}
                ref={(el) => { overlayRefs.current[i] = el; }}
                className={styles.overlay}
                style={{ opacity: i === 0 ? 1 : 0 }}
                aria-hidden={i > 0 ? true : undefined}
              >
                {i === 0 ? (
                  <h1 className={`display ${styles.title}`}>{o.title}</h1>
                ) : (
                  <h2 className={`display ${styles.title}`}>{o.title}</h2>
                )}
                <p className={styles.subtitle}>{o.sub}</p>
              </div>
            ))}
          </div>
          <a href={"tel:" + business.phone} className={styles.book + " " + callEffects.call + " " + callEffects.halo + " " + callEffects.ring}>
            <span className={callEffects.callLabel}><PhoneIcon />{c.hero.call}</span>
            <span aria-hidden className={callEffects.arrow}>{"\u2192"}</span>
          </a>
        </div>
      </div>

      {/* Jauge de progression, verticale, sur le bord droit : l'étape en
          cours, un rail qui se remplit sur toute la durée de l'épinglage,
          et l'invitation à défiler écrite dans le sens du rail.
          Le défilement est vertical, la jauge aussi — et sur le bord, elle
          ne dispute plus la place au titre ni au bouton. */}
      <div className={styles.gauge}>
        <span
          ref={stepRef}
          className="text-[0.72rem] font-bold tracking-[0.14em] text-paper [text-shadow:0_1px_6px_rgb(0_0_0/0.6)]"
        >
          01 / {String(OVERLAYS.length).padStart(2, "0")}
        </span>

        <div className="relative h-[22vh] w-0.5 overflow-hidden bg-paper/35 md:h-[30vh]">
          <div
            ref={barRef}
            className="h-full w-full origin-top bg-paper"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <span
          ref={hintRef}
          className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-paper transition-opacity duration-500 [text-shadow:0_1px_6px_rgb(0_0_0/0.6)] [writing-mode:vertical-rl]"
        >
          {c.hero.scroll}
        </span>
      </div>

      <div aria-hidden className={styles.exitFade} />
    </section>
  );
}
