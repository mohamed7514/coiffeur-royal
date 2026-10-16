import { LocalLandingPage } from "@/components/LocalLandingPage";
import { localLandingMetadata } from "@/lib/local-landing";

export const metadata = localLandingMetadata("en");

export default function Page() {
  return <LocalLandingPage locale="en" />;
}
