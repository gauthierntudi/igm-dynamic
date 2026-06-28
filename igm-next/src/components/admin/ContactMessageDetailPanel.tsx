"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import React, { useMemo } from "react";

import type { ContactMessage } from "@/payload-types";

import "./contact-message-detail-panel.css";

const STATUS_LABELS: Record<NonNullable<ContactMessage["status"]>, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function ContactMessageDetailPanel() {
  const { initialData } = useDocumentInfo();
  const doc = initialData as ContactMessage | undefined;

  const rows = useMemo(() => {
    if (!doc) return [];
    return [
      { label: "Reçu le", value: formatDate(doc.createdAt) },
      { label: "Statut", value: STATUS_LABELS[doc.status ?? "nouveau"] ?? doc.status ?? "—" },
      { label: "Langue", value: doc.locale?.toUpperCase() ?? "—" },
      { label: "Nom", value: doc.name ?? "—" },
      { label: "E-mail", value: doc.email ?? "—", href: doc.email ? `mailto:${doc.email}` : undefined },
      { label: "Téléphone", value: doc.phone ?? "—", href: doc.phone ? `tel:${doc.phone.replace(/\s/g, "")}` : undefined },
      { label: "Objet", value: doc.subject ?? "—" },
    ];
  }, [doc]);

  if (!doc) {
    return <p className="igm-contact-admin-empty">Chargement…</p>;
  }

  return (
    <div className="igm-contact-admin-panel">
      <header className="igm-contact-admin-panel__head">
        <h2 className="igm-contact-admin-panel__title">{doc.subject}</h2>
        <p className="igm-contact-admin-panel__meta">
          {doc.name} · {formatDate(doc.createdAt)}
        </p>
      </header>

      <dl className="igm-contact-admin-panel__grid">
        {rows.map((row) => (
          <div key={row.label} className="igm-contact-admin-panel__row">
            <dt>{row.label}</dt>
            <dd>
              {row.href && row.value !== "—" ? (
                <a href={row.href}>{row.value}</a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <section className="igm-contact-admin-panel__message">
        <h3>Message</h3>
        <div className="igm-contact-admin-panel__message-body">{doc.message}</div>
      </section>
    </div>
  );
}
