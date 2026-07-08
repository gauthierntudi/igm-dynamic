import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import {
  ensureCartographyProvincesAfterRead,
  ensureCartographyProvincesBeforeChange,
} from "../hooks/ensureCartographyProvinces";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";
import { getDeployedMapProvinces } from "../lib/cartography/provinceAssignments";

const DEPLOYED_PROVINCES = getDeployedMapProvinces();
const DEPLOYED_PROVINCE_COUNT = DEPLOYED_PROVINCES.length;

const DEPLOYED_PROVINCE_OPTIONS = DEPLOYED_PROVINCES.map((province) => ({
  label: province,
  value: province,
}));

export const CartographySettings: GlobalConfig = {
  slug: "cartography-settings",
  label: "Cartographie",
  admin: {
    group: "Contenu",
    description:
      "Les provinces déployées sur la carte sont listées automatiquement. Ajoutez les inspecteurs (nom obligatoire ; titre, photo et minerais optionnels) pour chaque province.",
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterRead: [ensureCartographyProvincesAfterRead],
    beforeChange: [ensureCartographyProvincesBeforeChange],
    afterChange: [revalidateFrontGlobal],
  },
  fields: [
    {
      name: "provinceAssignments",
      label: "Inspecteurs par province déployée",
      type: "array",
      labels: {
        singular: "Province",
        plural: "Provinces déployées",
      },
      minRows: DEPLOYED_PROVINCE_COUNT,
      maxRows: DEPLOYED_PROVINCE_COUNT,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "@/components/admin/CartographyProvinceRowLabel#CartographyProvinceRowLabel",
        },
        description:
          "Une ligne par province couverte sur la carte. Vous ne choisissez pas la province : elle est fixée. Renseignez seulement les inspecteurs.",
      },
      fields: [
        {
          name: "province",
          label: "Province",
          type: "select",
          required: true,
          options: DEPLOYED_PROVINCE_OPTIONS,
          admin: {
            readOnly: true,
          },
        },
        {
          name: "inspectors",
          label: "Inspecteurs",
          type: "array",
          labels: {
            singular: "Inspecteur",
            plural: "Inspecteurs",
          },
          fields: [
            {
              name: "name",
              label: "Nom de l'inspecteur",
              type: "text",
              required: true,
            },
            {
              name: "title",
              label: "Titre de l'inspecteur (optionnel)",
              type: "text",
              required: false,
            },
            {
              name: "photo",
              label: "Photo (optionnelle)",
              type: "upload",
              relationTo: "media",
              required: false,
            },
            {
              name: "minerals",
              label: "Minerais (optionnel)",
              type: "array",
              labels: {
                singular: "Minerai",
                plural: "Minerais",
              },
              admin: {
                description: "Ajoutez un ou plusieurs minerais suivis par cet inspecteur.",
              },
              fields: [
                {
                  name: "name",
                  label: "Nom du minerai",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
