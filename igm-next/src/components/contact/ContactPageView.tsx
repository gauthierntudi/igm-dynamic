import { Mail, MapPin, Phone } from "lucide-react";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMapSection } from "@/components/contact/ContactMapSection";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsSiteSettings } from "@/lib/cms/types";

import type { ResolvedContactPage } from "@/lib/cms/contact/types";

import "@/components/cms/who-we-are/about-page.css";
import "./contact-page.css";

type Props = {
  locale: SupportedLocale;
  settings: CmsSiteSettings | null;
  heroImageSrc: string;
  content: ResolvedContactPage;
};

export function ContactPageView({ locale, settings, heroImageSrc, content }: Props) {
  const t = getMessages(locale).contactPage;

  const phone = settings?.footerContactPhone?.trim() || settings?.phoneVert?.trim() || null;
  const email = settings?.footerContactEmail?.trim() || settings?.email?.trim() || null;
  const address = settings?.footerHqText?.trim() || settings?.address?.trim() || null;
  const infoLead = settings?.footerContactLead?.trim() || content.infoLead;

  return (
    <main className="igm-about-page igm-contact-page" data-igm-page="contact">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={content.heroTitle}
        breadcrumbTitle={content.heroTitle}
        heroImageSrc={heroImageSrc}
        subtitle={content.heroLead}
      />

      <section className="igm-contact-section">
        <div className="about-wrap igm-contact-layout">
          <div className="igm-contact-form-col">
            <p className="igm-contact-eyebrow">{content.eyebrow}</p>
            <h2 className="igm-contact-heading">{content.formTitle}</h2>
            <ContactForm locale={locale} />
          </div>

          <div className="igm-contact-info-wrap">
            <aside className="igm-contact-info-col" aria-label={content.infoTitle}>
              <h2 className="igm-contact-info-title">{content.infoTitle}</h2>
              {infoLead ? <p className="igm-contact-info-lead">{infoLead}</p> : null}

              <ul className="igm-contact-info-list">
                {address ? (
                  <li>
                    <span className="igm-contact-info-icon" aria-hidden>
                      <MapPin size={20} strokeWidth={2} />
                    </span>
                    <div>
                      <strong>{t.addressLabel}</strong>
                      <span>{address}</span>
                    </div>
                  </li>
                ) : null}

                {phone ? (
                  <li>
                    <span className="igm-contact-info-icon" aria-hidden>
                      <Phone size={20} strokeWidth={2} />
                    </span>
                    <div>
                      <strong>{t.phoneLabel}</strong>
                      <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                    </div>
                  </li>
                ) : null}

                {email ? (
                  <li>
                    <span className="igm-contact-info-icon" aria-hidden>
                      <Mail size={20} strokeWidth={2} />
                    </span>
                    <div>
                      <strong>{t.emailLabel}</strong>
                      <a href={`mailto:${email}`}>{email}</a>
                    </div>
                  </li>
                ) : null}
              </ul>
            </aside>
            <div className="igm-contact-info-tricolor" aria-hidden="true" />
          </div>
        </div>
      </section>

      <ContactMapSection locale={locale} address={address} />
    </main>
  );
}
