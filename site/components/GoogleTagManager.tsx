import Script from "next/script";

/**
 * Conteneurs Google Tag Manager, tous chargés sur la même dataLayer :
 * chaque événement (booking_confirmed, phone_call_click…) est vu par les deux.
 * - GTM-TTSR9K6M : conteneur d'origine (Google Analytics, ancien compte Google Ads).
 * - GTM-NFJ2LFXQ : nouveau compte Google Ads, en transition. Ne pas y mettre
 *   Google Analytics, sinon chaque visite serait comptée deux fois.
 * Retirer l'ancien de cette liste quand le nouveau a repris toutes les balises.
 */
const CONTAINER_IDS = ["GTM-TTSR9K6M", "GTM-NFJ2LFXQ"] as const;

/** Load measurement after page resources, during idle time, in both languages.
 * Click handlers can queue events in dataLayer before the container is ready. */
export function GoogleTagManager() {
  return (
    <>
      {CONTAINER_IDS.map((id) => (
        <Script key={id} id={`royalmk-google-tag-manager-${id}`} strategy="lazyOnload">{
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`
        }</Script>
      ))}
    </>
  );
}

/** Keep immediately after the opening body tag, for browsers without JavaScript. */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      {CONTAINER_IDS.map((id) => (
        <iframe key={id} src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager" aria-hidden="true" />
      ))}
    </noscript>
  );
}
