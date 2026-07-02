import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  clearSignalementFormDraft,
  loadSignalementFormDraft,
  loadSignalementModalOpen,
  saveSignalementFormDraft,
  saveSignalementModalOpen,
  SIGNALEMENT_MODAL_OPEN_KEY,
} from "@/lib/signalement/signalementFormDraft";
import { computeSignalementUploadOverallPercent } from "@/lib/signalement/submitSignalementClient";

function installSessionStorageMock(): void {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  });
}

describe("signalementFormDraft", () => {
  beforeEach(() => {
    installSessionStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sauvegarde et recharge un brouillon", () => {
    saveSignalementFormDraft({
      nom: "Jean",
      email: "a@b.c",
      tel: "+243",
      anonymousMode: false,
      description: "Faits",
      province: "Kinshasa",
      villeSite: "Gombe",
      coords: "1,2",
      typeInfraction: "Corruption",
      activeStep: 2,
    });

    const draft = loadSignalementFormDraft();
    expect(draft?.nom).toBe("Jean");
    expect(draft?.activeStep).toBe(2);
    expect(draft?.anonymousMode).toBe(false);
  });

  it("efface le brouillon", () => {
    saveSignalementFormDraft({
      nom: "",
      email: "",
      tel: "",
      anonymousMode: true,
      description: "x",
      province: "",
      villeSite: "",
      coords: "",
      typeInfraction: "",
      activeStep: 1,
    });
    clearSignalementFormDraft();
    expect(loadSignalementFormDraft()).toBeNull();
  });

  it("persiste l'état ouvert du modal", () => {
    expect(loadSignalementModalOpen()).toBe(false);
    saveSignalementModalOpen(true);
    expect(loadSignalementModalOpen()).toBe(true);
    expect(window.sessionStorage.getItem(SIGNALEMENT_MODAL_OPEN_KEY)).toBe("1");
    saveSignalementModalOpen(false);
    expect(loadSignalementModalOpen()).toBe(false);
  });

  it("ignore un brouillon expiré", () => {
    vi.useFakeTimers();
    saveSignalementFormDraft({
      nom: "Ancien",
      email: "",
      tel: "",
      anonymousMode: true,
      description: "",
      province: "",
      villeSite: "",
      coords: "",
      typeInfraction: "",
      activeStep: 0,
    });
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    expect(loadSignalementFormDraft()).toBeNull();
    vi.useRealTimers();
  });
});

describe("computeSignalementUploadOverallPercent", () => {
  it("calcule la progression globale sur plusieurs fichiers", () => {
    expect(
      computeSignalementUploadOverallPercent(
        { phase: "files", fileIndex: 1, fileTotal: 2, filePercent: 50 },
        2,
      ),
    ).toBe(17);

    expect(
      computeSignalementUploadOverallPercent(
        { phase: "final", fileIndex: 2, fileTotal: 2, filePercent: 100 },
        2,
      ),
    ).toBe(100);
  });

  it("gère l'envoi sans pièce jointe", () => {
    expect(
      computeSignalementUploadOverallPercent(
        { phase: "final", fileIndex: 0, fileTotal: 0, filePercent: 40 },
        0,
      ),
    ).toBe(40);
  });
});
