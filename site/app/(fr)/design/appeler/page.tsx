import type { Metadata } from "next";
import { CallEffectsDemo } from "@/components/designs/CallEffectsDemo";
export const metadata: Metadata = {
  title: "Essai du bouton Appeler | RoyalMK",
  robots: { index: false, follow: false },
  alternates: { canonical: "/design/appeler", languages: {} },
};
export default function Page() { return <CallEffectsDemo />; }