export type OrgChartService = {
  label: string;
  abbr: string;
};

export type OrgChartDepartment = {
  label: string;
  abbr: string;
  services: OrgChartService[];
};

export type OrgChartSupportUnit = {
  label: string;
  abbr: string;
};

export type OrgChartDecreeContent = {
  caption: string;
  panHint: string;
  inspectorGeneral: string;
  deputyInspectorGeneral: string;
  supportLeft: OrgChartSupportUnit[];
  supportRight: OrgChartSupportUnit[];
  departments: OrgChartDepartment[];
  legend: {
    leadership: string;
    support: string;
    department: string;
    service: string;
  };
};

const SUPPORT_LEFT_FR: OrgChartSupportUnit[] = [
  { label: "Cellule Communication", abbr: "CelCom" },
  { label: "Cellule Passation des Marchés", abbr: "CPM" },
  { label: "Cellule Protocole et Relations Publiques", abbr: "CPRP" },
];

const SUPPORT_RIGHT_FR: OrgChartSupportUnit[] = [
  { label: "Coordination de l'Inspection Générale", abbr: "CIG" },
  { label: "Coordination des Inspections Provinciales", abbr: "CIP" },
  { label: "Cellule Audit Interne", abbr: "CAI" },
];

const DEPARTMENTS_FR: OrgChartDepartment[] = [
  {
    label: "Inspection Provinciale des Mines",
    abbr: "IPM",
    services: [],
  },
  {
    label: "Département Inspections des Techniques",
    abbr: "DIT",
    services: [
      { label: "Service Contrôle des Opérations Domaniales", abbr: "SCOD" },
      { label: "Service Contrôle des Normes et Procédures", abbr: "SCONP" },
    ],
  },
  {
    label: "Département Juridique",
    abbr: "DIJ",
    services: [
      { label: "Service Réglementation et Partenariat", abbr: "SEREPA" },
      {
        label: "Service Contrôle des Contrats, Actifs et Participations",
        abbr: "SCAP",
      },
      { label: "Service Contentieux", abbr: "SECONT" },
    ],
  },
  {
    label: "Département Renseignement, Investigations et Opérations",
    abbr: "DRIO",
    services: [
      { label: "Service Renseignement et Filature", abbr: "SEREFI" },
      { label: "Service Enquêtes, Investigations et Opérations", abbr: "SENINOP" },
      { label: "Service Etudes, Documentation et Archives", abbr: "SEDAR" },
    ],
  },
  {
    label: "Département Administration et Finances",
    abbr: "DAF",
    services: [
      {
        label: "Service Ressources Humaines, Logistique et Intendance",
        abbr: "SERHLI",
      },
      { label: "Service Budget et Finances", abbr: "SEBF" },
      { label: "Service Formation et Action Sociale", abbr: "SEFAS" },
    ],
  },
  {
    label:
      "Département Informatique et Technologies de l'Information et de la Communication",
    abbr: "DITIC",
    services: [
      { label: "Service Infrastructures, Systèmes et Réseaux", abbr: "SINFSYRE" },
      {
        label: "Service Génie et Développement Applicatifs/Logiciels",
        abbr: "SEGEDA",
      },
    ],
  },
];

const SUPPORT_LEFT_EN: OrgChartSupportUnit[] = [
  { label: "Communications Unit", abbr: "CelCom" },
  { label: "Procurement Unit", abbr: "CPM" },
  { label: "Protocol and Public Relations Unit", abbr: "CPRP" },
];

const SUPPORT_RIGHT_EN: OrgChartSupportUnit[] = [
  { label: "General Inspection Coordination", abbr: "CIG" },
  { label: "Provincial Inspections Coordination", abbr: "CIP" },
  { label: "Internal Audit Unit", abbr: "CAI" },
];

const DEPARTMENTS_EN: OrgChartDepartment[] = [
  {
    label: "Provincial Mine Inspection",
    abbr: "IPM",
    services: [],
  },
  {
    label: "Technical Inspections Department",
    abbr: "DIT",
    services: [
      { label: "Mining Rights Operations Control Service", abbr: "SCOD" },
      { label: "Standards and Procedures Control Service", abbr: "SCONP" },
    ],
  },
  {
    label: "Legal Department",
    abbr: "DIJ",
    services: [
      { label: "Regulation and Partnership Service", abbr: "SEREPA" },
      {
        label: "Contracts, Assets and Participations Control Service",
        abbr: "SCAP",
      },
      { label: "Litigation Service", abbr: "SECONT" },
    ],
  },
  {
    label: "Intelligence, Investigations and Operations Department",
    abbr: "DRIO",
    services: [
      { label: "Intelligence and Surveillance Service", abbr: "SEREFI" },
      { label: "Inquiries, Investigations and Operations Service", abbr: "SENINOP" },
      { label: "Studies, Documentation and Archives Service", abbr: "SEDAR" },
    ],
  },
  {
    label: "Administration and Finance Department",
    abbr: "DAF",
    services: [
      {
        label: "Human Resources, Logistics and Stewardship Service",
        abbr: "SERHLI",
      },
      { label: "Budget and Finance Service", abbr: "SEBF" },
      { label: "Training and Social Action Service", abbr: "SEFAS" },
    ],
  },
  {
    label: "IT and Information and Communication Technologies Department",
    abbr: "DITIC",
    services: [
      { label: "Infrastructure, Systems and Networks Service", abbr: "SINFSYRE" },
      {
        label: "Engineering and Application/Software Development Service",
        abbr: "SEGEDA",
      },
    ],
  },
];

export function getOrgChartDecreeContent(locale: "fr" | "en"): OrgChartDecreeContent {
  if (locale === "en") {
    return {
      caption: "IGM organizational structure",
      panHint: "Drag to explore the org chart",
      inspectorGeneral: "Inspector General",
      deputyInspectorGeneral: "Deputy Inspector General",
      supportLeft: SUPPORT_LEFT_EN,
      supportRight: SUPPORT_RIGHT_EN,
      departments: DEPARTMENTS_EN,
      legend: {
        leadership: "Leadership",
        support: "Units & coordinations",
        department: "Departments",
        service: "Services",
      },
    };
  }

  return {
    caption: "Organigramme de l'IGM",
    panHint: "Glissez pour explorer l'organigramme",
    inspectorGeneral: "Inspecteur Général",
    deputyInspectorGeneral: "Inspecteur Général Adjoint",
    supportLeft: SUPPORT_LEFT_FR,
    supportRight: SUPPORT_RIGHT_FR,
    departments: DEPARTMENTS_FR,
    legend: {
      leadership: "Direction",
      support: "Cellules & coordinations",
      department: "Départements",
      service: "Services",
    },
  };
}
