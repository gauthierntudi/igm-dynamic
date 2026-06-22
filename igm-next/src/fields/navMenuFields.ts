import type { Field } from "payload";

import { CUSTOM_NAV_LINK_VALUE, SITE_NAV_LINK_OPTIONS } from "@/lib/siteNavLinks";

import { LOCALIZED } from "./localized";

const ITEM_TYPE_OPTIONS = [
  { label: "Lien", value: "link" },
  { label: "Menu déroulant", value: "dropdown" },
  { label: "Dénoncer (action)", value: "report" },
] as const;

const LEAF_TYPE_OPTIONS = [
  { label: "Lien", value: "link" },
  { label: "Dénoncer (action)", value: "report" },
] as const;

function itemTypeField(options: readonly { label: string; value: string }[]): Field {
  return {
    name: "itemType",
    type: "select",
    label: "Type",
    defaultValue: "link",
    required: true,
    options: [...options],
  };
}

function sharedNavFields(includeDropdownType: boolean): Field[] {
  const typeOptions = includeDropdownType ? ITEM_TYPE_OPTIONS : LEAF_TYPE_OPTIONS;

  return [
    itemTypeField(typeOptions),
    {
      name: "label",
      type: "text",
      label: "Libellé",
      required: true,
      ...LOCALIZED,
    },
    {
      name: "navLink",
      type: "select",
      label: "Page du site",
      options: [...SITE_NAV_LINK_OPTIONS],
      admin: {
        condition: (_, siblingData) => siblingData?.itemType === "link",
      },
    },
    {
      name: "customHref",
      type: "text",
      label: "URL personnalisée",
      admin: {
        condition: (_, siblingData) =>
          siblingData?.itemType === "link" && siblingData?.navLink === CUSTOM_NAV_LINK_VALUE,
        description: "Ex. https://…, mailto:…, ou un chemin non listé.",
      },
    },
    {
      name: "cssClass",
      type: "text",
      label: "Classe CSS (optionnel)",
      admin: {
        description: "Ex. nav-hide-1020, nav-show-1565, nav-show-1020",
      },
    },
    {
      name: "nestedIcon",
      type: "select",
      label: "Icône sous-menu",
      defaultValue: "plus",
      options: [
        { label: "Plus (+)", value: "plus" },
        { label: "Flèche (niveau 2)", value: "caret" },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.itemType === "dropdown",
      },
    },
  ];
}

/** Niveau 3 : liens feuilles uniquement (pas de sous-menu). */
const navMenuLeafFields: Field[] = sharedNavFields(false);

/** Niveau 2 : peut être un sous-menu avec feuilles. */
const navMenuSubItemFields: Field[] = [
  ...sharedNavFields(true),
  {
    name: "subItems",
    type: "array",
    label: "Sous-éléments (niveau 3)",
    labels: { singular: "Lien", plural: "Liens" },
    admin: {
      description: "Visible lorsque le type est « Menu déroulant ».",
      initCollapsed: true,
      components: {
        RowLabel: "@/components/admin/NavMenuRowLabel#NavMenuRowLabel",
      },
    },
    fields: navMenuLeafFields,
  },
];

/** Niveau 1 : éléments du menu principal. */
const navMenuItemFields: Field[] = [
  ...sharedNavFields(true),
  {
    name: "children",
    type: "array",
    label: "Sous-éléments (niveau 2)",
    labels: { singular: "Sous-élément", plural: "Sous-éléments" },
    admin: {
      description: "Visible lorsque le type est « Menu déroulant ».",
      initCollapsed: true,
      components: {
        RowLabel: "@/components/admin/NavMenuRowLabel#NavMenuRowLabel",
      },
    },
    fields: navMenuSubItemFields,
  },
];

export const headerNavField: Field = {
  name: "headerNav",
  type: "array",
  label: "Menu principal",
  labels: { singular: "Élément de menu", plural: "Éléments de menu" },
  admin: {
    description:
      "Navigation du header (FR / EN). Laissez vide pour conserver le menu par défaut du site.",
    initCollapsed: true,
    components: {
      RowLabel: "@/components/admin/NavMenuRowLabel#NavMenuRowLabel",
    },
  },
  fields: navMenuItemFields,
};

export const footerLinkFields: Field[] = [
  {
    name: "label",
    type: "text",
    label: "Libellé",
    required: true,
    ...LOCALIZED,
  },
  {
    name: "navLink",
    type: "select",
    label: "Page du site",
    options: [...SITE_NAV_LINK_OPTIONS],
  },
  {
    name: "customHref",
    type: "text",
    label: "URL personnalisée",
    admin: {
      condition: (_, siblingData) => siblingData?.navLink === CUSTOM_NAV_LINK_VALUE,
    },
  },
  {
    name: "openInNewTab",
    type: "checkbox",
    label: "Nouvel onglet",
    defaultValue: false,
  },
];
