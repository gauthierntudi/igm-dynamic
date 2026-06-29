import type { Metadata } from "next";

import { DenoncerPageContent } from "@/components/signalement/DenoncerPageContent";
import { getMessages } from "@/i18n/messages";
import { buildSiteMetadata } from "@/lib/seo/buildSiteMetadata";

const locale = "fr";
const m = getMessages(locale).denoncer;

export const metadata: Metadata = buildSiteMetadata({
  title: m.metaTitle,
  description: m.metaDescription,
  pathname: "/denoncer",
  locale,
});

export default function DenoncerPage() {
  return <DenoncerPageContent locale={locale} />;
}
