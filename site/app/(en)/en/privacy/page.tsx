import { PrivacyPage, privacyMetadata } from "@/components/PrivacyPage";

export const metadata = privacyMetadata("en");

export default function Page() {
  return <PrivacyPage locale="en" />;
}
