import type { TextField } from "payload";

import { normalizeHexColor } from "@/lib/cms/who-we-are/timelineColors";

type HexColorFieldOptions = {
  name: string;
  label: string;
  description?: string;
  width?: "50%" | "100%";
  presets?: readonly string[];
};

export function hexColorField({
  name,
  label,
  description,
  width = "50%",
  presets,
}: HexColorFieldOptions): TextField {
  return {
    name,
    type: "text",
    label,
    admin: {
      description,
      width,
      custom: { presets },
      components: {
        Field: "@/components/admin/HexColorPickerField#HexColorPickerField",
      },
    },
    validate: (value) => {
      if (!value) return true;
      return normalizeHexColor(value) ? true : "Couleur hex invalide (ex. #1b4491).";
    },
  };
}
