"use client";

import { useEffect } from "react";

import type { WhoWeAreSectionId } from "@/i18n/paths";

type Props = {
  sectionId: WhoWeAreSectionId | null;
};

export function WhoWeAreScrollOnMount({ sectionId }: Props) {
  useEffect(() => {
    if (!sectionId || sectionId === "about") return;

    const target = document.getElementById(`igm-wwa-${sectionId}`);
    if (!target) return;

    const headerOffset = 96;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, [sectionId]);

  return null;
}
