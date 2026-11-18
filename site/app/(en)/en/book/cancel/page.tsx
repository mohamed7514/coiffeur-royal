import { CancelPage, cancelMetadata } from "@/components/booking/CancelPage";

export const metadata = cancelMetadata("en");

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const { t } = await searchParams;
  return <CancelPage locale="en" token={typeof t === "string" ? t : ""} />;
}
