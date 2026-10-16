import Script from "next/script";

const CONTAINER_ID = "GTM-TTSR9K6M";

/** Load measurement after page resources, during idle time, in both languages.
 * Click handlers can queue events in dataLayer before the container is ready. */
export function GoogleTagManager() {
  return (
    <Script id="royalmk-google-tag-manager" strategy="lazyOnload">{
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${CONTAINER_ID}');`
    }</Script>
  );
}

/** Keep immediately after the opening body tag, for browsers without JavaScript. */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${CONTAINER_ID}`}
        height="0" width="0" style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager" aria-hidden="true" />
    </noscript>
  );
}
