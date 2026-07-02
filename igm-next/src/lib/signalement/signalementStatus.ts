import type { Signalement } from "@/payload-types";

export type SignalementStatus = NonNullable<Signalement["status"]>;

export const SIGNALEMENT_STATUS_OPTIONS: ReadonlyArray<{
  label: string;
  value: SignalementStatus;
}> = [
  { label: "Nouveau", value: "recu" },
  { label: "En cours d'analyse", value: "en_cours" },
  { label: "Traité", value: "traite" },
  { label: "Classé", value: "cloture" },
];

export const SIGNALEMENT_STATUS_LABELS: Record<SignalementStatus, string> = {
  recu: "Nouveau",
  en_cours: "En cours d'analyse",
  traite: "Traité",
  cloture: "Classé",
};

export function getSignalementStatusLabel(
  status?: Signalement["status"] | null,
): string {
  if (!status) return SIGNALEMENT_STATUS_LABELS.recu;
  return SIGNALEMENT_STATUS_LABELS[status] ?? status;
}
