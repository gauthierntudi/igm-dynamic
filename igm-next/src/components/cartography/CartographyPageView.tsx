"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useState } from "react";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { CartographyProvincePanel } from "@/components/cartography/CartographyProvincePanel";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsCartographySettings } from "@/lib/cms/cartography/types";
import {
  DEPLOYED_PROVINCES_COUNT,
  DRC_MAP_PROVINCES,
  isProvinceDeployed,
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
  heroTitle: string;
  heroSubtitle?: string;
  cartographySettings: CmsCartographySettings | null;
};

export function CartographyPageView({
  locale,
  heroImageSrc,
  heroTitle,
  heroSubtitle,
  cartographySettings,
}: Props) {
  const m = getMessages(locale).cartography;
  const [selected, setSelected] = useState<DrcMapProvince | null>(null);
  const pinSrc = withDeployedBase("/assets/img/pin-carte.png");

  const handleSelect = (province: DrcMapProvince | null) => {
    if (province && !isProvinceDeployed(province)) return;
    setSelected(province);
  };

  const selectedLabel = selected ? provinceLabel(selected, locale) : null;
  const selectedAssignment = selected
    ? cartographySettings?.provinceAssignments?.find((item) => item.province === selected)
    : null;
  const inspectors = selectedAssignment?.inspectors?.filter((inspector) => inspector?.name?.trim()) ?? [];

  return (
    <main className="igm-cartography-page" data-igm-page="cartography">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        subtitle={heroSubtitle}
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
                <p className="igm-cartography-legend__pick-selected">
                  <span className="igm-cartography-legend__pick-selected-mark" aria-hidden>
                    <img src={pinSrc} alt="" width={18} height={18} />
                  </span>
                  <span>{selectedLabel}</span>
                </p>
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

        {selected ? (
          <CartographyProvincePanel
            locale={locale}
            province={selected}
            physicalAddress={selectedAssignment?.physicalAddress}
            phone={selectedAssignment?.phone}
            inspectors={inspectors}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </section>
    </main>
  );
}
