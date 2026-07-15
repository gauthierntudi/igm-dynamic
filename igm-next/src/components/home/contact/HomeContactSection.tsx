import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { hrefForRoute, localizeHref } from "@/i18n/paths";
import type { CmsHomeContactSection } from "@/lib/cms/home/types";

import { PrimaryBtn4Content } from "../banner/PrimaryBtn4Content";

type Props = {
  contactSection?: CmsHomeContactSection | null;
  locale: SupportedLocale;
};

function isReportHref(href: string, locale: SupportedLocale): boolean {
  const reportHref = hrefForRoute("report", locale);
  return href.includes("/denoncer") || href === reportHref || href.endsWith(reportHref);
}

const COPY = {
  fr: {
    eyebrow: "Signalement confidentiel",
    note: "Votre identité est protégée. Chaque alerte est traitée avec sérieux.",
  },
  en: {
    eyebrow: "Confidential reporting",
    note: "Your identity is protected. Every tip is handled seriously.",
  },
} as const;

export function hasContactContent(
  contactSection: CmsHomeContactSection | null | undefined,
): boolean {
  return Boolean(contactSection?.title?.trim());
}

export function HomeContactSection({ contactSection, locale }: Props) {
  if (!hasContactContent(contactSection)) return null;

  const title = contactSection!.title!.trim();
  const lead = contactSection?.lead?.trim();
  const buttonLabel =
    contactSection?.buttonLabel?.trim() || getMessages(locale).common.report;
  const buttonHref = localizeHref(
    contactSection?.buttonHref?.trim() || hrefForRoute("report", locale),
    locale,
  );
  const opensSignalement = isReportHref(buttonHref, locale);
  const copy = COPY[locale] ?? COPY.fr;

  return (
    <section className="home4-contact-section igm-home-contact mb-130" aria-labelledby="igm-home-contact-title">
      <div className="container">
        <div className="contact-wrapper igm-home-contact__panel">
          <div className="igm-home-contact__copy">
            <p className="igm-home-contact__eyebrow">{copy.eyebrow}</p>
            <div className="section-title2">
              <h2 id="igm-home-contact-title">{title}</h2>
              {lead ? <p>{lead}</p> : null}
            </div>
          </div>
          <div className="home4-contact-btn-area igm-home-contact__action active">
            <a
              className="primary-btn4 igm-home-contact__btn"
              href={buttonHref}
              {...(opensSignalement ? { "data-igm-open-signalement": true } : {})}
            >
              <PrimaryBtn4Content label={buttonLabel} />
            </a>
            <p className="igm-home-contact__note">{copy.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeContactSection;
