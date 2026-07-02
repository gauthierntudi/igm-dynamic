import type { CollectionBeforeChangeHook } from "payload";

import type { Signalement } from "@/payload-types";

/** Limite les mises à jour admin au statut et aux notes internes. */
export const restrictSignalementAdminUpdate: CollectionBeforeChangeHook<Signalement> = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation !== "update" || !originalDoc) {
    return data;
  }

  return {
    ...originalDoc,
    status: data.status !== undefined ? data.status : originalDoc.status,
    notesInternes:
      data.notesInternes !== undefined ? data.notesInternes : originalDoc.notesInternes,
  };
};
