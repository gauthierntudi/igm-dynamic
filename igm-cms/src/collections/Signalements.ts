import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";

const PROVINCES_RDC = [
  "Bas-Uele",
  "Équateur",
  "Haut-Katanga",
  "Haut-Lomami",
  "Haut-Uele",
  "Ituri",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Lomami",
  "Lualaba",
  "Mai-Ndombe",
  "Maniema",
  "Mongala",
  "Nord-Kivu",
  "Nord-Ubangi",
  "Sankuru",
  "Sud-Kivu",
  "Sud-Ubangi",
  "Tanganyika",
  "Tshopo",
  "Tshuapa",
];

const TYPES_INFRACTION = [
  "Exploitation illégale",
  "Contrebande",
  "Sous-déclaration",
  "Corruption",
  "Non-respect des obligations légales",
  "Autre",
];

export const Signalements: CollectionConfig = {
  slug: "signalements",
  labels: {
    singular: "Signalement",
    plural: "Signalements",
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["createdAt", "status", "province", "typeInfraction"],
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "status",
      type: "select",
      label: "Statut",
      defaultValue: "recu",
      options: [
        { label: "Reçu", value: "recu" },
        { label: "En cours", value: "en_cours" },
        { label: "Traité", value: "traite" },
        { label: "Clôturé", value: "cloture" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "group",
      name: "alerteur",
      label: "Lanceur d’alerte",
      fields: [
        { name: "nom", type: "text", label: "Nom" },
        { name: "email", type: "email", label: "Email" },
        { name: "tel", type: "text", label: "Téléphone" },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
    },
    {
      name: "province",
      type: "select",
      label: "Province",
      options: PROVINCES_RDC.map((p) => ({ label: p, value: p })),
    },
    {
      name: "villeSite",
      type: "text",
      label: "Ville / site",
    },
    {
      name: "coords",
      type: "text",
      label: "Coordonnées GPS",
    },
    {
      name: "typeInfraction",
      type: "select",
      label: "Type d’infraction",
      options: TYPES_INFRACTION.map((t) => ({ label: t, value: t })),
    },
    {
      name: "pieces",
      type: "relationship",
      relationTo: "signalement-files",
      hasMany: true,
      label: "Pièces jointes",
    },
    {
      name: "notesInternes",
      type: "textarea",
      label: "Notes internes",
      access: {
        read: isAdmin,
        update: isAdmin,
      },
    },
  ],
};
