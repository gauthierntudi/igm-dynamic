import { withDeployedBase } from "@/lib/deployBasePath";
import { getMessages } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/locales";

type Props = {
  locale: SupportedLocale;
};

export function SiteLoader({ locale }: Props) {
  const m = getMessages(locale).loader;

  return (
    <div
      id="igm-loader"
      className="igm-loader"
      role="status"
      aria-live="polite"
      data-loader-words={JSON.stringify(m.words)}
    >
      <div className="igm-loader-inner">
        <img
          className="igm-loader-icon"
          src={withDeployedBase("/assets/img/flaticon.png")}
          alt="IGM"
        />
        <div className="igm-loader-typewriter" aria-label={m.ariaLabel}>
          <div className="line is-typing" />
        </div>
        <div className="igm-loader-progress" aria-label={m.loading}>
          <span className="value">0%</span>
        </div>
      </div>
    </div>
  );
}
