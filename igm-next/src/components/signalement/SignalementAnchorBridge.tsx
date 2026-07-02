"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { useSignalementModal } from "@/components/signalement/SignalementModalProvider";
import { hrefForRoute } from "@/i18n/paths";

const ATTR = "data-igm-open-signalement";

/**
 * Ouvre la modale signalement pour les liens portant {@link ATTR},
 * avec repli sur navigation normale (Ctrl-clic, etc.).
 */
export default function SignalementAnchorBridge() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { open } = useSignalementModal();
  const reportHref = hrefForRoute("report", locale);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const el = (e.target as HTMLElement | null)?.closest(`a[${ATTR}]`);
      if (!el || !(el instanceof HTMLAnchorElement)) return;

      if (pathname === reportHref) {
        e.preventDefault();
        document.getElementById("igm-signalement")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      e.preventDefault();
      open();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, open, reportHref]);

  return null;
}
