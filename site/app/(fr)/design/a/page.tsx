import type { Metadata } from "next";
import { fontsA } from "@/lib/fonts";
import { DesignA } from "@/components/designs/DesignA";
import { Switcher } from "@/components/designs/Switcher";

export const metadata: Metadata = {
  title: "Design A — Lame",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className={fontsA}>
      <DesignA />
      <Switcher current="a" />
    </div>
  );
}
