"use client";

import React from "react";

import { Upload, useConfig, useDocumentInfo, useField } from "@payloadcms/ui";

import { createClientVideoThumbnail } from "@/lib/admin/createClientVideoThumbnail";

import { MediaUploadSavingOverlay } from "@/components/admin/MediaUploadSavingOverlay";

import "./media-collection-upload.css";

function resetPreview(wrap: HTMLElement) {
  wrap.removeAttribute("data-video-preview");
  wrap.querySelector(".igm-video-poster")?.remove();
  const defaultThumb = wrap.querySelector(".thumbnail") as HTMLElement | null;
  if (defaultThumb) defaultThumb.style.removeProperty("display");
}

function applyPreview(wrap: HTMLElement, posterSrc: string, alt?: string) {
  wrap.setAttribute("data-video-preview", "true");

  const defaultThumb = wrap.querySelector(".thumbnail") as HTMLElement | null;
  if (defaultThumb) defaultThumb.style.display = "none";

  let img = wrap.querySelector("img.igm-video-poster") as HTMLImageElement | null;
  if (!img) {
    img = document.createElement("img");
    img.className = "igm-video-poster";
    wrap.appendChild(img);
  }

  img.alt = alt ?? "Aperçu vidéo";
  img.src = posterSrc;
}

function VideoUploadPreviewFixup({
  rootRef,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { value } = useField<File | null>({ path: "file" });
  const file = value instanceof File ? value : null;
  const isVideo = Boolean(file?.type.startsWith("video/"));
  const [posterSrc, setPosterSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isVideo || !file) {
      setPosterSrc(null);
      return;
    }

    let cancelled = false;
    void createClientVideoThumbnail(file)
      .then((url) => {
        if (!cancelled) setPosterSrc(url);
      })
      .catch(() => {
        if (!cancelled) setPosterSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [file, isVideo]);

  React.useLayoutEffect(() => {
    const wrap = rootRef.current?.querySelector(
      ".file-field__thumbnail-wrap",
    ) as HTMLElement | null;

    if (!wrap) return;

    if (!isVideo || !posterSrc) {
      resetPreview(wrap);
      return;
    }

    applyPreview(wrap, posterSrc, file?.name);
  }, [rootRef, isVideo, posterSrc, file?.name]);

  React.useEffect(() => {
    const root = rootRef.current;
    return () => {
      const wrap = root?.querySelector(".file-field__thumbnail-wrap") as HTMLElement | null;
      if (wrap) resetPreview(wrap);
    };
  }, [rootRef]);

  return null;
}

/**
 * Slot Upload media — résout uploadConfig via hooks Payload + aperçu vidéo propre.
 */
export function MediaCollectionUpload() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { config } = useConfig();
  const { collectionSlug, initialState } = useDocumentInfo();

  if (!collectionSlug) return null;

  const collectionConfig = config.collections?.find((c) => c.slug === collectionSlug);
  const uploadConfig = collectionConfig?.upload;

  if (!uploadConfig || typeof uploadConfig !== "object") return null;

  return (
    <div ref={rootRef} className="media-collection-upload">
      <Upload
        collectionSlug={collectionSlug}
        initialState={initialState}
        uploadConfig={uploadConfig}
      />
      <VideoUploadPreviewFixup rootRef={rootRef} />
      <MediaUploadSavingOverlay />
    </div>
  );
}
