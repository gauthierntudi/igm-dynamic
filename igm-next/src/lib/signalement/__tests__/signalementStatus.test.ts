import { describe, expect, it } from "vitest";

import {
  getSignalementStatusLabel,
  SIGNALEMENT_STATUS_LABELS,
  SIGNALEMENT_STATUS_OPTIONS,
} from "../signalementStatus";

describe("signalementStatus", () => {
  it("expose les quatre statuts métier attendus", () => {
    expect(SIGNALEMENT_STATUS_OPTIONS.map((option) => option.label)).toEqual([
      "Nouveau",
      "En cours d'analyse",
      "Traité",
      "Classé",
    ]);
  });

  it("retourne le libellé par défaut pour un statut absent", () => {
    expect(getSignalementStatusLabel(null)).toBe(SIGNALEMENT_STATUS_LABELS.recu);
  });
});
