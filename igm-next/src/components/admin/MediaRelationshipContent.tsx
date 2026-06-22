"use client";

import { getTranslation } from "@payloadcms/translations";
import { formatFilesize } from "payload/shared";
import React from "react";

import { Button, Pill, useConfig, useDocumentDrawer, useTranslation } from "@payloadcms/ui";

import { VideoAwareThumbnail } from "@/components/admin/VideoAwareThumbnail";

const baseClass = "upload-relationship-details";

type Props = {
  id: string;
  allowEdit?: boolean;
  allowRemove?: boolean;
  alt?: string;
  byteSize?: number;
  className?: string;
  collectionSlug: string;
  displayPreview?: boolean;
  filename: string;
  mimeType?: string;
  onRemove: () => void;
  reloadDoc?: (id: number | string, collectionSlug: string) => Promise<void> | void;
  showCollectionSlug?: boolean;
  src?: string;
  thumbnailSrc?: string;
  updatedAt?: string;
  withMeta?: boolean;
  x?: number;
  y?: number;
};

export function MediaRelationshipContent(props: Props) {
  const {
    id,
    allowEdit,
    allowRemove,
    alt,
    byteSize,
    className,
    collectionSlug,
    displayPreview,
    filename,
    mimeType,
    onRemove,
    reloadDoc,
    showCollectionSlug = false,
    src,
    thumbnailSrc,
    updatedAt,
    withMeta = true,
    x,
    y,
  } = props;

  const { config } = useConfig();
  const { i18n } = useTranslation();
  const collectionConfig =
    "collections" in config
      ? config.collections.find((collection) => collection.slug === collectionSlug)
      : undefined;

  const [DocumentDrawer, , { openDrawer }] = useDocumentDrawer({
    id: id ?? undefined,
    collectionSlug,
  });

  const onSave = async ({ doc }: { doc: { id: number | string } }) => reloadDoc?.(doc.id, collectionSlug);

  const metaText = withMeta
    ? [
        byteSize ? formatFilesize(byteSize) : null,
        x && y ? `${x}x${y}` : null,
        mimeType ?? null,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  const previewAllowed = displayPreview ?? collectionConfig?.upload?.displayPreview ?? true;
  const imageCacheTag = collectionConfig?.upload?.cacheTags && updatedAt;

  return (
    <div className={[baseClass, className].filter(Boolean).join(" ")}>
      <div className={`${baseClass}__imageAndDetails`}>
        {previewAllowed ? (
          <VideoAwareThumbnail
            alt={alt}
            className={`${baseClass}__thumbnail`}
            fileSrc={thumbnailSrc}
            filename={filename}
            imageCacheTag={imageCacheTag}
            mimeType={mimeType}
            size="small"
          />
        ) : null}
        {showCollectionSlug && collectionConfig ? (
          <Pill size="small">{getTranslation(collectionConfig.labels.singular, i18n)}</Pill>
        ) : null}
        <div className={`${baseClass}__details`}>
          <p className={`${baseClass}__filename`}>
            {src ? (
              <a href={src} target="_blank" rel="noreferrer">
                {filename}
              </a>
            ) : (
              filename
            )}
          </p>
          {withMeta ? <p className={`${baseClass}__meta`}>{metaText}</p> : null}
        </div>
      </div>
      {allowEdit !== false || allowRemove !== false ? (
        <div className={`${baseClass}__actions`}>
          {allowEdit !== false ? (
            <Button
              buttonStyle="icon-label"
              className={`${baseClass}__edit`}
              icon="edit"
              iconStyle="none"
              onClick={openDrawer}
            />
          ) : null}
          {allowRemove !== false ? (
            <Button
              buttonStyle="icon-label"
              className={`${baseClass}__remove`}
              icon="x"
              iconStyle="none"
              onClick={() => onRemove()}
            />
          ) : null}
          <DocumentDrawer onSave={onSave} />
        </div>
      ) : null}
    </div>
  );
}
