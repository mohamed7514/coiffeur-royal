import type { Metadata } from "next";
import { fontsD } from "@/lib/fonts";
import { DesignD } from "@/components/designs/DesignD";
import { Switcher } from "@/components/designs/Switcher";

export const metadata: Metadata = {
  title: "Design D — Crisp",
  robots: { index: false, follow: false },
};

export default function Page() {
  // Archivo (axe de largeur) pour les titres, Instrument Serif pour les
  // étiquettes : le couple de crispmtl.com, en polices libres.
  return (
    <div className={fontsD}>
      <DesignD />
      <Switcher current="d" />
    </div>
  );
}
