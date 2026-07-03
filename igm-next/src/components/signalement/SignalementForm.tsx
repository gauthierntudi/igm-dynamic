"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/TurnstileWidget";
import { isTurnstileClientEnabled, turnstileSiteKey } from "@/lib/security/turnstileConfig";
import {
  clearSignalementFormDraft,
  loadSignalementFormDraft,
  saveSignalementFormDraft,
} from "@/lib/signalement/signalementFormDraft";
import {
  computeSignalementUploadOverallPercent,
  formatSignalementUploadProgressLabel,
  submitSignalementWithProgress,
  type UploadProgress,
} from "@/lib/signalement/submitSignalementClient";
import {
  isAllowedSignalementMime,
  isSignalementAudioMime,
  isSignalementVideoMime,
  MAX_SIGNALEMENT_FILE_BYTES,
  MAX_SIGNALEMENT_FILES,
  MAX_SIGNALEMENT_TOTAL_BYTES,
  MAX_SIGNALEMENT_VIDEO_FILE_BYTES,
  maxSignalementFileBytes,
} from "@/lib/signalement/constants";

import styles from "./SignalementForm.module.css";

const MAX_FILES = MAX_SIGNALEMENT_FILES;
const ACCEPT_PHOTOS_VIDEOS = "image/jpeg,image/png,video/*,.mp4,.mov,.m4v,.avi,.mkv,.webm";
const ACCEPT_AUDIO = "audio/*,.webm,.mp3,.wav,.m4a,.ogg";

const PROVINCES_RDC = [
  "",
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
  "",
  "Exploitation illégale",
  "Contrebande",
  "Sous-déclaration",
  "Corruption",
  "Non-respect des obligations légales",
  "Autre",
];

const STEP_DEFINITIONS = [
  { short: "Lanceur", title: "Informations sur le lanceur d’alerte" },
  { short: "Description", title: "Description de l’infraction" },
  { short: "Lieu", title: "Localisation" },
  { short: "Type", title: "Type d’infraction" },
  { short: "Fichiers", title: "Pièces jointes" },
] as const;

const LAST_STEP_INDEX = STEP_DEFINITIONS.length - 1;

type Attachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type IgmSpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): IgmSpeechRecognitionCtor | null {
  const w = window as typeof window & {
    SpeechRecognition?: IgmSpeechRecognitionCtor;
    webkitSpeechRecognition?: IgmSpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function formatGeolocationLine(pos: GeolocationPosition): string {
  const { latitude, longitude, accuracy } = pos.coords;
  const core = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  if (typeof accuracy === "number" && accuracy > 0 && accuracy < 15000) {
    return `${core} (précision ~${Math.round(accuracy)} m)`;
  }
  return core;
}

type SignalementFormProps = {
  onSuccess?: () => void;
  /** Vrai pendant l’envoi (upload) — bloque fermeture modal / refresh. */
  onSubmittingChange?: (submitting: boolean) => void;
};

const SUCCESS_AUTO_CLOSE_MS = 9000;

function validateNonAnonymousContact(
  nom: string,
  email: string,
  tel: string,
): string | null {
  if (!nom.trim()) {
    return "Indiquez votre nom et prénom.";
  }

  const emailTrimmed = email.trim();
  const telTrimmed = tel.trim();

  if (!emailTrimmed && !telTrimmed) {
    return "Indiquez un e-mail ou un numéro de téléphone.";
  }

  if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return "Adresse e-mail invalide.";
  }

  return null;
}

export default function SignalementForm({ onSuccess, onSubmittingChange }: SignalementFormProps = {}) {
  const formId = useId();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioPickRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = isTurnstileClientEnabled();
  const turnstileSiteKeyValue = turnstileSiteKey();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [villeSite, setVilleSite] = useState("");
  const [coords, setCoords] = useState("");
  const [typeInfraction, setTypeInfraction] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const previewAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [previewAudioPlayingId, setPreviewAudioPlayingId] = useState<string | null>(null);
  const [previewAudioUiTick, setPreviewAudioUiTick] = useState(0);

  const [dictationSupported, setDictationSupported] = useState(false);
  const [dictationActive, setDictationActive] = useState(false);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  /** L’utilisateur a activé la dictée (reste vrai jusqu’au toggle off, pour survivre aux `onend` du moteur). */
  const dictationWantedRef = useRef(false);

  const [recordingState, setRecordingState] = useState<"idle" | "recording">("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [geoLoading, setGeoLoading] = useState(false);
  const autoGeoStep2Ref = useRef(false);
  const draftHydratedRef = useRef(false);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const draft = loadSignalementFormDraft();
    if (draft) {
      setNom(draft.nom);
      setEmail(draft.email);
      setTel(draft.tel);
      setAnonymousMode(draft.anonymousMode);
      setDescription(draft.description);
      setProvince(draft.province);
      setVilleSite(draft.villeSite);
      setCoords(draft.coords);
      setTypeInfraction(draft.typeInfraction);
      setActiveStep(Math.min(draft.activeStep, LAST_STEP_INDEX));
    }
    draftHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!draftHydratedRef.current || submitting) {
      return;
    }

    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(() => {
      saveSignalementFormDraft({
        nom,
        email,
        tel,
        anonymousMode,
        description,
        province,
        villeSite,
        coords,
        typeInfraction,
        activeStep,
      });
    }, 280);

    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [
    activeStep,
    anonymousMode,
    coords,
    description,
    email,
    nom,
    province,
    submitting,
    tel,
    typeInfraction,
    villeSite,
  ]);

  useEffect(() => {
    onSubmittingChange?.(submitting);
  }, [onSubmittingChange, submitting]);

  useEffect(() => {
    if (!submitting) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [submitting]);

  const dismissSubmitSuccess = useCallback(() => {
    setSubmitSuccessMessage(null);
    onSuccess?.();
  }, [onSuccess]);

  useEffect(() => {
    if (!submitSuccessMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      dismissSubmitSuccess();
    }, SUCCESS_AUTO_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [dismissSubmitSuccess, submitSuccessMessage]);

  useEffect(() => {
    setDictationSupported(!!getSpeechRecognitionCtor());
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    toast.error("Contrôle de sécurité indisponible. Réessayez.");
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const attachmentsRef = useRef<Attachment[]>([]);
  attachmentsRef.current = attachments;

  useEffect(() => {
    return () => {
      stopStream();
      attachmentsRef.current.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      dictationWantedRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, [stopStream]);

  const addAttachments = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    setAttachments((prev) => {
      let err: string | null = null;
      if (prev.length + list.length > MAX_FILES) {
        err = `Max. ${MAX_FILES} fichiers.`;
      } else {
        for (const f of list) {
          const mime = f.type || "application/octet-stream";
          const maxBytes = maxSignalementFileBytes(mime, f.name);
          if (f.size > maxBytes) {
            err = `Fichier trop lourd (max ${formatBytes(maxBytes)}).`;
            break;
          }
          if (!isAllowedSignalementMime(mime, f.name)) {
            err = "Type de fichier non autorisé (photos, audio ou vidéo).";
            break;
          }
        }
      }
      if (err) {
        requestAnimationFrame(() => toast.error(err));
        return prev;
      }
      const added = list.map((file) => ({
        id: uid(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...added];
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    const el = previewAudioRefs.current[id];
    if (el) {
      try {
        el.pause();
      } catch {
        /* ignore */
      }
      delete previewAudioRefs.current[id];
    }
    setPreviewAudioPlayingId((p) => (p === id ? null : p));
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const pauseAllPreviewAudios = useCallback(() => {
    Object.values(previewAudioRefs.current).forEach((node) => {
      if (!node) return;
      try {
        node.pause();
      } catch {
        /* ignore */
      }
    });
    setPreviewAudioPlayingId(null);
  }, []);

  const togglePreviewAudio = useCallback(
    (id: string) => {
      const el = previewAudioRefs.current[id];
      if (!el) return;
      if (!el.paused) {
        el.pause();
        setPreviewAudioPlayingId(null);
        setPreviewAudioUiTick((n) => n + 1);
        return;
      }
      Object.entries(previewAudioRefs.current).forEach(([otherId, other]) => {
        if (other && otherId !== id) {
          try {
            other.pause();
          } catch {
            /* ignore */
          }
        }
      });
      void el
        .play()
        .then(() => {
          setPreviewAudioPlayingId(id);
          setPreviewAudioUiTick((n) => n + 1);
        })
        .catch(() => {
          toast.error("Lecture impossible.");
          setPreviewAudioPlayingId(null);
        });
    },
    [],
  );

  useEffect(() => {
    if (activeStep !== LAST_STEP_INDEX) {
      pauseAllPreviewAudios();
    }
  }, [activeStep, pauseAllPreviewAudios]);

  useEffect(() => {
    if (!previewAudioPlayingId) return;
    const el = previewAudioRefs.current[previewAudioPlayingId];
    if (!el) return;
    const bump = () => setPreviewAudioUiTick((n) => n + 1);
    el.addEventListener("timeupdate", bump);
    el.addEventListener("ended", bump);
    return () => {
      el.removeEventListener("timeupdate", bump);
      el.removeEventListener("ended", bump);
    };
  }, [previewAudioPlayingId]);

  const toggleDictation = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      toast.error("Dictée non prise en charge.");
      return;
    }

    if (dictationActive || dictationWantedRef.current) {
      dictationWantedRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setDictationActive(false);
      return;
    }

    dictationWantedRef.current = true;
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: Event) => {
      const ev = event as unknown as {
        resultIndex: number;
        results: { length: number; [i: number]: { 0: { transcript: string } } };
      };
      let chunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const part = ev.results[i]?.[0];
        if (part?.transcript) chunk += part.transcript;
      }
      if (chunk) {
        setDescription((d) => (d ? `${d} ${chunk}` : chunk));
      }
    };

    rec.onerror = (event: Event) => {
      const code = (event as unknown as { error?: string }).error ?? "";
      if (code === "no-speech" && dictationWantedRef.current) {
        try {
          rec.start();
        } catch {
          /* ignore — onend reprendra ou l’utilisateur arrêtera */
        }
        return;
      }
      if (code === "aborted" && !dictationWantedRef.current) {
        return;
      }
      dictationWantedRef.current = false;
      setDictationActive(false);
      recognitionRef.current = null;
      if (code === "not-allowed" || code === "service-not-allowed") {
        toast.error("Micro ou dictée refusé.");
      } else if (code === "network") {
        toast.error("Dictée : erreur réseau.");
      } else {
        toast.error("Dictée : erreur.");
      }
    };

    rec.onend = () => {
      if (!dictationWantedRef.current) {
        setDictationActive(false);
        recognitionRef.current = null;
        return;
      }
      try {
        rec.start();
      } catch {
        dictationWantedRef.current = false;
        setDictationActive(false);
        recognitionRef.current = null;
      }
    };

    try {
      rec.start();
      setDictationActive(true);
    } catch {
      dictationWantedRef.current = false;
      toast.error("Dictée indisponible.");
    }
  }, [dictationActive]);

  const startRecording = useCallback(async () => {
    if (!window.MediaRecorder) {
      toast.error("Enregistrement audio indisponible.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) return;
        const file = new File([blob], `enregistrement-${Date.now()}.webm`, {
          type: blob.type || "audio/webm",
        });
        addAttachments([file]);
        mediaRecorderRef.current = null;
        setRecordingState("idle");
      };
      mr.start(200);
      setRecordingState("recording");
    } catch {
      toast.error("Micro refusé.");
    }
  }, [addAttachments, stopStream]);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    } else {
      stopStream();
      setRecordingState("idle");
    }
  }, [stopStream]);

  useEffect(() => {
    if (activeStep !== 1) {
      dictationWantedRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setDictationActive(false);
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== LAST_STEP_INDEX && recordingState === "recording") {
      stopRecording();
    }
  }, [activeStep, recordingState, stopRecording]);

  const goNext = useCallback(() => {
    if (activeStep === 0 && !anonymousMode) {
      const contactError = validateNonAnonymousContact(nom, email, tel);
      if (contactError) {
        toast.error(contactError);
        return;
      }
    }
    if (activeStep === 1 && !description.trim()) {
      toast.error("Décrivez les faits d’abord.");
      return;
    }
    setActiveStep((s) => Math.min(s + 1, LAST_STEP_INDEX));
  }, [activeStep, anonymousMode, description, email, nom, tel]);

  const goPrev = useCallback(() => {
    setActiveStep((s) => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= activeStep) return;
    setActiveStep(index);
  }, [activeStep]);

  const requestGeolocation = useCallback((opts: { silent: boolean }) => {
    if (!navigator.geolocation) {
      if (!opts.silent) {
        toast.error("Géolocalisation indisponible.");
      }
      return;
    }
    if (!opts.silent) {
      setGeoLoading(true);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(formatGeolocationLine(pos));
        if (!opts.silent) setGeoLoading(false);
      },
      (err) => {
        if (!opts.silent) {
          setGeoLoading(false);
          const code = (err as GeolocationPositionError).code;
          if (code === 1) {
            toast.error("Localisation refusée.");
          } else if (code === 2) {
            toast.error("Position indisponible.");
          } else if (code === 3) {
            toast.error("Délai dépassé.");
          } else {
            toast.error("Localisation impossible.");
          }
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (activeStep !== 2) {
      autoGeoStep2Ref.current = false;
      return;
    }
    if (autoGeoStep2Ref.current || coords.trim()) return;
    if (!navigator.geolocation) return;
    autoGeoStep2Ref.current = true;
    requestGeolocation({ silent: true });
  }, [activeStep, coords, requestGeolocation]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (activeStep !== LAST_STEP_INDEX) {
      return;
    }
    const desc = description.trim();
    if (!desc) {
      toast.error("Description obligatoire.");
      setActiveStep(1);
      return;
    }
    if (!anonymousMode) {
      const contactError = validateNonAnonymousContact(nom, email, tel);
      if (contactError) {
        toast.error(contactError);
        setActiveStep(0);
        return;
      }
    }

    if (turnstileEnabled && !turnstileToken) {
      toast.error("Veuillez valider le contrôle de sécurité.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(null);
    setSubmitSuccessMessage(null);
    setSubmitErrorMessage(null);
    try {
      const files = attachments.map((a) => a.file);
      const data = await submitSignalementWithProgress(
        files,
        {
          description: desc,
          anonymousMode,
          nom,
          email,
          tel,
          province,
          villeSite,
          coords,
          typeInfraction,
          turnstileToken,
        },
        setUploadProgress,
      );

      clearSignalementFormDraft();
      setActiveStep(0);
      setAnonymousMode(true);
      setNom("");
      setEmail("");
      setTel("");
      setDescription("");
      setProvince("");
      setVilleSite("");
      setCoords("");
      setTypeInfraction("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      setAttachments([]);

      const rawMessage = data.message?.trim();
      const successMessage =
        rawMessage && rawMessage.length <= 120
          ? rawMessage
          : rawMessage
            ? `${rawMessage.slice(0, 117)}…`
            : "Votre signalement a bien été envoyé.";

      setSubmitSuccessMessage(successMessage);
    } catch (error) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      const message =
        error instanceof Error
          ? error.message.trim().length > 120
            ? `${error.message.trim().slice(0, 117)}…`
            : error.message.trim()
          : "Erreur réseau.";
      setSubmitErrorMessage(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  const overallUploadPercent = computeSignalementUploadOverallPercent(
    uploadProgress,
    attachments.length,
  );

  const stepNavInCardEl = (
    <div className={styles.stepNavInCard}>
      <div className={styles.stepNavActions}>
        {activeStep > 0 ? (
          <button type="button" className={`${styles.btn} ${styles.stepBtnGhost}`} onClick={goPrev}>
            ← Retour
          </button>
        ) : null}
        <button type="button" className={`${styles.btn} ${styles.stepBtnNext}`} onClick={goNext}>
          Suivant →
        </button>
      </div>
    </div>
  );

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
      <nav className={styles.progressWrap} aria-label="Progression du formulaire">
        <div className={styles.progressLabels}>
          {STEP_DEFINITIONS.map((def, i) => (
            <span
              key={def.short}
              className={`${styles.progressLabel} ${i === activeStep ? styles.progressLabelActive : ""} ${i < activeStep ? styles.progressLabelDone : ""}`}
            >
              {def.short}
            </span>
          ))}
        </div>
        <div className={styles.progressTrack} aria-hidden>
          <div
            className={styles.progressFill}
            style={{
              width: `${((activeStep + 1) / STEP_DEFINITIONS.length) * 100}%`,
            }}
          />
        </div>
        <div className={styles.stepDots}>
          {STEP_DEFINITIONS.map((def, i) => (
            <button
              key={def.short}
              type="button"
              id={`${formId}-step-tab-${i}`}
              className={`${styles.dot} ${i === activeStep ? styles.dotActive : ""} ${i < activeStep ? styles.dotDone : ""}`}
              disabled={i > activeStep}
              aria-current={activeStep === i ? "step" : undefined}
              aria-controls={`${formId}-panel-${i}`}
              aria-label={`Étape ${i + 1} : ${def.title}`}
              onClick={() => {
                if (i < activeStep) goToStep(i);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </nav>

      <div
        id={`${formId}-panel-0`}
        role="tabpanel"
        aria-labelledby={`${formId}-step-0`}
        hidden={activeStep !== 0}
        className={styles.stepPanel}
      >
        <section className={styles.section} aria-labelledby={`${formId}-step-0`}>
          <h2 className={styles.sectionTitle} id={`${formId}-step-0`}>
            Informations sur le{" "}
            <span className={styles.sectionTitleAccent}>lanceur d’alerte</span>{" "}
            {anonymousMode ? (
              <span className={styles.optional}>(optionnel)</span>
            ) : (
              <span className={styles.requiredMark} title="Obligatoire">
                *
              </span>
            )}
          </h2>
          <p className={styles.sectionHint}>
            {anonymousMode
              ? "Vous pouvez passer à l’étape suivante sans renseigner d’identité. Désactivez le switch pour indiquer vos coordonnées."
              : "Le nom est obligatoire. Indiquez au moins un e-mail ou un numéro de téléphone."}
          </p>
          <div className={`${styles.dictToggleRow} ${styles.dictToggleRowAnon}`}>
            <span
              className={`${styles.dictToggleLabel} ${styles.dictToggleLabelSentence}`}
              id={`${formId}-anon-label`}
            >
              {anonymousMode
                ? "Le signalement peut être effectué de manière totalement anonyme."
                : "Je souhaite renseigner mes coordonnées pour un éventuel suivi."}
            </span>
            <button
              type="button"
              id={`${formId}-anon-toggle`}
              className={`${styles.dictSwitch} ${anonymousMode ? styles.dictSwitchOn : ""}`}
              role="switch"
              aria-checked={anonymousMode}
              aria-labelledby={`${formId}-anon-label`}
              onClick={() => {
                setAnonymousMode((on) => {
                  if (on) return false;
                  setNom("");
                  setEmail("");
                  setTel("");
                  return true;
                });
              }}
            >
              <span className={styles.dictSwitchTrack} aria-hidden>
                <span className={styles.dictSwitchThumb} />
              </span>
            </button>
          </div>
          {!anonymousMode ? (
          <div className={styles.grid2}>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-nom`}>
                Nom et prénom <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id={`${formId}-nom`}
                className={styles.pillInput}
                type="text"
                name="alerteur_nom"
                autoComplete="name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex. : Jean Mukendi"
              />
            </div>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-email`}>
                Adresse e-mail
              </label>
              <input
                id={`${formId}-email`}
                className={styles.pillInput}
                type="email"
                name="alerteur_email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
              />
            </div>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-tel`}>
                Numéro de téléphone
              </label>
              <input
                id={`${formId}-tel`}
                className={styles.pillInput}
                type="tel"
                name="alerteur_tel"
                autoComplete="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Ex. : +243 900 000 000"
              />
            </div>
            <p className={`${styles.dictHintBelow} ${styles.span2}`}>
              Au moins l’un des deux moyens de contact ci-dessus est requis.
            </p>
          </div>
          ) : null}
          {stepNavInCardEl}
        </section>
      </div>

      <div
        id={`${formId}-panel-1`}
        role="tabpanel"
        aria-labelledby={`${formId}-step-1`}
        hidden={activeStep !== 1}
        className={styles.stepPanel}
      >
        <section className={styles.section} aria-labelledby={`${formId}-step-1`}>
          <h2 className={styles.sectionTitle} id={`${formId}-step-1`}>
            Description{" "}
            <span className={styles.sectionTitleAccent}>de l’infraction</span>{" "}
            <span className={styles.requiredMark} title="Obligatoire">
              *
            </span>
          </h2>
          <p className={styles.sectionHint}>
            Décrivez les faits avec précision (obligatoire). Vous pouvez activer la dictée vocale
            (interrupteur « Dicter : voix → texte ») si votre navigateur la prend en charge.
          </p>
          <div className={styles.grid2}>
            <div className={`${styles.pillField} ${styles.pillTextareaWrap} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-desc`}>
                Description des faits <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id={`${formId}-desc`}
                className={styles.pillTextarea}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contexte, dates, personnes ou entreprises concernées, ce que vous avez observé…"
              />
            </div>
          </div>
          <div className={styles.dictToggleRow}>
            <span className={styles.dictToggleLabel} id={`${formId}-dict-label`}>
              Dicter : voix → texte
            </span>
            <button
              type="button"
              id={`${formId}-dict-toggle`}
              className={`${styles.dictSwitch} ${dictationActive ? styles.dictSwitchOn : ""}`}
              role="switch"
              aria-checked={dictationActive}
              aria-labelledby={`${formId}-dict-label`}
              disabled={!dictationSupported}
              onClick={toggleDictation}
            >
              <span className={styles.dictSwitchTrack} aria-hidden>
                <span className={styles.dictSwitchThumb} />
              </span>
            </button>
          </div>
          {!dictationSupported ? (
            <p className={styles.dictHintBelow} role="status">
              Dictée non disponible sur ce navigateur.
            </p>
          ) : dictationActive ? (
            <p className={styles.dictHintBelow} role="status">
              Parlez : le texte s’ajoute à la description.
            </p>
          ) : (
            <p className={styles.dictHow}>
              <strong>Pour que ça fonctionne :</strong> utilisez de préférence{" "}
              <strong>Chrome</strong> ou <strong>Edge</strong> (connexion HTTPS). Activez
              l’interrupteur, acceptez l’accès au <strong>microphone</strong> si le navigateur le
              demande, puis parlez en français — le texte s’insère dans la zone de description.
            </p>
          )}
          {stepNavInCardEl}
        </section>
      </div>

      <div
        id={`${formId}-panel-2`}
        role="tabpanel"
        aria-labelledby={`${formId}-step-2`}
        hidden={activeStep !== 2}
        className={styles.stepPanel}
      >
        <section className={styles.section} aria-labelledby={`${formId}-step-2`}>
          <h2 className={styles.sectionTitle} id={`${formId}-step-2`}>
            <span className={styles.sectionTitleAccent}>Localisation</span>{" "}
            <span className={styles.optional}>(optionnel, recommandé)</span>
          </h2>
          <p className={styles.sectionHint}>
            Ces informations facilitent la localisation des faits signalés. Vous pouvez passer à
            l’étape suivante sans les renseigner.
          </p>
          <div className={styles.grid2}>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-prov`}>
                Province
              </label>
              <select
                id={`${formId}-prov`}
                className={styles.pillSelect}
                name="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">Facultatif — choisir une province</option>
                {PROVINCES_RDC.filter(Boolean).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-ville`}>
                Ville / site minier
              </label>
              <input
                id={`${formId}-ville`}
                className={styles.pillInput}
                type="text"
                name="ville_site"
                value={villeSite}
                onChange={(e) => setVilleSite(e.target.value)}
                placeholder="Facultatif — ex. : Kolwezi, site minier…"
              />
            </div>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-coords`}>
                Coordonnées géographiques
              </label>
              <input
                id={`${formId}-coords`}
                className={styles.pillInput}
                type="text"
                name="coords"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
                placeholder="Facultatif — latitude, longitude (ex. : -10.723, 25.472)"
              />
            </div>
          </div>
          <div className={styles.toolRow}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => requestGeolocation({ silent: false })}
              disabled={geoLoading}
            >
              {geoLoading ? "Localisation…" : "Remplir automatiquement les coordonnées"}
            </button>
            <span className={styles.dictHint}>
              Remplissage auto à l’ouverture de cette étape si le navigateur l’autorise.
            </span>
          </div>
          {stepNavInCardEl}
        </section>
      </div>

      <div
        id={`${formId}-panel-3`}
        role="tabpanel"
        aria-labelledby={`${formId}-step-3`}
        hidden={activeStep !== 3}
        className={styles.stepPanel}
      >
        <section className={styles.section} aria-labelledby={`${formId}-step-3`}>
          <h2 className={styles.sectionTitle} id={`${formId}-step-3`}>
            Type <span className={styles.sectionTitleAccent}>d’infraction</span>{" "}
            <span className={styles.optional}>(optionnel)</span>
          </h2>
          <p className={styles.sectionHint}>
            Précisez la nature des faits si vous le souhaitez. Ce champ n’est pas obligatoire.
          </p>
          <div className={styles.grid2}>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-type`}>
                Type d’infraction
              </label>
              <select
                id={`${formId}-type`}
                className={styles.pillSelect}
                name="type_infraction"
                value={typeInfraction}
                onChange={(e) => setTypeInfraction(e.target.value)}
              >
                <option value="">Facultatif — sélectionner un type</option>
                {TYPES_INFRACTION.filter(Boolean).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {stepNavInCardEl}
        </section>
      </div>

      <div
        id={`${formId}-panel-4`}
        role="tabpanel"
        aria-labelledby={`${formId}-step-4`}
        hidden={activeStep !== 4}
        className={styles.stepPanel}
      >
        <section className={styles.section} aria-labelledby={`${formId}-step-4`}>
          <h2 className={styles.sectionTitle} id={`${formId}-step-4`}>
            Pièces <span className={styles.sectionTitleAccent}>jointes</span>{" "}
            <span className={styles.optional}>(optionnel)</span>
          </h2>
          <p className={styles.sectionHint}>
            Photos et vidéos (import), ou audio (fichier ou micro). Aperçu avant envoi.
          </p>
          <p className={styles.limits}>
            <strong>{formatBytes(MAX_SIGNALEMENT_FILE_BYTES)}</strong> (photos/audio) ·{" "}
            <strong>{formatBytes(MAX_SIGNALEMENT_VIDEO_FILE_BYTES)}</strong> (vidéos) ·{" "}
            <strong>{MAX_FILES}</strong> fichiers max ·{" "}
            <strong>{formatBytes(MAX_SIGNALEMENT_TOTAL_BYTES)}</strong> au total
          </p>

          <div className={styles.attachmentActions} role="group" aria-label="Ajouter des pièces jointes">
            <button
              type="button"
              className={styles.attachmentAction}
              onClick={() => mediaInputRef.current?.click()}
            >
              <span className={styles.attachmentActionIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                  <circle cx="8.5" cy="11" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M21 15l-4-4-3.5 3.5L11 11l-5 5" />
                </svg>
              </span>
              <span className={styles.attachmentActionLabel}>Photos &amp; vidéos</span>
              <span className={styles.attachmentActionHint}>JPG · PNG · MP4…</span>
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept={ACCEPT_PHOTOS_VIDEOS}
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) addAttachments(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className={styles.attachmentAction}
              onClick={() => audioPickRef.current?.click()}
            >
              <span className={styles.attachmentActionIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </span>
              <span className={styles.attachmentActionLabel}>Audio fichier</span>
              <span className={styles.attachmentActionHint}>Import</span>
            </button>
            <input
              ref={audioPickRef}
              type="file"
              accept={ACCEPT_AUDIO}
              hidden
              onChange={(e) => {
                if (e.target.files?.length) addAttachments(e.target.files);
                e.target.value = "";
              }}
            />
            {recordingState === "recording" ? (
              <button
                type="button"
                className={`${styles.attachmentAction} ${styles.attachmentActionDanger}`}
                onClick={stopRecording}
              >
                <span className={styles.attachmentActionIcon} aria-hidden>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <rect x="7" y="7" width="10" height="10" rx="1.5" />
                  </svg>
                </span>
                <span className={styles.attachmentActionLabel}>Stop</span>
                <span className={styles.attachmentActionHint}>Fin enregistrement</span>
              </button>
            ) : (
              <button type="button" className={styles.attachmentAction} onClick={startRecording}>
                <span className={styles.attachmentActionIcon} aria-hidden>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
                    <path d="M19 10a7 7 0 0 1-14 0M12 18v3M8 22h8" />
                  </svg>
                </span>
                <span className={styles.attachmentActionLabel}>Micro</span>
                <span className={styles.attachmentActionHint}>Enregistrer</span>
              </button>
            )}
          </div>

          {attachments.length > 0 ? (
            <div className={styles.previewGrid}>
              {attachments.map((a) => {
                void previewAudioUiTick;
                const isImg = a.file.type.startsWith("image/");
                const isVid = isSignalementVideoMime(a.file.type, a.file.name);
                const isAud = isSignalementAudioMime(a.file.type, a.file.name);
                const audioNode = isAud ? previewAudioRefs.current[a.id] : null;
                const audioDur =
                  audioNode && Number.isFinite(audioNode.duration) && audioNode.duration > 0
                    ? audioNode.duration
                    : 0;
                const audioCur =
                  audioNode && Number.isFinite(audioNode.currentTime) ? audioNode.currentTime : 0;
                const audioPct =
                  audioDur > 0 ? Math.min(100, (audioCur / audioDur) * 100) : 0;
                const audioPlaying = Boolean(audioNode && !audioNode.paused);
                return (
                  <div key={a.id} className={styles.previewItem}>
                    <div className={styles.previewMedia}>
                      {isImg ? (
                        <img src={a.previewUrl} alt={a.file.name} />
                      ) : isVid ? (
                        <video
                          src={a.previewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className={styles.previewVideo}
                          aria-label={`Aperçu vidéo ${a.file.name}`}
                        />
                      ) : isAud ? (
                        <>
                          <audio
                            ref={(el) => {
                              if (el) previewAudioRefs.current[a.id] = el;
                              else delete previewAudioRefs.current[a.id];
                            }}
                            src={a.previewUrl}
                            preload="metadata"
                            className={styles.previewAudioNative}
                            onEnded={() => {
                              setPreviewAudioPlayingId((p) => (p === a.id ? null : p));
                              setPreviewAudioUiTick((n) => n + 1);
                            }}
                            onLoadedMetadata={() => setPreviewAudioUiTick((n) => n + 1)}
                          />
                          <div className={styles.previewAudioCustom}>
                            <button
                              type="button"
                              className={`${styles.previewAudioPlayBtn} ${audioPlaying ? styles.previewAudioPlayBtnPlaying : ""}`}
                              onClick={() => togglePreviewAudio(a.id)}
                              aria-label={audioPlaying ? "Pause" : "Lire l’audio"}
                            >
                              {audioPlaying ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="20"
                                  height="20"
                                  fill="currentColor"
                                  aria-hidden
                                >
                                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="20"
                                  height="20"
                                  fill="currentColor"
                                  aria-hidden
                                >
                                  <path d="M8 5v14l11-7.5z" />
                                </svg>
                              )}
                            </button>
                            <div className={styles.previewAudioProgressTrack} aria-hidden>
                              <div
                                className={styles.previewAudioProgressFill}
                                style={{ width: `${audioPct}%` }}
                              />
                            </div>
                            <span className={styles.previewAudioTime}>
                              {formatAudioTime(audioCur)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className={styles.previewFileFallback}>{a.file.name}</div>
                      )}
                      <button
                        type="button"
                        className={styles.removeAttachmentPill}
                        aria-label={`Supprimer ${a.file.name}`}
                        onClick={() => removeAttachment(a.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                    <div className={styles.previewCaption}>
                      {a.file.name}
                      <br />
                      <span style={{ opacity: 0.85 }}>{formatBytes(a.file.size)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {turnstileEnabled && turnstileSiteKeyValue ? (
            <div className={styles.turnstileWrap}>
              <TurnstileWidget
                ref={turnstileRef}
                siteKey={turnstileSiteKeyValue}
                onToken={setTurnstileToken}
                onExpire={handleTurnstileExpire}
                onError={handleTurnstileError}
                theme="auto"
              />
            </div>
          ) : null}
          <div className={styles.stepNavInCard}>
            <div className={styles.stepNavActions}>
              <button type="button" className={`${styles.btn} ${styles.stepBtnGhost}`} onClick={goPrev}>
                ← Retour
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.stepBtnNext}`}
                disabled={submitting || (turnstileEnabled && !turnstileToken)}
              >
                {submitting ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {activeStep === LAST_STEP_INDEX ? (
        <div className={styles.formFooter}>
          <div className={styles.footerLeft}>
            <p className={styles.footerNote}>
              Accusé de réception par e-mail si une adresse est renseignée. PJ : {formatBytes(MAX_SIGNALEMENT_FILE_BYTES)} (photos/audio),{" "}
              {formatBytes(MAX_SIGNALEMENT_VIDEO_FILE_BYTES)} (vidéos), {MAX_FILES} max.
            </p>
            <p className={styles.footerLegal}>
              Envoyer = vous confirmez le contenu.{" "}
              <a href="/conditions-generales" target="_blank" rel="noreferrer">
                Conditions générales
              </a>
              .
            </p>
          </div>
        </div>
      ) : null}

      {submitSuccessMessage ? (
        <div
          className={`${styles.submitOverlay} ${styles.submitOverlaySuccess}`}
          role="status"
          aria-live="polite"
          aria-label="Signalement envoyé avec succès"
        >
          <div className={styles.submitOverlayInner}>
            <div className={styles.submitSuccessIcon} aria-hidden>
              ✓
            </div>
            <p className={styles.submitOverlayTitle}>Signalement envoyé</p>
            <p className={styles.submitOverlayLabel}>{submitSuccessMessage}</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.stepBtnNext} ${styles.submitOverlayBtn}`}
              onClick={dismissSubmitSuccess}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : submitErrorMessage ? (
        <div
          className={`${styles.submitOverlay} ${styles.submitOverlayError}`}
          role="alert"
          aria-live="assertive"
        >
          <div className={styles.submitOverlayInner}>
            <p className={styles.submitOverlayTitle}>Échec de l’envoi</p>
            <p className={styles.submitOverlayLabel}>{submitErrorMessage}</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.stepBtnNext} ${styles.submitOverlayBtn}`}
              onClick={() => setSubmitErrorMessage(null)}
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : submitting ? (
        <div
          className={styles.submitOverlay}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Envoi du signalement en cours"
        >
          <div className={styles.submitOverlayInner}>
            <div className={styles.submitSpinner} aria-hidden />
            <p className={styles.submitOverlayTitle}>Envoi en cours</p>
            <p className={styles.submitOverlayLabel}>
              {uploadProgress
                ? formatSignalementUploadProgressLabel(uploadProgress)
                : "Préparation de l’envoi…"}
            </p>
            <div className={styles.submitProgressTrack} aria-hidden>
              <div
                className={styles.submitProgressFill}
                style={{ width: `${overallUploadPercent}%` }}
              />
            </div>
            <p className={styles.submitOverlayPercent}>{overallUploadPercent}%</p>
            <p className={styles.submitOverlayHint}>
              Ne fermez pas cette page pendant l’envoi.
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
