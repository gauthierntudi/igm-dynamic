import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: {
    singular: "Message contact",
    plural: "Messages contact",
  },
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["createdAt", "name", "email", "subject", "status"],
    listSearchableFields: ["name", "email", "phone", "subject", "message"],
    description:
      "Messages transmis via le formulaire de contact public. Les champs soumis ne sont pas modifiables.",
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "contactMessageDetail",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/ContactMessageDetailPanel#ContactMessageDetailPanel",
        },
      },
    },
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "email",
      type: "email",
      label: "E-mail",
      required: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "phone",
      type: "text",
      label: "Téléphone",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "subject",
      type: "text",
      label: "Objet",
      required: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      required: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "locale",
      type: "select",
      label: "Langue",
      options: [
        { label: "Français", value: "fr" },
        { label: "English", value: "en" },
      ],
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "status",
      type: "select",
      label: "Statut",
      defaultValue: "nouveau",
      options: [
        { label: "Nouveau", value: "nouveau" },
        { label: "Lu", value: "lu" },
      ],
      admin: { hidden: true },
    },
    {
      name: "notesInternes",
      type: "textarea",
      label: "Notes internes",
      admin: { hidden: true },
    },
  ],
};
