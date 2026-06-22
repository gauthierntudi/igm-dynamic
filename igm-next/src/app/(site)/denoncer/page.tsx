import type { Metadata } from "next";

import { DenoncerPageContent } from "@/components/signalement/DenoncerPageContent";
import { getMessages } from "@/i18n/messages";

const locale = "fr";
const m = getMessages(locale).denoncer;

export const metadata: Metadata = {
  title: m.metaTitle,
  description: m.metaDescription,
};

export default function DenoncerPage() {
  return <DenoncerPageContent locale={locale} />;
}
