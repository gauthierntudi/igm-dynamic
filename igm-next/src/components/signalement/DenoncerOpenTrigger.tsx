"use client";

import { usePathname } from "next/navigation";
import {
  Suspense,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

import { useSignalementModal } from "@/components/signalement/SignalementModalProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { hrefForRoute } from "@/i18n/paths";

function PrimaryButtonContent({ label }: { label: string }) {
  return (
    <>
      <span className="icon">
        <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke="currentColor"
            d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="content">{label}</span>
      <span className="icon two">
        <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke="currentColor"
            d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </>
  );
}

type Variant = "navSubmenu" | "primary";

type Props = {
  variant: Variant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

function DenoncerOpenTriggerImpl({ variant, className, style, children }: Props) {
  const pathname = usePathname();
  const { locale, messages } = useLocale();
  const { open } = useSignalementModal();
  const reportHref = hrefForRoute("report", locale);
  const onDenoncerPage = pathname === reportHref || pathname === "/denoncer";
  const label = messages.common.report;

  const href = onDenoncerPage ? "#igm-signalement" : reportHref;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onDenoncerPage) return;
    e.preventDefault();
    open();
  };

  if (variant === "primary") {
    return (
      <a href={href} className={className} style={style} onClick={handleClick}>
        {children ?? <PrimaryButtonContent label={label} />}
      </a>
    );
  }

  return (
    <a href={href} onClick={handleClick}>
      {children ?? label}
    </a>
  );
}

function DenoncerOpenTriggerFallback({ variant, className, style, children }: Props) {
  if (variant === "primary") {
    return (
      <a href="/denoncer" className={className} style={style}>
        {children ?? <PrimaryButtonContent label="Dénoncer" />}
      </a>
    );
  }
  return <a href="/denoncer">{children ?? "Dénoncer"}</a>;
}

export function DenoncerOpenTrigger(props: Props) {
  return (
    <Suspense fallback={<DenoncerOpenTriggerFallback {...props} />}>
      <DenoncerOpenTriggerImpl {...props} />
    </Suspense>
  );
}
