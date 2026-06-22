"use client";

import { useFormProcessing, useTranslation } from "@payloadcms/ui";
import React from "react";

import "./media-collection-upload.css";

/** Payload masque le toast « submitting » lors d’une création avec redirect — overlay explicite. */
export function MediaUploadSavingOverlay() {
  const processing = useFormProcessing();
  const { t } = useTranslation();

  if (!processing) return null;

  return (
    <div className="media-collection-upload__saving" role="status" aria-live="polite">
      <span className="media-collection-upload__saving-spinner" aria-hidden="true" />
      <span>{t("general:submitting")}</span>
    </div>
  );
}
