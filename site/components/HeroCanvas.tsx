"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { business } from "@/lib/business";
import { content, type AnyCopy, type Locale } from "@/lib/content";
import { OpenNow } from "./OpenNow";

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
 * 2. Le poids. 72 frames ≈ 1,7 Mo, chargées avant l'affichage. C'est
 *    beaucoup pour une page qui reçoit du trafic payant : le compteur
 *    de chargement est là pour que l'attente soit lisible, et le
 *    `priority` du reste de la page doit en tenir compte.
 *
 * 3. L'épinglage. Pendant `PIN_LENGTH`, la page ne bouge plus : le
 *    visiteur défile et c'est l'image qui répond. Plus c'est long, plus
 *    la liste des prix est loin.
 */

const FRAME_COUNT = 72;
const FRAME_SRC = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

/** Durée de l'épinglage, en hauteurs d'écran. Plus c'est long, plus la
 *  liste des prix est loin — et plus il y a de défilement entre deux
 *  images, donc moins le mouvement est fin. 180 % tient la séquence
 *  entière sans que la page paraisse bloquée. */
const PIN_LENGTH = "+=180%";

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
    to: 0.34,
    title: `${c.hero.h1a} ${c.hero.h1b}`,
    sub: c.hero.lead1,
  },
  {
    from: 0.44,
    to: 1,
    title: c.hero.craft,
    sub: c.hero.craftSub,
  },
];

/** Largeur de la rampe d'apparition et de disparition d'un texte. */
const FADE = 0.09;
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
  const lastDrawn = useRef(-1);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* ── Préchargement ──────────────────────────────────────────────── */

  useEffect(() => {
    let alive = true;
    let loaded = 0;

    const images: HTMLImageElement[] = [];
    imagesRef.current = images;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";

      let counted = false;
      const done = async () => {
        if (counted || !alive) return;
        counted = true;
        // Télécharger ne suffit pas : sans `decode()`, le WebP n'est
        // décompressé qu'au premier `drawImage`, en plein défilement, et
        // chaque image neuve coûte alors une saccade.
        try {
          await img.decode();
        } catch {
          /* image manquante ou déjà décodée : le compteur avance quand même */
        }
        if (!alive) return;
        loaded++;
        setProgress(loaded / FRAME_COUNT);
        // La première image arrivée s'affiche tout de suite : le fond
        // noir d'attente ne dure que le temps d'un fichier.
        if (i === Math.round(frameRef.current)) draw(true);
        if (loaded === FRAME_COUNT) {
          setReady(true);
          ScrollTrigger.refresh();
        }
      };

      // Les gestionnaires d'abord, `src` ensuite : dans l'autre ordre,
      // une image servie par le cache a fini de charger avant qu'on
      // l'écoute, l'événement passe, et le compteur reste bloqué —
      // Canvas noir au rechargement. `complete` rattrape le cas où
      // l'événement est déjà passé malgré tout.
      img.onload = done;
      img.onerror = done;
      img.src = FRAME_SRC(i);
      if (img.complete) void done();

      images.push(img);
    }

    return () => {
      alive = false;
      for (const img of images) img.onload = img.onerror = null;
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

    // Le lissage du `scrub` continue d'appeler le rendu bien après que
    // l'image a cessé de changer visiblement. Un vingtième de frame vaut
    // ici environ un pixel de défilement : en dessous, il n'y a rien à
    // redessiner, et chaque redessin évité est un écran entier de moins
    // à rastériser.
    if (!forced && Math.abs(f - lastDrawn.current) < 0.05) return;
    lastDrawn.current = f;

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

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // 1,5× suffit ici. À 2×, un écran 1440 demande un Canvas de 2880 ×
    // 1800, soit 5,2 millions de pixels redessinés à chaque image — pour
    // une source de 540 px de large, déjà agrandie. Le gain de netteté
    // est nul, le coût double.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
      el.style.transform = `translate3d(0, ${(1 - alpha) * 18}px, 0)`;
      el.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
    });
  }

  /* ── Défilement et redimensionnement ────────────────────────────── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouvement réduit : une image fixe, les deux textes lisibles, et
    // surtout pas d'épinglage — c'est lui qui désoriente le plus.
    if (reduced) {
      frameRef.current = 0;
      draw(true);
      OVERLAYS.forEach((_, i) => {
        const el = overlayRefs.current[i];
        if (el) el.style.opacity = i === 0 ? "1" : "0";
      });
      const onResize = () => draw(true);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    gsap.registerPlugin(ScrollTrigger);

    // Sur mobile, l'apparition et la disparition de la barre d'adresse
    // change la hauteur d'écran et déclencherait un recalcul complet —
    // donc un saut en plein milieu de l'épinglage.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Le défilement doux du navigateur anime déjà chaque cran de molette
    // sur quelques centaines de millisecondes. Le `scrub` de GSAP lisse
    // ensuite cette position déjà lissée : deux amortis en série, et
    // l'image ne suit plus le geste. Il est désactivé le temps que ce
    // hero vive, et rendu à la page ensuite — les ancres du menu en ont
    // besoin, pas lui.
    const docEl = document.documentElement;
    const previousBehavior = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = "auto";

    const state = { frame: 0 };

    /**
     * Arrêt sur image nette.
     *
     * Le défilement s'arrête rarement pile sur une image : il reste une
     * fraction, donc deux poses mélangées, et l'œil lit ça comme un flou.
     * Dès que le `scrub` a fini de rattraper, la séquence glisse vers
     * l'image la plus proche. La page ne bouge pas — c'est l'image qui se
     * cale, d'un quart d'image au maximum, et le prochain geste reprend
     * la main.
     */
    let settleTween: gsap.core.Tween | null = null;

    const settle = () => {
      settleTween?.kill();
      const target = Math.round(frameRef.current);
      if (Math.abs(target - frameRef.current) < 0.01) return;
      const at = { f: frameRef.current };
      settleTween = gsap.to(at, {
        f: target,
        duration: 0.22,
        ease: "power2.out",
        onUpdate: () => {
          frameRef.current = at.f;
          draw(true);
        },
      });
    };

    // Le défilement est la seule commande : rien ne bouge tout seul.
    // Pas de `snap` non plus — l'index reste décimal, et c'est le fondu
    // entre images voisines qui fait la continuité.
    const tween = gsap.to(state, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      // Le rendu est piloté par le tween, pas par le ScrollTrigger.
      //
      // Le `scrub` continue d'animer `state.frame` après le dernier
      // événement de défilement, le temps de rattraper la position. Si on
      // ne redessine que depuis `scrollTrigger.onUpdate`, qui ne se
      // déclenche qu'au défilement, l'image reste figée là où elle était
      // au dernier événement : sur un geste rapide, la jauge annonçait
      // 50 % et l'image en était encore à la première frame.
      onUpdate: () => {
        frameRef.current = state.frame;
        draw();
      },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: PIN_LENGTH,
        pin: true,
        anticipatePin: 1,
        // Presque collé au geste : juste assez d'amorti pour absorber la
        // quantification de la molette, pas assez pour qu'on sente un
        // retard.
        scrub: 0.15,
        // Pas de `fastScrollEnd` ici : sur un geste rapide, il arrête le
        // scrub au lieu de le laisser rattraper, et la séquence reste
        // bloquée sur l'image de départ pendant que la jauge, elle,
        // continue d'avancer. Mesuré : jauge à 15 %, image encore à la
        // frame 0. Le calage sur `onScrubComplete` fait le travail sans
        // cet effet de bord.
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Ici, seulement ce qui dépend de la position de défilement :
          // la jauge et les textes. Le geste reprend la main sur le
          // calage en cours.
          settleTween?.kill();
          paintUi(self.progress);
        },
        // Déclenché quand le `scrub` a fini de rejoindre la position du
        // défilement : c'est le moment exact où l'on s'est arrêté.
        onScrubComplete: settle,
      },
    });

    paintUi(0);
    draw(true);

    const onResize = () => draw(true);
    window.addEventListener("resize", onResize);

    return () => {
      settleTween?.kill();
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("resize", onResize);
      docEl.style.scrollBehavior = previousBehavior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Rendu JSX ──────────────────────────────────────────────────── */

  return (
    <section
      ref={rootRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#0a090c] text-paper"
      aria-label={c.hero.sequenceAlt}
    >
      {/* La première image décide du LCP : elle part en même temps que le
          document, sans attendre que le JavaScript s'exécute. */}
      <link rel="preload" href={FRAME_SRC(0)} as="image" fetchPriority="high" />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      {/* Voile : il assoit le texte et unifie les 72 frames, dont les
          fonds varient légèrement d'une image à l'autre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.2) 55%), linear-gradient(to right, rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.05) 60%)",
        }}
      />

      {/* Chargement : un compteur, pas un spinner. Le visiteur voit ce
          qu'il attend et combien il en reste. */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-end justify-between px-4 pb-10 transition-opacity duration-500 md:px-8 ${
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

      {/* Les textes, superposés au même endroit : ils se relaient au lieu
          de s'empiler. */}
      {/* La marge à droite réserve la colonne de la jauge : sans elle, le
          titre passe dessous sur petit écran. */}
      <div className="pointer-events-none absolute inset-0 flex items-center px-4 pr-14 md:px-8 md:pr-20">
        <div className="relative w-full max-w-[34rem]">
          {OVERLAYS.map((o, i) => (
            <div
              key={o.title}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className={`${i === 0 ? "relative" : "absolute inset-0"} opacity-0`}
            >
              {/* Un seul h1 par page : les textes suivants sont des h2,
                  sinon la hiérarchie du document part en morceaux. */}
              {i === 0 ? (
                <>
                  {/* L'état réel du salon, au-dessus du titre : c'est la
                      première chose qu'un visiteur venu d'une annonce
                      veut savoir. */}
                  <OpenNow locale={locale} className="mb-5 text-paper/80" />
                  <h1 className="display text-[clamp(2.2rem,6vw,4.25rem)]">{o.title}</h1>
                </>
              ) : (
                <h2 className="display text-[clamp(2.2rem,6vw,4.25rem)]">{o.title}</h2>
              )}
              <p className="mt-5 max-w-[32ch] text-[1.02rem] text-paper/75">{o.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Jauge de progression, verticale, sur le bord droit : l'étape en
          cours, un rail qui se remplit sur toute la durée de l'épinglage,
          et l'invitation à défiler écrite dans le sens du rail.
          Le défilement est vertical, la jauge aussi — et sur le bord, elle
          ne dispute plus la place au titre ni au bouton. */}
      <div className="pointer-events-none absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4 md:right-8 md:gap-5">
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

      {/* CTA flottant, en verre dépoli. */}
      <a
        href={business.booking}
        target="_blank"
        rel="noopener"
        className="group absolute bottom-12 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-3 whitespace-nowrap border border-white/25 bg-white/10 px-5 py-3.5 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-paper backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/20 md:bottom-16 md:px-7 md:py-4 md:text-[0.85rem]"
      >
        {c.hero.chair}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </a>

      {/* Fondu vers le beige : la section suivante commence déjà ici. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(to top, var(--color-paper), rgb(245 244 241 / 0))",
        }}
      />
    </section>
  );
}
