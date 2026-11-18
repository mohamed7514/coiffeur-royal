import { CancelPage, cancelMetadata } from "@/components/booking/CancelPage";

export const metadata = cancelMetadata("fr");

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const { t } = await searchParams;
  return <CancelPage locale="fr" token={typeof t === "string" ? t : ""} />;
}
