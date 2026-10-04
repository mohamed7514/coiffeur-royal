import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allServices, serviceBySlug } from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { price } from "@/lib/content";
import { ServicePage } from "@/components/ServicePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return allServices.map((s) => ({ slug: s.slugEn }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug, "en");
  if (!s) return {};

  return {
    title: `${s.nameEn} in Gatineau — ${price(s.price, "en")} | Barbier RoyalMK`,
    description: serviceCopy[s.id].en.lead.slice(0, 155),
    alternates: {
      canonical: `/en/services/${s.slugEn}`,
      languages: {
        "en-CA": `/en/services/${s.slugEn}`,
        "fr-CA": `/services/${s.slug}`,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_CA",
      url: `/en/services/${s.slugEn}`,
      title: `${s.nameEn} in Gatineau — ${price(s.price, "en")}`,
      description: serviceCopy[s.id].en.tagline,
      images: [{ url: "/salon.jpg", width: 618, height: 800 }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug, "en");
  if (!service) notFound();
  return <ServicePage service={service} locale="en" />;
}
