"use client";

import dynamic from "next/dynamic";
import { MapPin, X } from "lucide-react";
import { useState } from "react";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import {
  DEPLOYED_PROVINCES_COUNT,
  DRC_MAP_PROVINCES,
  isProvinceDeployed,
  provinceChefLieu,
  provinceLabel,
  type DrcMapProvince,
} from "@/lib/cartography/provinces";
import { withDeployedBase } from "@/lib/deployBasePath";

import "../cms/who-we-are/about-page.css";
import "./cartography-page.css";

const CartographyMap = dynamic(
  () => import("./CartographyMap").then((mod) => mod.CartographyMap),
  {
    ssr: false,
    loading: () => (
      <div className="igm-cartography-map">
        <div className="igm-cartography-map__viewport igm-cartography-map__viewport--placeholder" />
      </div>
    ),
  },
);

type Props = {
  locale: SupportedLocale;
  heroImageSrc: string;
};

export function CartographyPageView({ locale, heroImageSrc }: Props) {
  const m = getMessages(locale).cartography;
  const [selected, setSelected] = useState<DrcMapProvince | null>(null);
  const pinSrc = withDeployedBase("/assets/img/pin-carte.png");

  const handleSelect = (province: DrcMapProvince | null) => {
    if (province && !isProvinceDeployed(province)) return;
    setSelected(province);
  };

  const selectedLabel = selected ? provinceLabel(selected, locale) : null;
  const selectedCapital = selected ? provinceChefLieu(selected, locale) : null;

  return (
    <main className="igm-cartography-page" data-igm-page="cartography">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={m.title}
        subtitle={m.subtitle}
        heroImageSrc={heroImageSrc}
      />

      <section className="igm-cartography-body">
        <div className="igm-cartography-wrap igm-cartography-layout">
          <div className="igm-cartography-map-panel">
            <CartographyMap
              locale={locale}
              selected={selected}
              onSelect={handleSelect}
              mapAriaLabel={m.mapAriaLabel}
              mapHint={m.mapHint}
              mapMobileHint={m.mapMobileHint}
              mapResetLabel={m.mapResetLabel}
            />
            <p className="igm-cartography-map-note">{m.mapHint}</p>
          </div>

          <aside className="igm-cartography-legend" aria-label={m.asideLabel}>
            <header className="igm-cartography-legend__head">
              <h2 className="igm-cartography-legend__title">{m.legendTitle}</h2>
            </header>

            <ul className="igm-cartography-legend__symbols" aria-label={m.legendTitle}>
              <li className="igm-cartography-legend__symbol">
                <span className="igm-cartography-legend__swatch igm-cartography-legend__swatch--deployed">
                  <img src={pinSrc} alt="" width={22} height={22} aria-hidden />
                </span>
                <span className="igm-cartography-legend__symbol-text">
                  <strong>{m.legendDeployedTitle}</strong>
                  <span>{m.legendDeployedDesc}</span>
                </span>
                <span className="igm-cartography-legend__count">{DEPLOYED_PROVINCES_COUNT}</span>
              </li>
              <li className="igm-cartography-legend__symbol">
                <span className="igm-cartography-legend__swatch igm-cartography-legend__swatch--undeployed">
                  <span className="igm-cartography-legend__dot" aria-hidden />
                </span>
                <span className="igm-cartography-legend__symbol-text">
                  <strong>{m.legendUndeployedTitle}</strong>
                  <span>{m.legendUndeployedDesc}</span>
                </span>
                <span className="igm-cartography-legend__count">
                  {DRC_MAP_PROVINCES.length - DEPLOYED_PROVINCES_COUNT}
                </span>
              </li>
              <li className="igm-cartography-legend__symbol">
                <span className="igm-cartography-legend__swatch igm-cartography-legend__swatch--neighbor" />
                <span className="igm-cartography-legend__symbol-text">
                  <strong>{m.legendNeighborTitle}</strong>
                  <span>{m.legendNeighborDesc}</span>
                </span>
              </li>
              <li className="igm-cartography-legend__symbol">
                <span className="igm-cartography-legend__swatch igm-cartography-legend__swatch--hover" />
                <span className="igm-cartography-legend__symbol-text">
                  <strong>{m.legendHoverTitle}</strong>
                  <span>{m.legendHoverDesc}</span>
                </span>
              </li>
            </ul>

            <div
              className={`igm-cartography-legend__pick${selected ? " is-selected" : ""}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {selected && selectedLabel ? (
                <article className="igm-cartography-legend__pick-card">
                  <div className="igm-cartography-legend__pick-row">
                    <span className="igm-cartography-legend__pick-mark" aria-hidden>
                      <img src={pinSrc} alt="" width={28} height={28} />
                    </span>
                    <div className="igm-cartography-legend__pick-body">
                      <h3 className="igm-cartography-legend__pick-name">{selectedLabel}</h3>
                      {selectedCapital ? (
                        <p className="igm-cartography-legend__pick-capital">{selectedCapital}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="igm-cartography-legend__pick-close"
                      onClick={() => setSelected(null)}
                      aria-label={m.focusClear}
                    >
                      <X size={16} strokeWidth={2.25} aria-hidden />
                    </button>
                  </div>
                  <p className="igm-cartography-legend__pick-status">
                    <span className="igm-cartography-legend__pick-status-dot" aria-hidden />
                    {m.focusDeployedBadge}
                  </p>
                </article>
              ) : (
                <div className="igm-cartography-legend__pick-empty">
                  <MapPin size={18} strokeWidth={1.75} aria-hidden />
                  <p>{m.focusEmptyHint}</p>
                </div>
              )}
            </div>

            <div className="igm-cartography-legend__stats">
              <div className="igm-cartography-legend__stat igm-cartography-legend__stat--provinces">
                <strong>{DRC_MAP_PROVINCES.length}</strong>
                <span>{m.provincesCountLabel}</span>
              </div>
              <div className="igm-cartography-legend__stat igm-cartography-legend__stat--deployed">
                <strong>{DEPLOYED_PROVINCES_COUNT}</strong>
                <span>{m.deploymentLabel}</span>
              </div>
            </div>

            <p className="igm-cartography-legend__footnote">{m.legendFootnote}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
