import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import {
  buildContactMapEmbedUrl,
  buildContactMapOpenUrl,
} from "@/lib/contact/buildContactMapEmbedUrl";

type Props = {
  locale: SupportedLocale;
  address: string | null;
};

export function ContactMapSection({ locale, address }: Props) {
  const t = getMessages(locale).contactPage;
  const embedUrl = buildContactMapEmbedUrl(address, locale);
  const openUrl = buildContactMapOpenUrl(address, locale);

  return (
    <section className="igm-contact-map-section" aria-label={t.mapSectionLabel}>
      <iframe
        title={t.mapIframeTitle}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <p className="igm-contact-map-fallback">
        <a href={openUrl} target="_blank" rel="noopener noreferrer">
          {t.mapOpenLink}
        </a>
      </p>
    </section>
  );
}
