import type { Metadata } from "next";
import { fontsB } from "@/lib/fonts";
import { DesignB } from "@/components/designs/DesignB";
import { Switcher } from "@/components/designs/Switcher";

export const metadata: Metadata = {
  title: "Design B — Affiche",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className={fontsB}>
      <DesignB />
      <Switcher current="b" />
    </div>
  );
}
