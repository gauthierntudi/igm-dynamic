import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";

import { PROVINCES_RDC, TYPES_INFRACTION, type TypeInfraction } from "./constants";
import type { UploadProgress } from "./submitSignalementClient";

export type SignalementFormStep = {
  short: string;
  title: string;
};

export type SignalementFormCopy = {
  modalCloseAria: string;
  progressAria: string;
  stepAria: (index: number, title: string) => string;
  steps: readonly SignalementFormStep[];
  optional: string;
  requiredTitle: string;
  back: string;
  next: string;
  submit: string;
  submitting: string;
  step0: {
    titlePrefix: string;
    titleAccent: string;
    hintAnonymous: string;
    hintIdentified: string;
    anonymousOn: string;
    anonymousOff: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    contactRequiredHint: string;
  };
  step1: {
    titlePrefix: string;
    titleAccent: string;
    hint: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
  };
  step2: {
    titleAccent: string;
    titleOptional: string;
    hint: string;
    provinceLabel: string;
    provincePlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    coordsLabel: string;
    coordsPlaceholder: string;
    geoButton: string;
    geoLoading: string;
    geoAutoHint: string;
    geoAccuracy: (meters: number) => string;
  };
  step3: {
    titlePrefix: string;
    titleAccent: string;
    titleOptional: string;
    hint: string;
    typeLabel: string;
    typePlaceholder: string;
  };
  step4: {
    titlePrefix: string;
    titleAccent: string;
    titleOptional: string;
    hint: string;
    limits: (photoMax: string, videoMax: string, maxFiles: number, totalMax: string) => string;
    attachmentsAria: string;
    photosVideos: string;
    photosVideosHint: string;
    audioFile: string;
    audioImport: string;
    stop: string;
    stopHint: string;
    mic: string;
    micHint: string;
    videoPreviewAria: (name: string) => string;
    audioPauseAria: string;
    audioPlayAria: string;
    removeAttachment: (name: string) => string;
    remove: string;
  };
  footer: {
    note: (photoMax: string, videoMax: string, maxFiles: number) => string;
    legalPrefix: string;
    legalLink: string;
    termsHref: string;
  };
  success: {
    aria: string;
    title: string;
    defaultMessage: string;
    close: string;
  };
  error: {
    title: string;
    retry: string;
    network: string;
  };
  uploading: {
    aria: string;
    title: string;
    preparing: string;
    doNotClose: string;
  };
  validation: {
    nameRequired: string;
    contactRequired: string;
    emailInvalid: string;
    descriptionRequired: string;
    describeFactsFirst: string;
    captchaRequired: string;
  };
  toast: {
    captchaUnavailable: string;
    maxFiles: (max: number) => string;
    fileTooLarge: (max: string) => string;
    fileTypeNotAllowed: string;
    playbackFailed: string;
    audioRecordingUnavailable: string;
    micDenied: string;
    geoUnavailable: string;
    geoDenied: string;
    geoUnavailablePosition: string;
    geoTimeout: string;
    geoFailed: string;
    attachmentsTooHeavy: string;
    fileTooLargeAfterCompression: (limitMb: number) => string;
    maxFilesServer: (max: number) => string;
    duplicateFiles: string;
    uploadFilesFailed: string;
    uploadFailed: string;
    uploadCancelled: string;
    uploadFileProgress: (index: number, total: number) => string;
    uploadRetry: (attempt: number, max: number) => string;
    uploadFinalizing: string;
  };
  infractionLabels: Record<TypeInfraction, string>;
  provinces: readonly string[];
};

const INFRACTION_LABELS: Record<SupportedLocale, Record<TypeInfraction, string>> = {
  fr: {
    "Exploitation illégale": "Exploitation illégale",
    Contrebande: "Contrebande",
    "Sous-déclaration": "Sous-déclaration",
    Corruption: "Corruption",
    "Non-respect des obligations légales": "Non-respect des obligations légales",
    Autre: "Autre",
  },
  en: {
    "Exploitation illégale": "Illegal mining",
    Contrebande: "Smuggling",
    "Sous-déclaration": "Under-reporting",
    Corruption: "Corruption",
    "Non-respect des obligations légales": "Non-compliance with legal obligations",
    Autre: "Other",
  },
};

const COPY: Record<SupportedLocale, SignalementFormCopy> = {
  fr: {
    modalCloseAria: "Fermer le formulaire de signalement",
    progressAria: "Progression du formulaire",
    stepAria: (index, title) => `Étape ${index + 1} : ${title}`,
    steps: [
      { short: "Lanceur", title: "Informations sur le lanceur d’alerte" },
      { short: "Description", title: "Description de l’infraction" },
      { short: "Lieu", title: "Localisation" },
      { short: "Type", title: "Type d’infraction" },
      { short: "Fichiers", title: "Pièces jointes" },
    ],
    optional: "(optionnel)",
    requiredTitle: "Obligatoire",
    back: "← Retour",
    next: "Suivant →",
    submit: "Envoyer",
    submitting: "Envoi…",
    step0: {
      titlePrefix: "Informations sur le",
      titleAccent: "lanceur d’alerte",
      hintAnonymous:
        "Vous pouvez passer à l’étape suivante sans renseigner d’identité. Désactivez le switch pour indiquer vos coordonnées.",
      hintIdentified: "Le nom est obligatoire. Indiquez au moins un e-mail ou un numéro de téléphone.",
      anonymousOn: "Le signalement peut être effectué de manière totalement anonyme.",
      anonymousOff: "Je souhaite renseigner mes coordonnées pour un éventuel suivi.",
      nameLabel: "Nom et prénom",
      namePlaceholder: "Ex. : Jean Mukendi",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "exemple@email.com",
      phoneLabel: "Numéro de téléphone",
      phonePlaceholder: "Ex. : +243 900 000 000",
      contactRequiredHint: "Au moins l’un des deux moyens de contact ci-dessus est requis.",
    },
    step1: {
      titlePrefix: "Description",
      titleAccent: "de l’infraction",
      hint: "Décrivez les faits avec précision (obligatoire).",
      descriptionLabel: "Description des faits",
      descriptionPlaceholder:
        "Contexte, dates, personnes ou entreprises concernées, ce que vous avez observé…",
    },
    step2: {
      titleAccent: "Localisation",
      titleOptional: "(optionnel, recommandé)",
      hint: "Ces informations facilitent la localisation des faits signalés. Vous pouvez passer à l’étape suivante sans les renseigner.",
      provinceLabel: "Province",
      provincePlaceholder: "Facultatif — choisir une province",
      cityLabel: "Ville / site minier",
      cityPlaceholder: "Facultatif — ex. : Kolwezi, site minier…",
      coordsLabel: "Coordonnées géographiques",
      coordsPlaceholder: "Facultatif — latitude, longitude (ex. : -10.723, 25.472)",
      geoButton: "Remplir automatiquement les coordonnées",
      geoLoading: "Localisation…",
      geoAutoHint: "Remplissage auto à l’ouverture de cette étape si le navigateur l’autorise.",
      geoAccuracy: (meters) => `(précision ~${meters} m)`,
    },
    step3: {
      titlePrefix: "Type",
      titleAccent: "d’infraction",
      titleOptional: "(optionnel)",
      hint: "Précisez la nature des faits si vous le souhaitez. Ce champ n’est pas obligatoire.",
      typeLabel: "Type d’infraction",
      typePlaceholder: "Facultatif — sélectionner un type",
    },
    step4: {
      titlePrefix: "Pièces",
      titleAccent: "jointes",
      titleOptional: "(optionnel)",
      hint: "Photos et vidéos (import), ou audio (fichier ou micro). Aperçu avant envoi.",
      limits: (photoMax, videoMax, maxFiles, totalMax) =>
        `${photoMax} (photos/audio) · ${videoMax} (vidéos) · ${maxFiles} fichiers max · ${totalMax} au total`,
      attachmentsAria: "Ajouter des pièces jointes",
      photosVideos: "Photos & vidéos",
      photosVideosHint: "JPG · PNG · MP4…",
      audioFile: "Audio fichier",
      audioImport: "Import",
      stop: "Stop",
      stopHint: "Fin enregistrement",
      mic: "Micro",
      micHint: "Enregistrer",
      videoPreviewAria: (name) => `Aperçu vidéo ${name}`,
      audioPauseAria: "Pause",
      audioPlayAria: "Lire l’audio",
      removeAttachment: (name) => `Supprimer ${name}`,
      remove: "Supprimer",
    },
    footer: {
      note: (photoMax, videoMax, maxFiles) =>
        `Accusé de réception par e-mail si une adresse est renseignée. PJ : ${photoMax} (photos/audio), ${videoMax} (vidéos), ${maxFiles} max.`,
      legalPrefix: "Envoyer = vous confirmez le contenu.",
      legalLink: "Conditions générales",
      termsHref: hrefForRoute("terms", "fr"),
    },
    success: {
      aria: "Signalement envoyé avec succès",
      title: "Signalement envoyé",
      defaultMessage: "Votre signalement a bien été envoyé.",
      close: "Fermer",
    },
    error: {
      title: "Échec de l’envoi",
      retry: "Réessayer",
      network: "Erreur réseau.",
    },
    uploading: {
      aria: "Envoi du signalement en cours",
      title: "Envoi en cours",
      preparing: "Préparation de l’envoi…",
      doNotClose: "Ne fermez pas cette page pendant l’envoi.",
    },
    validation: {
      nameRequired: "Indiquez votre nom et prénom.",
      contactRequired: "Indiquez un e-mail ou un numéro de téléphone.",
      emailInvalid: "Adresse e-mail invalide.",
      descriptionRequired: "Description obligatoire.",
      describeFactsFirst: "Décrivez les faits d’abord.",
      captchaRequired: "Veuillez valider le contrôle de sécurité.",
    },
    toast: {
      captchaUnavailable: "Contrôle de sécurité indisponible. Réessayez.",
      maxFiles: (max) => `Max. ${max} fichiers.`,
      fileTooLarge: (max) => `Fichier trop lourd (max ${max}).`,
      fileTypeNotAllowed: "Type de fichier non autorisé (photos, audio ou vidéo).",
      playbackFailed: "Lecture impossible.",
      audioRecordingUnavailable: "Enregistrement audio indisponible.",
      micDenied: "Micro refusé.",
      geoUnavailable: "Géolocalisation indisponible.",
      geoDenied: "Localisation refusée.",
      geoUnavailablePosition: "Position indisponible.",
      geoTimeout: "Délai dépassé.",
      geoFailed: "Localisation impossible.",
      attachmentsTooHeavy: "Pièces jointes trop lourdes.",
      fileTooLargeAfterCompression: (limitMb) =>
        `Après compression, un fichier dépasse ${limitMb} Mo.`,
      maxFilesServer: (max) => `Maximum ${max} fichiers.`,
      duplicateFiles: "Envoi invalide : fichiers en double.",
      uploadFilesFailed: "Impossible d’enregistrer les fichiers. Réessayez.",
      uploadFailed: "Échec de l’envoi.",
      uploadCancelled: "Envoi annulé.",
      uploadFileProgress: (index, total) => `Envoi du fichier ${index} / ${total}`,
      uploadRetry: (attempt, max) => `Nouvelle tentative (${attempt}/${max})…`,
      uploadFinalizing: "Finalisation du signalement…",
    },
    infractionLabels: INFRACTION_LABELS.fr,
    provinces: PROVINCES_RDC,
  },
  en: {
    modalCloseAria: "Close report form",
    progressAria: "Form progress",
    stepAria: (index, title) => `Step ${index + 1}: ${title}`,
    steps: [
      { short: "Reporter", title: "Whistleblower information" },
      { short: "Description", title: "Description of the offence" },
      { short: "Location", title: "Location" },
      { short: "Type", title: "Type of offence" },
      { short: "Files", title: "Attachments" },
    ],
    optional: "(optional)",
    requiredTitle: "Required",
    back: "← Back",
    next: "Next →",
    submit: "Submit",
    submitting: "Sending…",
    step0: {
      titlePrefix: "Information about the",
      titleAccent: "whistleblower",
      hintAnonymous:
        "You can proceed without providing your identity. Turn off the switch to enter your contact details.",
      hintIdentified: "Name is required. Provide at least an email address or phone number.",
      anonymousOn: "The report can be submitted completely anonymously.",
      anonymousOff: "I would like to provide my contact details for possible follow-up.",
      nameLabel: "Full name",
      namePlaceholder: "E.g. John Smith",
      emailLabel: "Email address",
      emailPlaceholder: "example@email.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "E.g. +243 900 000 000",
      contactRequiredHint: "At least one of the contact methods above is required.",
    },
    step1: {
      titlePrefix: "Description",
      titleAccent: "of the offence",
      hint: "Describe the facts accurately (required).",
      descriptionLabel: "Description of the facts",
      descriptionPlaceholder:
        "Context, dates, people or companies involved, what you observed…",
    },
    step2: {
      titleAccent: "Location",
      titleOptional: "(optional, recommended)",
      hint: "This information helps locate the reported facts. You can proceed without filling it in.",
      provinceLabel: "Province",
      provincePlaceholder: "Optional — select a province",
      cityLabel: "City / mining site",
      cityPlaceholder: "Optional — e.g. Kolwezi, mining site…",
      coordsLabel: "Geographic coordinates",
      coordsPlaceholder: "Optional — latitude, longitude (e.g. -10.723, 25.472)",
      geoButton: "Fill in coordinates automatically",
      geoLoading: "Locating…",
      geoAutoHint: "Auto-fill when this step opens if the browser allows it.",
      geoAccuracy: (meters) => `(accuracy ~${meters} m)`,
    },
    step3: {
      titlePrefix: "Type",
      titleAccent: "of offence",
      titleOptional: "(optional)",
      hint: "Specify the nature of the facts if you wish. This field is not required.",
      typeLabel: "Type of offence",
      typePlaceholder: "Optional — select a type",
    },
    step4: {
      titlePrefix: "Attachments",
      titleAccent: "",
      titleOptional: "(optional)",
      hint: "Photos and videos (import), or audio (file or microphone). Preview before sending.",
      limits: (photoMax, videoMax, maxFiles, totalMax) =>
        `${photoMax} (photos/audio) · ${videoMax} (videos) · ${maxFiles} files max · ${totalMax} total`,
      attachmentsAria: "Add attachments",
      photosVideos: "Photos & videos",
      photosVideosHint: "JPG · PNG · MP4…",
      audioFile: "Audio file",
      audioImport: "Import",
      stop: "Stop",
      stopHint: "End recording",
      mic: "Microphone",
      micHint: "Record",
      videoPreviewAria: (name) => `Video preview ${name}`,
      audioPauseAria: "Pause",
      audioPlayAria: "Play audio",
      removeAttachment: (name) => `Remove ${name}`,
      remove: "Remove",
    },
    footer: {
      note: (photoMax, videoMax, maxFiles) =>
        `Acknowledgement by email if an address is provided. Attachments: ${photoMax} (photos/audio), ${videoMax} (videos), ${maxFiles} max.`,
      legalPrefix: "Submit = you confirm the content.",
      legalLink: "Terms and conditions",
      termsHref: hrefForRoute("terms", "en"),
    },
    success: {
      aria: "Report sent successfully",
      title: "Report sent",
      defaultMessage: "Your report has been sent successfully.",
      close: "Close",
    },
    error: {
      title: "Submission failed",
      retry: "Try again",
      network: "Network error.",
    },
    uploading: {
      aria: "Sending report",
      title: "Sending",
      preparing: "Preparing submission…",
      doNotClose: "Do not close this page while sending.",
    },
    validation: {
      nameRequired: "Please enter your full name.",
      contactRequired: "Please provide an email address or phone number.",
      emailInvalid: "Invalid email address.",
      descriptionRequired: "Description is required.",
      describeFactsFirst: "Please describe the facts first.",
      captchaRequired: "Please complete the security check.",
    },
    toast: {
      captchaUnavailable: "Security check unavailable. Please try again.",
      maxFiles: (max) => `Max. ${max} files.`,
      fileTooLarge: (max) => `File too large (max ${max}).`,
      fileTypeNotAllowed: "File type not allowed (photos, audio or video).",
      playbackFailed: "Playback failed.",
      audioRecordingUnavailable: "Audio recording unavailable.",
      micDenied: "Microphone denied.",
      geoUnavailable: "Geolocation unavailable.",
      geoDenied: "Location denied.",
      geoUnavailablePosition: "Position unavailable.",
      geoTimeout: "Timed out.",
      geoFailed: "Unable to get location.",
      attachmentsTooHeavy: "Attachments too large.",
      fileTooLargeAfterCompression: (limitMb) =>
        `After compression, a file exceeds ${limitMb} MB.`,
      maxFilesServer: (max) => `Maximum ${max} files.`,
      duplicateFiles: "Invalid submission: duplicate files.",
      uploadFilesFailed: "Unable to save files. Please try again.",
      uploadFailed: "Submission failed.",
      uploadCancelled: "Upload cancelled.",
      uploadFileProgress: (index, total) => `Sending file ${index} / ${total}`,
      uploadRetry: (attempt, max) => `Retrying (${attempt}/${max})…`,
      uploadFinalizing: "Finalising report…",
    },
    infractionLabels: INFRACTION_LABELS.en,
    provinces: PROVINCES_RDC,
  },
};

export function getSignalementFormCopy(locale: SupportedLocale): SignalementFormCopy {
  return COPY[locale];
}

export function formatSignalementBytes(n: number, locale: SupportedLocale): string {
  if (n < 1024) return locale === "en" ? `${n} B` : `${n} o`;
  if (n < 1024 * 1024) {
    const value = (n / 1024).toFixed(1);
    return locale === "en" ? `${value} KB` : `${value} Ko`;
  }
  const value = (n / (1024 * 1024)).toFixed(1);
  return locale === "en" ? `${value} MB` : `${value} Mo`;
}

export function formatSignalementGeolocationLine(
  pos: GeolocationPosition,
  locale: SupportedLocale,
): string {
  const t = getSignalementFormCopy(locale);
  const { latitude, longitude, accuracy } = pos.coords;
  const core = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  if (typeof accuracy === "number" && accuracy > 0 && accuracy < 15000) {
    return `${core} ${t.step2.geoAccuracy(Math.round(accuracy))}`;
  }
  return core;
}

export function formatSignalementUploadProgressLabel(
  progress: UploadProgress,
  locale: SupportedLocale,
): string {
  const t = getSignalementFormCopy(locale).toast;
  if (progress.phase === "final") {
    return t.uploadFinalizing;
  }
  if (progress.uploadAttempt && progress.uploadAttempt > 1 && progress.maxUploadAttempts) {
    return t.uploadRetry(progress.uploadAttempt, progress.maxUploadAttempts);
  }
  return t.uploadFileProgress(progress.fileIndex, progress.fileTotal);
}

export function getSignalementInfractionOptions(locale: SupportedLocale) {
  return TYPES_INFRACTION.filter(Boolean).map((value) => ({
    value,
    label: COPY[locale].infractionLabels[value],
  }));
}

export function getSignalementServerMessage(
  key: keyof SignalementFormCopy["toast"] | "descriptionRequired" | "emailInvalid",
  locale: SupportedLocale,
  params?: { max?: number; limitMb?: number },
): string {
  const copy = getSignalementFormCopy(locale);
  switch (key) {
    case "descriptionRequired":
      return copy.validation.descriptionRequired;
    case "emailInvalid":
      return copy.validation.emailInvalid;
    case "maxFiles":
      return copy.toast.maxFiles(params?.max ?? 0);
    case "attachmentsTooHeavy":
      return copy.toast.attachmentsTooHeavy;
    case "duplicateFiles":
      return copy.toast.duplicateFiles;
    case "uploadFilesFailed":
      return copy.toast.uploadFilesFailed;
    case "uploadFailed":
      return copy.toast.uploadFailed;
    case "fileTooLargeAfterCompression":
      return copy.toast.fileTooLargeAfterCompression(params?.limitMb ?? 0);
    default:
      return copy.toast.uploadFailed;
  }
}
