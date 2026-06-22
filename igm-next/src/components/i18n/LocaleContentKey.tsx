"use client";

import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Force le remontage du contenu page à chaque changement d’URL.
 * Évite les erreurs React (insertBefore) lors du passage FR ↔ EN,
 * notamment avec le HTML injecté de la page d’accueil.
 */
export function LocaleContentKey({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  return <Fragment key={pathname}>{children}</Fragment>;
}
