"use client";

import type { DefaultCellComponentProps } from "payload";

type SignalementRow = {
  estAnonyme?: boolean;
  alerteur?: {
    nom?: string | null;
    email?: string | null;
    tel?: string | null;
  } | null;
};

export function SignalementLanceurCell({ rowData }: DefaultCellComponentProps) {
  const doc = rowData as SignalementRow;

  if (doc.estAnonyme) {
    return <span>Anonyme</span>;
  }

  const nom = doc.alerteur?.nom?.trim();
  if (nom) {
    return <span>{nom}</span>;
  }

  const email = doc.alerteur?.email?.trim();
  if (email) {
    return <span>{email}</span>;
  }

  const tel = doc.alerteur?.tel?.trim();
  if (tel) {
    return <span>{tel}</span>;
  }

  return <span>—</span>;
}
