const STORAGE_KEY = "igm-signalement-form-draft";
const TTL_MS = 24 * 60 * 60 * 1000;

export const SIGNALEMENT_MODAL_OPEN_KEY = "igm-signalement-modal-open";

export type SignalementFormDraft = {
  nom: string;
  email: string;
  tel: string;
  anonymousMode: boolean;
  description: string;
  province: string;
  villeSite: string;
  coords: string;
  typeInfraction: string;
  activeStep: number;
  savedAt: number;
};

export type SignalementFormDraftInput = Omit<SignalementFormDraft, "savedAt">;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function loadSignalementFormDraft(): SignalementFormDraft | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SignalementFormDraft>;
    if (typeof parsed.savedAt !== "number" || Date.now() - parsed.savedAt > TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      nom: typeof parsed.nom === "string" ? parsed.nom : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      tel: typeof parsed.tel === "string" ? parsed.tel : "",
      anonymousMode: typeof parsed.anonymousMode === "boolean" ? parsed.anonymousMode : true,
      description: typeof parsed.description === "string" ? parsed.description : "",
      province: typeof parsed.province === "string" ? parsed.province : "",
      villeSite: typeof parsed.villeSite === "string" ? parsed.villeSite : "",
      coords: typeof parsed.coords === "string" ? parsed.coords : "",
      typeInfraction: typeof parsed.typeInfraction === "string" ? parsed.typeInfraction : "",
      activeStep:
        typeof parsed.activeStep === "number" && parsed.activeStep >= 0 ? parsed.activeStep : 0,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveSignalementFormDraft(draft: SignalementFormDraftInput): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    const payload: SignalementFormDraft = {
      ...draft,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / mode privé */
  }
}

export function clearSignalementFormDraft(): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadSignalementModalOpen(): boolean {
  if (!canUseSessionStorage()) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(SIGNALEMENT_MODAL_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveSignalementModalOpen(open: boolean): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    if (open) {
      window.sessionStorage.setItem(SIGNALEMENT_MODAL_OPEN_KEY, "1");
    } else {
      window.sessionStorage.removeItem(SIGNALEMENT_MODAL_OPEN_KEY);
    }
  } catch {
    /* ignore */
  }
}
