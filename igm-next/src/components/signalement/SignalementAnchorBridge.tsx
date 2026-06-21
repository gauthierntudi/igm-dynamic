"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useSignalementModal } from "@/components/signalement/SignalementModalProvider";

const ATTR = "data-igm-open-signalement";

/**
 * Ouvre la modale signalement pour les liens HTML statiques (ex. marketing-agency.html)
 * portant {@link ATTR}, avec repli sur navigation normale (Ctrl-clic, etc.).
 */
export default function SignalementAnchorBridge() {
  const pathname = usePathname();
  const { open } = useSignalementModal();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const el = (e.target as HTMLElement | null)?.closest(`a[${ATTR}]`);
      if (!el || !(el instanceof HTMLAnchorElement)) return;

      if (pathname === "/denoncer") {
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
  }, [pathname, open]);

  return null;
}
