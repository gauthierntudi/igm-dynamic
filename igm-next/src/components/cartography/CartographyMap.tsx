"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import {
  DRC_MAP_PROVINCES,
  isDrcMapProvince,
  isProvinceDeployed,
  provinceChefLieu,
  provinceLabel,
  provinceMarkerOffset,
  type DrcMapProvince,
} from "@/lib/cartography/provinces";
import { withDeployedBase } from "@/lib/deployBasePath";

import { useCartographyMapPanZoom } from "./useCartographyMapPanZoom";

type Props = {
  locale: SupportedLocale;
  selected: DrcMapProvince | null;
  onSelect: (province: DrcMapProvince | null) => void;
  mapAriaLabel: string;
  mapHint: string;
  mapMobileHint: string;
  mapResetLabel: string;
};

const PIN_URL = withDeployedBase("/assets/img/pin-carte.png");
/** Logo IGM circulaire — centré sur la province (pas une épingle pointe-bas). */
const PIN_SIZE = 44;
const LABEL_OFFSET_Y = PIN_SIZE / 2 + 10;
const MOBILE_LABEL_MQ = "(max-width: 991px)";
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

const MAP_COLORS = {
  deployed: "#e07320",
  deployedActive: "#22428e",
  undeployed: "#7a7a7a",
  neighbor: "#d7d6d6",
} as const;

function getMapLabelSizes(
  undeployed: boolean,
  isMobile: boolean,
): { province: number; capital: number } {
  if (isMobile) {
    return undeployed
      ? { province: 28, capital: 22 }
      : { province: 34, capital: 27 };
  }

  return undeployed
    ? { province: 20, capital: 16 }
    : { province: 22, capital: 18 };
}

function prepareProvinceShape(el: Element): SVGElement {
  const shape = el as SVGElement;
  // Le SVG source impose fill:none en style inline — on reprend la main via style.fill.
  shape.style.stroke = "rgba(12, 31, 61, 0.35)";
  shape.style.strokeWidth = "1.5px";
  shape.style.strokeMiterlimit = "10";
  shape.style.transition = "fill 160ms ease";
  return shape;
}

function applyProvinceFill(
  el: Element,
  name: DrcMapProvince,
  active: DrcMapProvince | null,
  hovered: DrcMapProvince | null,
): void {
  const shape = prepareProvinceShape(el);
  const deployed = isProvinceDeployed(name);
  const isActive = active === name;
  const isHovered = hovered === name && !isActive;

  if (!deployed) {
    shape.style.fill = MAP_COLORS.undeployed;
    shape.style.pointerEvents = "none";
    shape.style.cursor = "default";
    return;
  }

  shape.style.pointerEvents = "auto";
  shape.style.cursor = "pointer";
  shape.style.fill =
    isActive || isHovered ? MAP_COLORS.deployedActive : MAP_COLORS.deployed;
}

function isProvinceElement(element: Element | null): element is SVGGraphicsElement {
  if (!element?.closest('[data-name="Provinces"]')) return false;
  const name = element.getAttribute("data-name");
  return isDrcMapProvince(name) && isProvinceDeployed(name);
}

type Point = { x: number; y: number };

function parsePolygonPoints(el: SVGPolygonElement): Point[] {
  const raw = el.getAttribute("points");
  if (!raw) return [];

  const nums = raw.trim().split(/[\s,]+/).map(Number);
  const points: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (Number.isFinite(nums[i]) && Number.isFinite(nums[i + 1])) {
      points.push({ x: nums[i], y: nums[i + 1] });
    }
  }
  return points;
}

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonCentroid(points: Point[]): Point {
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const cross = points[i].x * points[j].y - points[j].x * points[i].y;
    area += cross;
    cx += (points[i].x + points[j].x) * cross;
    cy += (points[i].y + points[j].y) * cross;
  }

  area *= 0.5;
  if (Math.abs(area) < 1e-6) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }

  return { x: cx / (6 * area), y: cy / (6 * area) };
}

function polygonInteriorPoint(points: Point[]): Point {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bboxCenter = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };

  const centroid = polygonCentroid(points);
  for (const candidate of [centroid, bboxCenter]) {
    if (pointInPolygon(candidate, points)) return candidate;
  }

  const step = Math.max(maxX - minX, maxY - minY) / 24;
  for (let x = minX; x <= maxX; x += step) {
    for (let y = minY; y <= maxY; y += step) {
      const candidate = { x, y };
      if (pointInPolygon(candidate, points)) return candidate;
    }
  }

  return bboxCenter;
}

function getProvinceCenter(el: SVGGraphicsElement): Point {
  if (el instanceof SVGPolygonElement) {
    const fromAttribute = parsePolygonPoints(el);
    if (fromAttribute.length >= 3) return polygonInteriorPoint(fromAttribute);

    const points: Point[] = [];
    for (let i = 0; i < el.points.numberOfItems; i++) {
      const point = el.points.getItem(i);
      points.push({ x: point.x, y: point.y });
    }
    if (points.length >= 3) return polygonInteriorPoint(points);
  }

  const bbox = el.getBBox();
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };
}

function findProvinceElement(root: ParentNode, name: DrcMapProvince): SVGGraphicsElement | null {
  return root.querySelector(
    `[data-name="Provinces"] [data-name="${name}"]`,
  ) as SVGGraphicsElement | null;
}

function appendProvinceLabel(
  marker: SVGGElement,
  name: DrcMapProvince,
  locale: SupportedLocale,
  cx: number,
  labelY: number,
  undeployed = false,
  isMobile = false,
): void {
  const sizes = getMapLabelSizes(undeployed, isMobile);

  const label = document.createElementNS(SVG_NS, "text");
  label.setAttribute("class", "igm-map-marker__label");
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("x", String(cx));
  label.setAttribute("y", String(labelY));
  label.setAttribute("font-size", String(sizes.province));
  label.setAttribute("font-weight", "700");

  const provinceLine = document.createElementNS(SVG_NS, "tspan");
  provinceLine.setAttribute("class", "igm-map-marker__name");
  provinceLine.setAttribute("x", String(cx));
  provinceLine.setAttribute("dy", "0");
  provinceLine.textContent = provinceLabel(name, locale);

  const capitalLine = document.createElementNS(SVG_NS, "tspan");
  capitalLine.setAttribute("class", "igm-map-marker__capital");
  capitalLine.setAttribute("x", String(cx));
  capitalLine.setAttribute("dy", "1.35em");
  capitalLine.setAttribute("font-size", String(sizes.capital));
  capitalLine.textContent = provinceChefLieu(name, locale);

  label.appendChild(provinceLine);
  label.appendChild(capitalLine);
  marker.appendChild(label);
}

function styleNeighborCountries(root: HTMLDivElement): void {
  const group = root.querySelector('[data-name="Autres pays"]');
  if (!group) return;

  for (const shape of group.querySelectorAll("[data-name]")) {
    const el = shape as SVGElement;
    el.classList.add("igm-map-neighbor");
    el.style.fill = MAP_COLORS.neighbor;
    el.style.stroke = "rgba(12, 31, 61, 0.35)";
    el.style.strokeWidth = "1.5px";
    el.style.strokeMiterlimit = "10";
    el.style.pointerEvents = "none";
  }
}

function decorateProvinceMap(
  root: HTMLDivElement,
  locale: SupportedLocale,
  active: DrcMapProvince | null,
  isMobile: boolean,
): void {
  const svg = root.querySelector("svg");
  if (!svg) return;

  styleNeighborCountries(root);

  root.querySelector(".igm-map-overlays")?.remove();

  const overlays = document.createElementNS(SVG_NS, "g");
  overlays.setAttribute("class", "igm-map-overlays");
  overlays.setAttribute("aria-hidden", "true");

  for (const name of DRC_MAP_PROVINCES) {
    const el = findProvinceElement(root, name);
    if (!el) continue;

    const deployed = isProvinceDeployed(name);
    el.classList.add("igm-map-province");
    el.classList.toggle("igm-map-province--deployed", deployed);
    el.classList.toggle("igm-map-province--undeployed", !deployed);
    applyProvinceFill(el, name, active, null);

    const { x: cx, y: cy } = getProvinceCenter(el as SVGGraphicsElement);
    const offset = provinceMarkerOffset(name);

    const marker = document.createElementNS(SVG_NS, "g");
    marker.setAttribute(
      "class",
      deployed ? "igm-map-marker" : "igm-map-marker igm-map-marker--undeployed",
    );
    marker.setAttribute("data-province", name);
    marker.setAttribute("transform", `translate(${cx + offset.x}, ${cy + offset.y})`);

    if (!deployed) {
      el.removeAttribute("role");
      el.removeAttribute("tabindex");
      el.removeAttribute("aria-pressed");
      el.setAttribute(
        "aria-label",
        `${provinceLabel(name, locale)}, ${provinceChefLieu(name, locale)}`,
      );
      appendProvinceLabel(marker, name, locale, 0, -6, true, isMobile);
      overlays.appendChild(marker);
      continue;
    }

    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${provinceLabel(name, locale)}, ${provinceChefLieu(name, locale)}`);

    const pin = document.createElementNS(SVG_NS, "image");
    pin.setAttribute("href", PIN_URL);
    pin.setAttributeNS(XLINK_NS, "href", PIN_URL);
    pin.setAttribute("class", "igm-map-pin");
    pin.setAttribute("width", String(PIN_SIZE));
    pin.setAttribute("height", String(PIN_SIZE));
    pin.setAttribute("x", String(-PIN_SIZE / 2));
    pin.setAttribute("y", String(-PIN_SIZE / 2));
    marker.appendChild(pin);

    appendProvinceLabel(marker, name, locale, 0, LABEL_OFFSET_Y, false, isMobile);
    overlays.appendChild(marker);
  }

  svg.appendChild(overlays);
}

export function CartographyMap({
  locale,
  selected,
  onSelect,
  mapAriaLabel,
  mapHint,
  mapMobileHint,
  mapResetLabel,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { viewportRef, stageRef, isMobile, resetView, shouldSuppressClick } =
    useCartographyMapPanZoom(loaded);
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const syncProvinceState = useCallback(
    (active: DrcMapProvince | null, hovered: DrcMapProvince | null) => {
      const root = mapRef.current;
      if (!root) return;

      for (const name of DRC_MAP_PROVINCES) {
        const el = findProvinceElement(root, name);
        const marker = root.querySelector(`.igm-map-marker[data-province="${name}"]`);
        if (!el) continue;

        const isActive = active === name;
        const isHovered = hovered === name && active !== name;

        el.classList.toggle("is-selected", isActive);
        el.classList.toggle("is-hovered", isHovered);
        marker?.classList.toggle("is-selected", isActive);
        marker?.classList.toggle("is-hovered", isHovered);

        applyProvinceFill(el, name, active, hovered);

        if (isProvinceDeployed(name)) {
          el.setAttribute("aria-pressed", isActive ? "true" : "false");
        }
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    fetch(withDeployedBase("/cartographie/carte-rdc-igm.svg"))
      .then((response) => {
        if (!response.ok) throw new Error("map fetch failed");
        return response.text();
      })
      .then((svgMarkup) => {
        if (cancelled || !mapRef.current) return;

        mapRef.current.innerHTML = svgMarkup;
        const svg = mapRef.current.querySelector("svg");
        if (svg) {
          svg.classList.add("igm-cartography-map__svg");
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", mapAriaLabel);
        }

        requestAnimationFrame(() => {
          if (!mapRef.current) return;
          decorateProvinceMap(mapRef.current, locale, null, isMobileRef.current);
          setLoaded(true);
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, mapAriaLabel]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    decorateProvinceMap(mapRef.current, locale, selected, isMobile);
    syncProvinceState(selected, null);
  }, [isMobile, loaded, locale, selected, syncProvinceState]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const mq = window.matchMedia(MOBILE_LABEL_MQ);
    const onChange = () => {
      if (!mapRef.current) return;
      decorateProvinceMap(mapRef.current, locale, selected, mq.matches);
      syncProvinceState(selected, null);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [loaded, locale, selected, syncProvinceState]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || !loaded) return;

    const handlePointer = (event: Event) => {
      const target = event.target as Element | null;
      const provinceEl = target?.closest("[data-name]") ?? null;
      if (!isProvinceElement(provinceEl)) return;

      const name = provinceEl.getAttribute("data-name");
      if (!isDrcMapProvince(name) || !isProvinceDeployed(name)) return;

      if (event.type === "click") {
        if (shouldSuppressClick()) return;
        onSelect(selected === name ? null : name);
        if ("blur" in provinceEl && typeof provinceEl.blur === "function") {
          provinceEl.blur();
        }
        return;
      }

      if (event.type === "keydown" && (event as KeyboardEvent).key === "Enter") {
        event.preventDefault();
        onSelect(selected === name ? null : name);
      }
    };

    const handleOver = (event: Event) => {
      const target = event.target as Element | null;
      const provinceEl = target?.closest("[data-name]") ?? null;
      if (!isProvinceElement(provinceEl)) {
        syncProvinceState(selected, null);
        return;
      }
      const name = provinceEl.getAttribute("data-name");
      if (isDrcMapProvince(name) && isProvinceDeployed(name)) {
        syncProvinceState(selected, name);
      }
    };

    const handleOut = (event: Event) => {
      const related = (event as MouseEvent).relatedTarget as Node | null;
      if (related && shell.contains(related)) return;
      syncProvinceState(selected, null);
    };

    shell.addEventListener("click", handlePointer);
    shell.addEventListener("keydown", handlePointer);
    shell.addEventListener("mouseover", handleOver);
    shell.addEventListener("mouseout", handleOut);

    return () => {
      shell.removeEventListener("click", handlePointer);
      shell.removeEventListener("keydown", handlePointer);
      shell.removeEventListener("mouseover", handleOver);
      shell.removeEventListener("mouseout", handleOut);
    };
  }, [loaded, onSelect, selected, shouldSuppressClick, syncProvinceState]);

  if (error) {
    return (
      <div className="igm-cartography-map igm-cartography-map--error" role="alert">
        <p>{mapHint}</p>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`igm-cartography-map${isMobile ? " is-mobile-interactive" : ""}`}
    >
      {!loaded ? <p className="igm-cartography-map__loading">{mapHint}</p> : null}
      {isMobile && loaded ? (
        <div className="igm-cartography-map__mobile-bar">
          <p className="igm-cartography-map__mobile-hint">{mapMobileHint}</p>
          <button
            type="button"
            className="igm-cartography-map__reset"
            onClick={resetView}
            aria-label={mapResetLabel}
          >
            <RefreshCw size={18} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      ) : null}
      <div ref={viewportRef} className="igm-cartography-map__viewport">
        <div ref={stageRef} className="igm-cartography-map__stage">
          <div ref={mapRef} className="igm-cartography-map__canvas" aria-hidden={!loaded} />
        </div>
      </div>
    </div>
  );
}
