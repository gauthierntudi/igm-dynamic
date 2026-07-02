import Link from "next/link";

import { getMessages } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";

type Props = {
  locale: SupportedLocale;
};

export function UnderConstruction({ locale }: Props) {
  const m = getMessages(locale).underConstruction;
  const homeHref = hrefForRoute("home", locale);

  return (
    <main className="igm-under-construction" role="status" aria-live="polite">
      <div className="igm-under-construction-inner">
        <div className="igm-under-construction-card">
          <div className="igm-under-construction-icon" aria-hidden>
            <span className="igm-under-construction-cogs">
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-a" />
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-b" />
            </span>
          </div>
          <p className="igm-under-construction-eyebrow">{m.eyebrow}</p>
          <h1 className="igm-under-construction-title">{m.title}</h1>
          <p className="igm-under-construction-lead">{m.lead}</p>
          <div className="igm-under-construction-actions">
            <Link href={homeHref} className="igm-under-construction-btn igm-under-construction-btn-primary">
              {m.backHome}
            </Link>
            <a href="tel:+243976844563" className="igm-under-construction-btn igm-under-construction-btn-ghost">
              {m.callUs}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
