import Image from "next/image";
import type { ServiceId } from "@/lib/business";
import type { Locale } from "@/lib/content";
import { homeServiceImages, serviceImages } from "@/lib/service-images";

export function ServicePhoto({ id, locale, sizes, className = "", preload = false, placement = "service" }: {
  id: ServiceId;
  locale: Locale;
  sizes: string;
  className?: string;
  preload?: boolean;
  placement?: "service" | "home";
}) {
  const photo = (placement === "home" ? homeServiceImages : serviceImages)[id];
  return (
    <span className={"service-photo " + className}>
      <Image src={photo.src} alt={photo.alt[locale]} fill quality={90} sizes={sizes} preload={preload} />
    </span>
  );
}
