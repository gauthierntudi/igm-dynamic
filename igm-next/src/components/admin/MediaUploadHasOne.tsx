"use client";

import React from "react";

import { resolveMediaThumbnailSrc } from "@/lib/admin/resolveVideoThumbnailSrc";

import { MediaRelationshipContent } from "./MediaRelationshipContent";

const baseClass = "upload upload--has-one";

type Props = {
  className?: string;
  displayPreview?: boolean;
  fileDoc: {
    relationTo: string;
    value: Record<string, unknown> & {
      id?: number | string;
      alt?: string;
      filename?: string;
      filesize?: number;
      mimeType?: string;
      updatedAt?: string;
      width?: number;
      height?: number;
    };
  };
  onRemove: () => void;
  readonly?: boolean;
  reloadDoc?: (id: number | string, collectionSlug: string) => Promise<void> | void;
  serverURL: string;
  showCollectionSlug?: boolean;
};

function UploadCard({
  children,
  className,
  size = "medium",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "medium" | "small";
}) {
  return (
    <div
      className={["upload-field-card", className, `upload-field-card--size-${size}`]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** Remplace UploadComponentHasOne — vignettes vidéo dans les champs upload. */
export function UploadComponentHasOne(props: Props) {
  const {
    className,
    displayPreview,
    fileDoc,
    onRemove,
    readonly,
    reloadDoc,
    serverURL,
    showCollectionSlug = false,
  } = props;

  const { relationTo, value } = fileDoc;
  const id = String(value?.id);

  let src: string | undefined;
  if (typeof value.url === "string" && value.url) {
    try {
      src = new URL(value.url, serverURL).toString();
    } catch {
      src = `${serverURL}${value.url}`;
    }
  }

  const thumbnailSrc = resolveMediaThumbnailSrc(value, serverURL);

  React.useEffect(() => {
    if (!reloadDoc || !value?.id) return;
    if (typeof value.mimeType !== "string" || !value.mimeType.startsWith("video/")) return;
    if (thumbnailSrc) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (attempts > 20) {
        window.clearInterval(timer);
        return;
      }
      void reloadDoc(value.id as number | string, relationTo);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [relationTo, reloadDoc, thumbnailSrc, value?.id, value.mimeType]);

  return (
    <UploadCard className={[baseClass, className].filter(Boolean).join(" ")}>
      <MediaRelationshipContent
        allowEdit={!readonly}
        allowRemove={!readonly}
        alt={(value?.alt as string) || (value?.filename as string)}
        byteSize={value.filesize as number | undefined}
        collectionSlug={relationTo}
        displayPreview={displayPreview}
        filename={value.filename as string}
        id={id}
        mimeType={value?.mimeType as string | undefined}
        onRemove={onRemove}
        reloadDoc={reloadDoc}
        showCollectionSlug={showCollectionSlug}
        src={src}
        thumbnailSrc={thumbnailSrc}
        updatedAt={value.updatedAt as string | undefined}
        x={value?.width as number | undefined}
        y={value?.height as number | undefined}
      />
    </UploadCard>
  );
}
