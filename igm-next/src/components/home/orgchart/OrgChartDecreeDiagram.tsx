import type { ReactNode } from "react";

import type { SupportedLocale } from "@/i18n/locales";

type Props = {
  locale: SupportedLocale;
};

type BoxTone = "ministry" | "igm" | "leadership" | "branch" | "unit";

type BoxProps = {
  label: string;
  sublabel?: string;
  tone?: BoxTone;
};

function OrgBox({ label, sublabel, tone = "unit" }: BoxProps) {
  return (
    <div className={`igm-orgchart-box igm-orgchart-box--${tone}`}>
      <strong>{label}</strong>
      {sublabel ? <span>{sublabel}</span> : null}
    </div>
  );
}

function Connector({ split = false }: { split?: boolean }) {
  return (
    <div
      className={`igm-orgchart-connector${split ? " igm-orgchart-connector--split" : ""}`}
      aria-hidden
    />
  );
}

function BranchColumn({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="igm-orgchart-branch">
      <OrgBox label={title} sublabel={subtitle} tone="branch" />
      <Connector />
      <div className="igm-orgchart-units">{children}</div>
    </div>
  );
}

export function OrgChartDecreeDiagram({ locale }: Props) {
  const isEn = locale === "en";

  const caption = isEn
    ? "Organizational structure of the IGM — Decree No. 23/19 of 9 June 2023"
    : "Structure organisationnelle de l'IGM — Décret n° 23/19 du 09 juin 2023";

  const legendLeadership = isEn ? "Leadership" : "Direction";
  const legendCentral = isEn ? "Central administration" : "Administration centrale";
  const legendProvincial = isEn ? "Provincial administration" : "Administration provinciale";

  return (
    <figure className="igm-orgchart-decree">
      <figcaption>{caption}</figcaption>

      <div className="igm-orgchart-layers">
        <div className="igm-orgchart-level">
          <OrgBox
            label={isEn ? "Ministry of Mines" : "Ministère des Mines"}
            sublabel={isEn ? "Hierarchical oversight (Art. 20)" : "Contrôle hiérarchique (art. 20)"}
            tone="ministry"
          />
        </div>

        <Connector />

        <div className="igm-orgchart-level">
          <OrgBox
            label={isEn ? "General Mine Inspection (IGM)" : "Inspection Générale des Mines (IGM)"}
            sublabel={
              isEn
                ? "Administrative and financial autonomy (Art. 1)"
                : "Autonomie administrative et financière (art. 1)"
            }
            tone="igm"
          />
        </div>

        <Connector />

        <div className="igm-orgchart-level igm-orgchart-level--duo">
          <p className="igm-orgchart-level-label">{legendLeadership}</p>
          <div className="igm-orgchart-row">
            <OrgBox
              label={isEn ? "Inspector General" : "Inspecteur général"}
              sublabel={isEn ? "Planning & supervision (Art. 10)" : "Planification & supervision (art. 10)"}
              tone="leadership"
            />
            <OrgBox
              label={isEn ? "Deputy Inspector General" : "Inspecteur général adjoint"}
              sublabel={isEn ? "Support & acting role (Art. 11)" : "Assistance & intérim (art. 11)"}
              tone="leadership"
            />
          </div>
        </div>

        <Connector split />

        <div className="igm-orgchart-level igm-orgchart-level--split">
          <BranchColumn
            title={legendCentral}
            subtitle={isEn ? "Head office in Kinshasa (Art. 3 & 7)" : "Siège à Kinshasa (art. 3 & 7)"}
          >
            <OrgBox label={isEn ? "General inspection" : "Inspection générale"} />
            <OrgBox label={isEn ? "Departments" : "Départements"} />
            <OrgBox label={isEn ? "Services" : "Services"} />
          </BranchColumn>

          <BranchColumn
            title={legendProvincial}
            subtitle={isEn ? "Nationwide coverage (Art. 2 & 8)" : "Couverture nationale (art. 2 & 8)"}
          >
            <OrgBox
              label={isEn ? "Provincial inspection" : "Inspection provinciale"}
              sublabel={isEn ? "Provincial Inspector (Art. 12-13)" : "Inspecteur provincial (art. 12-13)"}
            />
            <OrgBox label={isEn ? "Brigades" : "Brigades"} />
            <OrgBox label={isEn ? "Field units" : "Antennes"} />
          </BranchColumn>
        </div>
      </div>

      <ul className="igm-orgchart-legend" aria-label={isEn ? "Legend" : "Légende"}>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--leadership" />
          {legendLeadership}
        </li>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--branch" />
          {isEn ? "Administrative branches" : "Branches administratives"}
        </li>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--unit" />
          {isEn ? "Operational units" : "Unités opérationnelles"}
        </li>
      </ul>
    </figure>
  );
}
