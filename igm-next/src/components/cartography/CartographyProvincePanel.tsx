"use client";

import { MapPin, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsCartographyInspector } from "@/lib/cms/cartography/types";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { provinceChefLieu, provinceLabel, type DrcMapProvince } from "@/lib/cartography/provinces";
import { withDeployedBase } from "@/lib/deployBasePath";

function inspectorMinerals(inspector: CmsCartographyInspector): string[] {
  return (inspector.minerals ?? [])
    .map((item) => (typeof item === "string" ? item : item?.name?.trim()))
    .filter((value): value is string => Boolean(value));
}

type Props = {
  locale: SupportedLocale;
  province: DrcMapProvince;
  physicalAddress?: string | null;
  phone?: string | null;
  inspectors: CmsCartographyInspector[];
  onClose: () => void;
};

export function CartographyProvincePanel({
  locale,
  province,
  physicalAddress,
  phone,
  inspectors,
  onClose,
}: Props) {
  const m = getMessages(locale).cartography;
  const pinSrc = withDeployedBase("/assets/img/pin-carte.png");
  const label = provinceLabel(province, locale);
  const capital = provinceChefLieu(province, locale);
  const address = physicalAddress?.trim() || null;
  const phoneNumber = phone?.trim() || null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="igm-cartography-province-modal" role="presentation">
      <button
        type="button"
        className="igm-cartography-province-modal__backdrop"
        onClick={onClose}
        aria-label={m.focusClear}
      />
      <section
        className="igm-cartography-province-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="igm-cartography-province-panel-title"
      >
        <header className="igm-cartography-province-panel__head">
          <div className="igm-cartography-province-panel__head-main">
            <span className="igm-cartography-province-panel__pin" aria-hidden>
              <img src={pinSrc} alt="" width={32} height={32} />
            </span>
            <div className="igm-cartography-province-panel__head-text">
              <h2
                id="igm-cartography-province-panel-title"
                className="igm-cartography-province-panel__title"
              >
                {label}
              </h2>
              <p className="igm-cartography-province-panel__capital">
                {m.capitalLabel} : {capital}
              </p>
              <p className="igm-cartography-province-panel__badge">
                <span className="igm-cartography-province-panel__badge-dot" aria-hidden />
                {m.focusDeployedBadge}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="igm-cartography-province-panel__close"
            onClick={onClose}
            aria-label={m.focusClear}
          >
            <X size={20} strokeWidth={2.25} aria-hidden />
          </button>
        </header>

        <div className="igm-cartography-province-panel__body">
          {address || phoneNumber ? (
            <div className="igm-cartography-province-panel__contact">
              {address ? (
                <div className="igm-cartography-province-panel__contact-item">
                  <MapPin size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <span className="igm-cartography-province-panel__contact-label">
                      {m.physicalAddressLabel}
                    </span>
                    <p className="igm-cartography-province-panel__contact-value">{address}</p>
                  </div>
                </div>
              ) : null}
              {phoneNumber ? (
                <div className="igm-cartography-province-panel__contact-item">
                  <Phone size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <span className="igm-cartography-province-panel__contact-label">
                      {m.phoneLabel}
                    </span>
                    <a
                      className="igm-cartography-province-panel__contact-value igm-cartography-province-panel__contact-link"
                      href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
                    >
                      {phoneNumber}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="igm-cartography-province-panel__inspectors-head">
            <h3 className="igm-cartography-province-panel__inspectors-title">{m.inspectorsTitle}</h3>
            {inspectors.length > 0 ? (
              <span className="igm-cartography-province-panel__inspectors-count" aria-hidden>
                {inspectors.length}
              </span>
            ) : null}
          </div>

          {inspectors.length > 0 ? (
            <ul className="igm-cartography-province-panel__list">
              {inspectors.map((inspector, index) => {
                const photo = tryResolveHeroMediaSrc(
                  typeof inspector.photo === "object" ? inspector.photo : null,
                );
                const title = inspector.title?.trim();
                const minerals = inspectorMinerals(inspector);

                return (
                  <li key={`${province}-${inspector.name}-${index}`}>
                    <article className="igm-cartography-inspector-card">
                      <div className="igm-cartography-inspector-card__profile">
                        {photo ? (
                          <img
                            src={photo}
                            alt={inspector.name}
                            className="igm-cartography-inspector-card__photo"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="igm-cartography-inspector-card__photo igm-cartography-inspector-card__photo--placeholder"
                            aria-hidden
                          >
                            {inspector.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}

                        <div className="igm-cartography-inspector-card__identity">
                          <h4 className="igm-cartography-inspector-card__name">{inspector.name}</h4>
                          {title ? (
                            <p className="igm-cartography-inspector-card__title">{title}</p>
                          ) : null}
                        </div>
                      </div>

                      {minerals.length > 0 ? (
                        <div className="igm-cartography-inspector-card__minerals">
                          <span className="igm-cartography-inspector-card__minerals-label">
                            {m.mineralsLabel}
                          </span>
                          <ul className="igm-cartography-inspector-card__mineral-tags">
                            {minerals.map((mineral) => (
                              <li key={`${inspector.name}-${mineral}`}>{mineral}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="igm-cartography-province-panel__empty">
              <MapPin size={18} strokeWidth={1.75} aria-hidden />
              {m.inspectorsEmpty}
            </p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
