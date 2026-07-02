import { withDeployedBase } from "@/lib/deployBasePath";

export function SiteLoader() {
  return (
    <div id="igm-loader" className="igm-loader" role="status" aria-live="polite">
      <div className="igm-loader-inner">
        <img
          className="igm-loader-icon"
          src={withDeployedBase("/assets/img/flaticon.png")}
          alt="IGM"
        />
        <div
          className="igm-loader-typewriter"
          aria-label="Inspection Générale de Mines — Bienvenue"
        >
          <div className="line is-typing" />
        </div>
        <div className="igm-loader-progress" aria-label="Chargement">
          <span className="value">0%</span>
        </div>
      </div>
    </div>
  );
}
