import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allServices, serviceBySlug } from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { price } from "@/lib/content";
import { ServicePage } from "@/components/ServicePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return allServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug, "fr");
  if (!s) return {};

  return {
    title: `${s.name} à Gatineau — ${price(s.price, "fr")} | Barbier RoyalMK`,
    description: serviceCopy[s.id].fr.lead.slice(0, 155),
    alternates: {
      canonical: `/services/${s.slug}`,
      languages: {
        "fr-CA": `/services/${s.slug}`,
        "en-CA": `/en/services/${s.slugEn}`,
      },
    },
    openGraph: {
      type: "article",
      locale: "fr_CA",
      url: `/services/${s.slug}`,
      title: `${s.name} à Gatineau — ${price(s.price, "fr")}`,
      description: serviceCopy[s.id].fr.tagline,
      images: [{ url: "/salon.jpg", width: 618, height: 800 }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug, "fr");
  if (!service) notFound();
  return <ServicePage service={service} locale="fr" />;
}
