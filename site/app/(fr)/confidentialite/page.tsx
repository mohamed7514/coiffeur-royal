import { PrivacyPage, privacyMetadata } from "@/components/PrivacyPage";

export const metadata = privacyMetadata("fr");

export default function Page() {
  return <PrivacyPage locale="fr" />;
}
