import { BookingPage, bookingMetadata, serviceFromParam } from "@/components/booking/BookingPage";

export const metadata = bookingMetadata("fr");

export default async function Page({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const { service } = await searchParams;
  return <BookingPage locale="fr" service={serviceFromParam(service)} />;
}
