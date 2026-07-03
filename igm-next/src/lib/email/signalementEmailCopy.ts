import type { SupportedLocale } from "@/i18n/locales";

type AcknowledgementCopy = {
  subject: (reference: string) => string;
  greetingNamed: (name: string) => string;
  greetingDefault: string;
  headline: string;
  bodyIntro: string;
  bodyLegal: string;
  textRegistered: string;
  textConfidential: string;
  textKeepReference: string;
  referenceLabel: string;
  receivedMessage: (reference: string, ackSent: boolean) => string;
  ackSentNote: string;
};

const COPY: Record<SupportedLocale, AcknowledgementCopy> = {
  fr: {
    subject: (reference) => `[IGM] Accusé de réception — ${reference}`,
    greetingNamed: (name) => `Bonjour ${name},`,
    greetingDefault: "Bonjour,",
    headline: "Votre signalement a bien été enregistré",
    bodyIntro:
      "Nous accusons réception de votre signalement transmis à l'Inspection Générale des Mines (IGM).",
    bodyLegal:
      "Votre déclaration sera examinée par nos équipes dans le cadre de nos missions légales. Les informations transmises sont traitées de manière confidentielle.",
    textRegistered:
      "Nous accusons réception de votre signalement transmis à l'Inspection Générale des Mines (IGM).",
    textConfidential:
      "Votre déclaration a été enregistrée et sera examinée par nos équipes dans le cadre de nos missions légales. Les informations transmises sont traitées de manière confidentielle.",
    textKeepReference:
      "Conservez cette référence pour toute correspondance ultérieure avec l'IGM.",
    referenceLabel: "Votre référence",
    receivedMessage: (reference, ackSent) =>
      `Signalement ${reference} reçu.${ackSent ? " Un accusé de réception vous a été envoyé par e-mail." : ""}`,
    ackSentNote: " Un accusé de réception vous a été envoyé par e-mail.",
  },
  en: {
    subject: (reference) => `[IGM] Acknowledgement of receipt — ${reference}`,
    greetingNamed: (name) => `Hello ${name},`,
    greetingDefault: "Hello,",
    headline: "Your report has been successfully registered",
    bodyIntro:
      "We acknowledge receipt of your report submitted to the General Inspectorate of Mines (IGM).",
    bodyLegal:
      "Your submission will be reviewed by our teams as part of our statutory duties. The information provided is treated confidentially.",
    textRegistered:
      "We acknowledge receipt of your report submitted to the General Inspectorate of Mines (IGM).",
    textConfidential:
      "Your submission has been recorded and will be reviewed by our teams as part of our statutory duties. The information provided is treated confidentially.",
    textKeepReference: "Please keep this reference for any further correspondence with the IGM.",
    referenceLabel: "Your reference",
    receivedMessage: (reference, ackSent) =>
      `Report ${reference} received.${ackSent ? " An acknowledgement e-mail has been sent to you." : ""}`,
    ackSentNote: " An acknowledgement e-mail has been sent to you.",
  },
};

export function resolveSignalementLocale(value?: string | null): SupportedLocale {
  return value?.trim() === "en" ? "en" : "fr";
}

export function getSignalementAcknowledgementCopy(locale: SupportedLocale): AcknowledgementCopy {
  return COPY[locale];
}
