import type { Metadata } from "next";
import { fontsC } from "@/lib/fonts";
import { DesignC } from "@/components/designs/DesignC";
import { Switcher } from "@/components/designs/Switcher";

export const metadata: Metadata = {
  title: "Design C — Atelier",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className={fontsC}>
      <DesignC />
      <Switcher current="c" />
    </div>
  );
}
