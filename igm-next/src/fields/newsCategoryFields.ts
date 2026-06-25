import type { Field } from "payload";

import { LOCALIZED } from "./localized";
import { CUSTOM_NEWS_CATEGORY, NEWS_CATEGORY_OPTIONS } from "@/lib/newsCategories";

export const newsCategoryFields: Field[] = [
  {
    name: "category",
    type: "select",
    label: "Catégorie",
    required: true,
    options: [...NEWS_CATEGORY_OPTIONS],
    ...LOCALIZED,
  },
  {
    name: "categoryCustom",
    type: "text",
    label: "Catégorie personnalisée",
    ...LOCALIZED,
    admin: {
      condition: (_, siblingData) => siblingData?.category === CUSTOM_NEWS_CATEGORY,
      description: "Libellé affiché sur la carte et l'article lorsque « Personnaliser » est sélectionné.",
    },
  },
];
