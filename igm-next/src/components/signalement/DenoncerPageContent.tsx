import Link from "next/link";

import SignalementForm from "@/components/signalement/SignalementForm";
import { getMessages } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";

import styles from "@/app/(site)/denoncer/denoncer.module.css";

type Props = {
  locale: SupportedLocale;
};

export function DenoncerPageContent({ locale }: Props) {
  const m = getMessages(locale).denoncer;

  return (
    <main className={styles.page} data-igm-page="signalement">
      <div id="igm-signalement" className={styles.inner}>
        <Link href={hrefForRoute("home", locale)} className={styles.back}>
          {m.backHome}
        </Link>
        <h1 className={styles.title}>{m.title}</h1>
        <p className={styles.subtitle}>{m.subtitle}</p>
        <SignalementForm />
      </div>
    </main>
  );
}
