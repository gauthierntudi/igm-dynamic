import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { hrefForRoute, localizeHref } from "@/i18n/paths";
import type { CmsHomeContactSection } from "@/lib/cms/home/types";

import { PrimaryBtn4Content } from "../banner/PrimaryBtn4Content";
import {
  defaultContactGallery,
  normalizeContactGalleryItem,
  resolveContactGallery,
} from "./resolveContactMedia";

type Props = {
  contactSection?: CmsHomeContactSection | null;
  locale: SupportedLocale;
};

function isReportHref(href: string, locale: SupportedLocale): boolean {
  const reportHref = hrefForRoute("report", locale);
  return href.includes("/denoncer") || href === reportHref || href.endsWith(reportHref);
}

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

  const cmsGallery = resolveContactGallery(contactSection?.gallery);
  const galleryItems =
    cmsGallery.length > 0
      ? cmsGallery.map((item, index) =>
          normalizeContactGalleryItem(item, contactSection?.gallery?.[index]),
        )
      : defaultContactGallery();

  return (
    <div className="home4-contact-section mb-130">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="contact-wrapper">
              <div className="contact-content">
                <div className="section-title2">
                  <h2>{title}</h2>
                  {lead ? <p>{lead}</p> : null}
                </div>
                <div className="home4-contact-btn-area active">
                  <a
                    className="primary-btn4"
                    href={buttonHref}
                    {...(opensSignalement ? { "data-igm-open-signalement": true } : {})}
                  >
                    <PrimaryBtn4Content label={buttonLabel} />
                  </a>
                  <ul className="img-list">
                    {galleryItems.map((item, index) => (
                      <li key={`${item.type}-${index}`}>
                        {item.type === "video" ? (
                          <video
                            className="video2"
                            autoPlay
                            loop
                            muted
                            playsInline
                            src={item.src}
                          />
                        ) : (
                          <img
                            src={item.src}
                            alt={item.alt}
                            width={item.width}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeContactSection;
