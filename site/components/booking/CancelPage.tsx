import type { Metadata } from "next";
import type { Locale } from "@/lib/content";
import { cancelCopy, cancelPaths } from "@/lib/booking/copy";
import { Nav } from "../Nav";
import { CancelBooking } from "./CancelBooking";
import s from "./Booking.module.css";

export function cancelMetadata(locale: Locale): Metadata {
  return {
    title: cancelCopy[locale].metaTitle,
    // Une page par client, derrière un lien privé : rien à indexer.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export function CancelPage({ locale, token }: { locale: Locale; token: string }) {
  return (
    <>
      {/* Changer de langue garde le jeton : sinon le lien ne mène plus à rien. */}
      <Nav
        locale={locale}
        languagePaths={{
          fr: `${cancelPaths.fr}?t=${encodeURIComponent(token)}`,
          en: `${cancelPaths.en}?t=${encodeURIComponent(token)}`,
        }}
      />
      <main className={`shell ${s.page}`}>
        <CancelBooking locale={locale} token={token} />
      </main>
    </>
  );
}
