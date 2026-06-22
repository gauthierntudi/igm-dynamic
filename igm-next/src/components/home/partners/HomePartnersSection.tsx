import type { CmsHomePartner, CmsHomePartnersSection } from "@/lib/cms/home/types";

import { resolvePartnerLogoSrc } from "./resolvePartnerMedia";

type ResolvedPartner = {
  id: string;
  name: string;
  lightSrc: string;
  darkSrc: string;
  url: string | null;
};

type Props = {
  partnersSection?: CmsHomePartnersSection | null;
};

function resolvePartnerHref(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return null;
  return trimmed;
}

function resolvePartners(items: CmsHomePartner[] | null | undefined): ResolvedPartner[] {
  if (!items?.length) return [];

  return items
    .map((item, index) => {
      const name = item.name?.trim();
      const lightSrc = resolvePartnerLogoSrc(item.logo);
      if (!name || !lightSrc) return null;

      const darkSrc = resolvePartnerLogoSrc(item.logoDark) ?? lightSrc;

      return {
        id: item.id ?? `partner-${index}`,
        name,
        lightSrc,
        darkSrc,
        url: resolvePartnerHref(item.url),
      };
    })
    .filter((item): item is ResolvedPartner => item !== null);
}

function PartnerLogo({
  src,
  alt,
  url,
}: {
  src: string;
  alt: string;
  url: string | null;
}) {
  const logo = (
    <span className="igm-partner-logo">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </span>
  );

  if (!url) return logo;

  const external = /^https?:\/\//i.test(url);

  return (
    <a
      className="igm-partner-logo-link"
      href={url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {logo}
    </a>
  );
}

function PartnerMarquee({
  partners,
  variant,
}: {
  partners: ResolvedPartner[];
  variant: "light" | "dark";
}) {
  const renderLogo = (partner: ResolvedPartner, groupKey: string) => (
    <PartnerLogo
      key={`${variant}-${groupKey}-${partner.id}`}
      src={variant === "light" ? partner.lightSrc : partner.darkSrc}
      alt={partner.name}
      url={partner.url}
    />
  );

  return (
    <div className={`marquee ${variant}`}>
      <div className="marquee__group">
        {partners.map((partner) => renderLogo(partner, "a"))}
      </div>
      <div aria-hidden="true" className="marquee__group">
        {partners.map((partner) => renderLogo(partner, "b"))}
      </div>
    </div>
  );
}

export function hasPartnersContent(
  partnersSection: CmsHomePartnersSection | null | undefined,
): boolean {
  if (!partnersSection) return false;
  const hasTitle = Boolean(partnersSection.title?.trim());
  const hasPartners = partnersSection.partners?.some(
    (item) => item.name?.trim() && resolvePartnerLogoSrc(item.logo),
  );
  return Boolean(hasTitle || hasPartners);
}

export function HomePartnersSection({ partnersSection }: Props) {
  const partners = resolvePartners(partnersSection?.partners);
  if (!hasPartnersContent(partnersSection) || partners.length === 0) {
    return null;
  }

  const title = partnersSection?.title?.trim() || "- Nos Partenaires -";

  return (
    <div className="partner-area four mb-100 mt-0">
      <div className="container">
        <div
          className="partner-title-area wow animate fadeInDown"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          <h6>{title}</h6>
        </div>
        <div className="partner-wrap">
          <PartnerMarquee partners={partners} variant="light" />
          <PartnerMarquee partners={partners} variant="dark" />
        </div>
      </div>
    </div>
  );
}

export default HomePartnersSection;
