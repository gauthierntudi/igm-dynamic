import type { Messages } from "./messages";
import type { RouteKey } from "./paths";

export type NavLabelKey = keyof Messages["nav"];

export type NavItem =
  | { kind: "route"; routeKey: RouteKey; labelKey?: NavLabelKey; className?: string }
  | { kind: "dropdown"; labelKey: NavLabelKey; className?: string; items: NavItem[] }
  | { kind: "denounce"; className?: string };

/** Sous-menus de 2e niveau affichés avec la flèche caret (comme « Qui sommes-nous ? »). */
export const NESTED_DROPDOWN_CARET_KEYS = new Set<NavLabelKey>(["whoWeAre", "lcfcm"]);

export function navNestedIconStyle(labelKey: NavLabelKey): "caret" | "plus" {
  return NESTED_DROPDOWN_CARET_KEYS.has(labelKey) ? "caret" : "plus";
}

/** Structure du menu principal (header). */
export const MAIN_NAV: NavItem[] = [
  { kind: "route", routeKey: "home", labelKey: "home" },
  {
    kind: "dropdown",
    labelKey: "presentation",
    items: [
      {
        kind: "dropdown",
        labelKey: "whoWeAre",
        items: [
          { kind: "route", routeKey: "about", labelKey: "about" },
          { kind: "route", routeKey: "history", labelKey: "history" },
          { kind: "route", routeKey: "mission", labelKey: "mission" },
        ],
      },
      {
        kind: "dropdown",
        labelKey: "lcfcm",
        items: [
          { kind: "route", routeKey: "fraud", labelKey: "miningFraud" },
          { kind: "route", routeKey: "smuggling", labelKey: "miningSmuggling" },
          { kind: "denounce" },
          { kind: "route", routeKey: "sanctions", labelKey: "sanctions" },
        ],
      },
      { kind: "route", routeKey: "orgChart", labelKey: "orgChart" },
      { kind: "route", routeKey: "pressKit", labelKey: "pressKit" },
      { kind: "route", routeKey: "map", labelKey: "map" },
    ],
  },
  { kind: "route", routeKey: "news", labelKey: "news", className: "nav-hide-1020" },
  {
    kind: "dropdown",
    labelKey: "legislation",
    className: "nav-hide-1565",
    items: [
      { kind: "route", routeKey: "ordinances", labelKey: "ordinances" },
      { kind: "route", routeKey: "laws", labelKey: "laws" },
      { kind: "route", routeKey: "decrees", labelKey: "decrees" },
      { kind: "route", routeKey: "decisions", labelKey: "decisions" },
    ],
  },
  {
    kind: "dropdown",
    labelKey: "mediaLibrary",
    className: "nav-hide-1565",
    items: [
      { kind: "route", routeKey: "photos", labelKey: "photos" },
      { kind: "route", routeKey: "videos", labelKey: "videos" },
      { kind: "route", routeKey: "pressReview", labelKey: "pressReview" },
    ],
  },
  {
    kind: "dropdown",
    labelKey: "resources",
    className: "nav-show-1565",
    items: [
      { kind: "route", routeKey: "news", labelKey: "news", className: "nav-show-1020" },
      {
        kind: "dropdown",
        labelKey: "legislation",
        items: [
          { kind: "route", routeKey: "ordinances", labelKey: "ordinances" },
          { kind: "route", routeKey: "laws", labelKey: "laws" },
          { kind: "route", routeKey: "decrees", labelKey: "decrees" },
          { kind: "route", routeKey: "decisions", labelKey: "decisions" },
        ],
      },
      {
        kind: "dropdown",
        labelKey: "mediaLibrary",
        items: [
          { kind: "route", routeKey: "photos", labelKey: "photos" },
          { kind: "route", routeKey: "videos", labelKey: "videos" },
          { kind: "route", routeKey: "pressReview", labelKey: "pressReview" },
        ],
      },
      { kind: "route", routeKey: "contact", labelKey: "contact" },
    ],
  },
  { kind: "route", routeKey: "contact", labelKey: "contact", className: "nav-hide-1565" },
];
