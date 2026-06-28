import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { PROVINCES_RDC, TYPES_INFRACTION } from "../lib/signalement/constants";

export const Signalements: CollectionConfig = {
  slug: "signalements",
  labels: {
    singular: "Signalement",
    plural: "Signalements",
  },
  admin: {
    useAsTitle: "reference",
    defaultColumns: [
      "reference",
      "createdAt",
      "status",
      "estAnonyme",
      "alerteur.nom",
      "province",
      "typeInfraction",
    ],
    listSearchableFields: [
      "reference",
      "description",
      "alerteur.nom",
      "alerteur.email",
      "alerteur.tel",
      "villeSite",
      "coords",
      "province",
      "typeInfraction",
    ],
    description:
      "Signalements transmis via le formulaire public. Consultation seule — les données transmises par les utilisateurs ne peuvent pas être modifiées.",
    disableDuplicate: true,
    disableBulkEdit: true,
  },
  access: {
    // Création réservée au formulaire public (Local API serveur, overrideAccess).
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "signalementDetail",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/SignalementDetailPanel#SignalementDetailPanel",
        },
      },
    },
    {
      name: "reference",
      type: "text",
      label: "Référence",
      unique: true,
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
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
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: "estAnonyme",
      type: "checkbox",
      label: "Signalement anonyme",
      defaultValue: false,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      type: "group",
      name: "alerteur",
      label: "Lanceur d’alerte",
      admin: {
        hidden: true,
        readOnly: true,
      },
      fields: [
        { name: "nom", type: "text", label: "Nom et prénom", admin: { readOnly: true } },
        { name: "email", type: "email", label: "Adresse e-mail", admin: { readOnly: true } },
        { name: "tel", type: "text", label: "Téléphone", admin: { readOnly: true } },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Description des faits",
      required: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      type: "row",
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: "province",
          type: "select",
          label: "Province",
          options: PROVINCES_RDC.map((p) => ({ label: p, value: p })),
          admin: { readOnly: true },
        },
        {
          name: "typeInfraction",
          type: "select",
          label: "Type d’infraction",
          options: TYPES_INFRACTION.map((t) => ({ label: t, value: t })),
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: "row",
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: "villeSite",
          type: "text",
          label: "Ville / site minier",
          admin: { readOnly: true },
        },
        {
          name: "coords",
          type: "text",
          label: "Coordonnées GPS",
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: "pieces",
      type: "relationship",
      relationTo: "signalement-files",
      hasMany: true,
      label: "Pièces jointes",
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: "notesInternes",
      type: "textarea",
      label: "Notes internes",
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
};
