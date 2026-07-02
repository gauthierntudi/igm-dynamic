import type { Metadata } from "next";
import type { ReactNode } from "react";

import IgToastContainer from "@/components/providers/IgToastContainer";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";
import { LocaleContentKey } from "@/components/i18n/LocaleContentKey";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import SignalementAnchorBridge from "@/components/signalement/SignalementAnchorBridge";
import { SignalementModalProvider } from "@/components/signalement/SignalementModalProvider";
import ChatWidget from "@/components/chat/ChatWidget";
import { SiteHead } from "@/components/template/SiteHead";
import { SiteLoader } from "@/components/template/SiteLoader";
import { SiteScripts } from "@/components/template/SiteScripts";
import TemplateFooter from "@/components/template/Footer";
import TemplateHeader from "@/components/template/Header";
import { getSiteSettings } from "@/lib/cms/client";
import { getSiteOrigin } from "@/lib/seo/siteOrigin";
import { ENABLE_SITE_LOADER } from "@/lib/template/siteAssets";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "IGM — Inspection Générale des Mines",
    template: "%s",
  },
  openGraph: {
    siteName: "IGM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [settingsFr, settingsEn] = await Promise.all([
    getSiteSettings("fr"),
    getSiteSettings("en"),
  ]);

  return (
    <html lang="fr">
      <head>
        <SiteHead />
      </head>
      <body suppressHydrationWarning>
        {ENABLE_SITE_LOADER ? <SiteLoader /> : null}
        <SiteScripts />
        <LocaleProvider>
          <SiteSettingsProvider settingsByLocale={{ fr: settingsFr, en: settingsEn }}>
            <DocumentLang />
            <SignalementModalProvider>
              <SignalementAnchorBridge />
              <IgToastContainer />
              <TemplateHeader />
              <LocaleContentKey>{children}</LocaleContentKey>
              <TemplateFooter />
              <ChatWidget />
            </SignalementModalProvider>
          </SiteSettingsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
