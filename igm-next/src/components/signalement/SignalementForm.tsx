"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/TurnstileWidget";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { isTurnstileClientEnabled, turnstileSiteKey } from "@/lib/security/turnstileConfig";
import {
  clearSignalementFormDraft,
  loadSignalementFormDraft,
  saveSignalementFormDraft,
} from "@/lib/signalement/signalementFormDraft";
import {
  computeSignalementUploadOverallPercent,
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
import {
  formatSignalementBytes,
  formatSignalementGeolocationLine,
  formatSignalementUploadProgressLabel,
  getSignalementFormCopy,
  getSignalementInfractionOptions,
} from "@/lib/signalement/signalementFormCopy";

import styles from "./SignalementForm.module.css";

const MAX_FILES = MAX_SIGNALEMENT_FILES;
const ACCEPT_PHOTOS_VIDEOS = "image/jpeg,image/png,video/*,.mp4,.mov,.m4v,.avi,.mkv,.webm";
const ACCEPT_AUDIO = "audio/*,.webm,.mp3,.wav,.m4a,.ogg";

type Attachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function formatBytes(n: number, locale: ReturnType<typeof useLocale>["locale"]): string {
  return formatSignalementBytes(n, locale);
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

function formatGeolocationLine(
  pos: GeolocationPosition,
  locale: ReturnType<typeof useLocale>["locale"],
): string {
  return formatSignalementGeolocationLine(pos, locale);
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
  copy: ReturnType<typeof getSignalementFormCopy>,
): string | null {
  if (!nom.trim()) {
    return copy.validation.nameRequired;
  }

  const emailTrimmed = email.trim();
  const telTrimmed = tel.trim();

  if (!emailTrimmed && !telTrimmed) {
    return copy.validation.contactRequired;
  }

  if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return copy.validation.emailInvalid;
  }

  return null;
}

export default function SignalementForm({ onSuccess, onSubmittingChange }: SignalementFormProps = {}) {
  const { locale } = useLocale();
  const t = getSignalementFormCopy(locale);
  const steps = t.steps;
  const lastStepIndex = steps.length - 1;
  const infractionOptions = getSignalementInfractionOptions(locale);
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
      setActiveStep(Math.min(draft.activeStep, lastStepIndex));
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

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    toast.error(t.toast.captchaUnavailable);
  }, [t.toast.captchaUnavailable]);

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
    };
  }, [stopStream]);

  const addAttachments = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    setAttachments((prev) => {
      let err: string | null = null;
      if (prev.length + list.length > MAX_FILES) {
        err = t.toast.maxFiles(MAX_FILES);
      } else {
        for (const f of list) {
          const mime = f.type || "application/octet-stream";
          const maxBytes = maxSignalementFileBytes(mime, f.name);
          if (f.size > maxBytes) {
            err = t.toast.fileTooLarge(formatBytes(maxBytes, locale));
            break;
          }
          if (!isAllowedSignalementMime(mime, f.name)) {
            err = t.toast.fileTypeNotAllowed;
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
  }, [locale, t.toast]);

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
          toast.error(t.toast.playbackFailed);
          setPreviewAudioPlayingId(null);
        });
    },
    [t.toast.playbackFailed],
  );

  useEffect(() => {
    if (activeStep !== lastStepIndex) {
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

  const startRecording = useCallback(async () => {
    if (!window.MediaRecorder) {
      toast.error(t.toast.audioRecordingUnavailable);
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
      toast.error(t.toast.micDenied);
    }
  }, [addAttachments, stopStream, t.toast.micDenied]);

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
    if (activeStep !== lastStepIndex && recordingState === "recording") {
      stopRecording();
    }
  }, [activeStep, recordingState, stopRecording]);

  const goNext = useCallback(() => {
    if (activeStep === 0 && !anonymousMode) {
      const contactError = validateNonAnonymousContact(nom, email, tel, t);
      if (contactError) {
        toast.error(contactError);
        return;
      }
    }
    if (activeStep === 1 && !description.trim()) {
      toast.error(t.validation.describeFactsFirst);
      return;
    }
    setActiveStep((s) => Math.min(s + 1, lastStepIndex));
  }, [activeStep, anonymousMode, description, email, nom, t, tel]);

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
        toast.error(t.toast.geoUnavailable);
      }
      return;
    }
    if (!opts.silent) {
      setGeoLoading(true);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(formatGeolocationLine(pos, locale));
        if (!opts.silent) setGeoLoading(false);
      },
      (err) => {
        if (!opts.silent) {
          setGeoLoading(false);
          const code = (err as GeolocationPositionError).code;
          if (code === 1) {
            toast.error(t.toast.geoDenied);
          } else if (code === 2) {
            toast.error(t.toast.geoUnavailablePosition);
          } else if (code === 3) {
            toast.error(t.toast.geoTimeout);
          } else {
            toast.error(t.toast.geoFailed);
          }
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [locale, t.toast]);

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
    if (activeStep !== lastStepIndex) {
      return;
    }
    const desc = description.trim();
    if (!desc) {
      toast.error(t.validation.descriptionRequired);
      setActiveStep(1);
      return;
    }
    if (!anonymousMode) {
      const contactError = validateNonAnonymousContact(nom, email, tel, t);
      if (contactError) {
        toast.error(contactError);
        setActiveStep(0);
        return;
      }
    }

    if (turnstileEnabled && !turnstileToken) {
      toast.error(t.validation.captchaRequired);
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
          locale,
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
            : t.success.defaultMessage;

      setSubmitSuccessMessage(successMessage);
    } catch (error) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      const message =
        error instanceof Error
          ? error.message.trim().length > 120
            ? `${error.message.trim().slice(0, 117)}…`
            : error.message.trim()
          : t.error.network;
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

  const photoMaxLabel = formatBytes(MAX_SIGNALEMENT_FILE_BYTES, locale);
  const videoMaxLabel = formatBytes(MAX_SIGNALEMENT_VIDEO_FILE_BYTES, locale);
  const totalMaxLabel = formatBytes(MAX_SIGNALEMENT_TOTAL_BYTES, locale);

  const stepNavInCardEl = (
    <div className={styles.stepNavInCard}>
      <div className={styles.stepNavActions}>
        {activeStep > 0 ? (
          <button type="button" className={`${styles.btn} ${styles.stepBtnGhost}`} onClick={goPrev}>
            {t.back}
          </button>
        ) : null}
        <button type="button" className={`${styles.btn} ${styles.stepBtnNext}`} onClick={goNext}>
          {t.next}
        </button>
      </div>
    </div>
  );

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
      <nav className={styles.progressWrap} aria-label={t.progressAria}>
        <div className={styles.progressLabels}>
          {steps.map((def, i) => (
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
              width: `${((activeStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
        <div className={styles.stepDots}>
          {steps.map((def, i) => (
            <button
              key={def.short}
              type="button"
              id={`${formId}-step-tab-${i}`}
              className={`${styles.dot} ${i === activeStep ? styles.dotActive : ""} ${i < activeStep ? styles.dotDone : ""}`}
              disabled={i > activeStep}
              aria-current={activeStep === i ? "step" : undefined}
              aria-controls={`${formId}-panel-${i}`}
              aria-label={t.stepAria(i, def.title)}
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
            {t.step0.titlePrefix}{" "}
            <span className={styles.sectionTitleAccent}>{t.step0.titleAccent}</span>{" "}
            {anonymousMode ? (
              <span className={styles.optional}>{t.optional}</span>
            ) : (
              <span className={styles.requiredMark} title={t.requiredTitle}>
                *
              </span>
            )}
          </h2>
          <p className={styles.sectionHint}>
            {anonymousMode ? t.step0.hintAnonymous : t.step0.hintIdentified}
          </p>
          <div className={`${styles.dictToggleRow} ${styles.dictToggleRowAnon}`}>
            <span
              className={`${styles.dictToggleLabel} ${styles.dictToggleLabelSentence}`}
              id={`${formId}-anon-label`}
            >
              {anonymousMode ? t.step0.anonymousOn : t.step0.anonymousOff}
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
                {t.step0.nameLabel} <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id={`${formId}-nom`}
                className={styles.pillInput}
                type="text"
                name="alerteur_nom"
                autoComplete="name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={t.step0.namePlaceholder}
              />
            </div>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-email`}>
                {t.step0.emailLabel}
              </label>
              <input
                id={`${formId}-email`}
                className={styles.pillInput}
                type="email"
                name="alerteur_email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.step0.emailPlaceholder}
              />
            </div>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-tel`}>
                {t.step0.phoneLabel}
              </label>
              <input
                id={`${formId}-tel`}
                className={styles.pillInput}
                type="tel"
                name="alerteur_tel"
                autoComplete="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder={t.step0.phonePlaceholder}
              />
            </div>
            <p className={`${styles.dictHintBelow} ${styles.span2}`}>
              {t.step0.contactRequiredHint}
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
            {t.step1.titlePrefix}{" "}
            <span className={styles.sectionTitleAccent}>{t.step1.titleAccent}</span>{" "}
            <span className={styles.requiredMark} title={t.requiredTitle}>
              *
            </span>
          </h2>
          <p className={styles.sectionHint}>{t.step1.hint}</p>
          <div className={styles.grid2}>
            <div className={`${styles.pillField} ${styles.pillTextareaWrap} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-desc`}>
                {t.step1.descriptionLabel} <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id={`${formId}-desc`}
                className={styles.pillTextarea}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.step1.descriptionPlaceholder}
              />
            </div>
          </div>
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
            <span className={styles.sectionTitleAccent}>{t.step2.titleAccent}</span>{" "}
            <span className={styles.optional}>{t.step2.titleOptional}</span>
          </h2>
          <p className={styles.sectionHint}>{t.step2.hint}</p>
          <div className={styles.grid2}>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-prov`}>
                {t.step2.provinceLabel}
              </label>
              <select
                id={`${formId}-prov`}
                className={styles.pillSelect}
                name="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">{t.step2.provincePlaceholder}</option>
                {t.provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.pillField}>
              <label className={styles.pillLabel} htmlFor={`${formId}-ville`}>
                {t.step2.cityLabel}
              </label>
              <input
                id={`${formId}-ville`}
                className={styles.pillInput}
                type="text"
                name="ville_site"
                value={villeSite}
                onChange={(e) => setVilleSite(e.target.value)}
                placeholder={t.step2.cityPlaceholder}
              />
            </div>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-coords`}>
                {t.step2.coordsLabel}
              </label>
              <input
                id={`${formId}-coords`}
                className={styles.pillInput}
                type="text"
                name="coords"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
                placeholder={t.step2.coordsPlaceholder}
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
              {geoLoading ? t.step2.geoLoading : t.step2.geoButton}
            </button>
            <span className={styles.dictHint}>{t.step2.geoAutoHint}</span>
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
            {t.step3.titlePrefix}{" "}
            <span className={styles.sectionTitleAccent}>{t.step3.titleAccent}</span>{" "}
            <span className={styles.optional}>{t.step3.titleOptional}</span>
          </h2>
          <p className={styles.sectionHint}>{t.step3.hint}</p>
          <div className={styles.grid2}>
            <div className={`${styles.pillField} ${styles.span2}`}>
              <label className={styles.pillLabel} htmlFor={`${formId}-type`}>
                {t.step3.typeLabel}
              </label>
              <select
                id={`${formId}-type`}
                className={styles.pillSelect}
                name="type_infraction"
                value={typeInfraction}
                onChange={(e) => setTypeInfraction(e.target.value)}
              >
                <option value="">{t.step3.typePlaceholder}</option>
                {infractionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
            {t.step4.titlePrefix}{" "}
            {t.step4.titleAccent ? (
              <span className={styles.sectionTitleAccent}>{t.step4.titleAccent}</span>
            ) : null}{" "}
            <span className={styles.optional}>{t.step4.titleOptional}</span>
          </h2>
          <p className={styles.sectionHint}>{t.step4.hint}</p>
          <p className={styles.limits}>
            {t.step4.limits(photoMaxLabel, videoMaxLabel, MAX_FILES, totalMaxLabel)}
          </p>

          <div className={styles.attachmentActions} role="group" aria-label={t.step4.attachmentsAria}>
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
              <span className={styles.attachmentActionLabel}>{t.step4.photosVideos}</span>
              <span className={styles.attachmentActionHint}>{t.step4.photosVideosHint}</span>
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
              <span className={styles.attachmentActionLabel}>{t.step4.audioFile}</span>
              <span className={styles.attachmentActionHint}>{t.step4.audioImport}</span>
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
                <span className={styles.attachmentActionLabel}>{t.step4.stop}</span>
                <span className={styles.attachmentActionHint}>{t.step4.stopHint}</span>
              </button>
            ) : (
              <button type="button" className={styles.attachmentAction} onClick={startRecording}>
                <span className={styles.attachmentActionIcon} aria-hidden>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
                    <path d="M19 10a7 7 0 0 1-14 0M12 18v3M8 22h8" />
                  </svg>
                </span>
                <span className={styles.attachmentActionLabel}>{t.step4.mic}</span>
                <span className={styles.attachmentActionHint}>{t.step4.micHint}</span>
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
                          aria-label={t.step4.videoPreviewAria(a.file.name)}
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
                              aria-label={audioPlaying ? t.step4.audioPauseAria : t.step4.audioPlayAria}
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
                        aria-label={t.step4.removeAttachment(a.file.name)}
                        onClick={() => removeAttachment(a.id)}
                      >
                        {t.step4.remove}
                      </button>
                    </div>
                    <div className={styles.previewCaption}>
                      {a.file.name}
                      <br />
                      <span style={{ opacity: 0.85 }}>{formatBytes(a.file.size, locale)}</span>
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
                {t.back}
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.stepBtnNext}`}
                disabled={submitting || (turnstileEnabled && !turnstileToken)}
              >
                {submitting ? t.submitting : t.submit}
              </button>
            </div>
          </div>
        </section>
      </div>

      {activeStep === lastStepIndex ? (
        <div className={styles.formFooter}>
          <div className={styles.footerLeft}>
            <p className={styles.footerNote}>
              {t.footer.note(photoMaxLabel, videoMaxLabel, MAX_FILES)}
            </p>
            <p className={styles.footerLegal}>
              {t.footer.legalPrefix}{" "}
              <a href={t.footer.termsHref} target="_blank" rel="noreferrer">
                {t.footer.legalLink}
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
          aria-label={t.success.aria}
        >
          <div className={styles.submitOverlayInner}>
            <div className={styles.submitSuccessIcon} aria-hidden>
              ✓
            </div>
            <p className={styles.submitOverlayTitle}>{t.success.title}</p>
            <p className={styles.submitOverlayLabel}>{submitSuccessMessage}</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.stepBtnNext} ${styles.submitOverlayBtn}`}
              onClick={dismissSubmitSuccess}
            >
              {t.success.close}
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
            <p className={styles.submitOverlayTitle}>{t.error.title}</p>
            <p className={styles.submitOverlayLabel}>{submitErrorMessage}</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.stepBtnNext} ${styles.submitOverlayBtn}`}
              onClick={() => setSubmitErrorMessage(null)}
            >
              {t.error.retry}
            </button>
          </div>
        </div>
      ) : submitting ? (
        <div
          className={styles.submitOverlay}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={t.uploading.aria}
        >
          <div className={styles.submitOverlayInner}>
            <div className={styles.submitSpinner} aria-hidden />
            <p className={styles.submitOverlayTitle}>{t.uploading.title}</p>
            <p className={styles.submitOverlayLabel}>
              {uploadProgress
                ? formatSignalementUploadProgressLabel(uploadProgress, locale)
                : t.uploading.preparing}
            </p>
            <div className={styles.submitProgressTrack} aria-hidden>
              <div
                className={styles.submitProgressFill}
                style={{ width: `${overallUploadPercent}%` }}
              />
            </div>
            <p className={styles.submitOverlayPercent}>{overallUploadPercent}%</p>
            <p className={styles.submitOverlayHint}>{t.uploading.doNotClose}</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
