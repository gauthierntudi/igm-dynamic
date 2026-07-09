import type { Node } from "@xyflow/react";

import type { OrgChartDecreeContent } from "./orgChartDecreeData";

export type OrgChartConnector = {
  id: string;
  path: string;
  arrowEnd?: boolean;
  arrowOrient?: "auto" | "right";
};

export type OrgChartNodeTone = "leadership" | "support" | "department" | "service";

export type OrgChartNodeData = {
  label: string;
  tone: OrgChartNodeTone;
  compact?: boolean;
};

type NodeLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Positions calquées sur le schéma officiel (organigramme décret). */
const NODE_LAYOUT: Record<string, NodeLayout> = {
  ig: { x: 620, y: 20, width: 380, height: 72 },
  iga: { x: 650, y: 115, width: 320, height: 68 },
  IPM: { x: 30, y: 430, width: 205, height: 165 },
  CelCom: { x: 140, y: 225, width: 360, height: 54 },
  CPM: { x: 140, y: 285, width: 360, height: 54 },
  CPRP: { x: 140, y: 345, width: 360, height: 54 },
  CIG: { x: 1110, y: 225, width: 360, height: 54 },
  CIP: { x: 1110, y: 285, width: 360, height: 54 },
  CAI: { x: 1110, y: 345, width: 360, height: 54 },
  DIT: { x: 260, y: 430, width: 208, height: 168 },
  DIJ: { x: 520, y: 430, width: 208, height: 168 },
  DRIO: { x: 780, y: 430, width: 208, height: 168 },
  DAF: { x: 1040, y: 430, width: 208, height: 168 },
  DITIC: { x: 1280, y: 430, width: 208, height: 168 },
};

const SERVICE_SIZE = { width: 200, height: 108 };
const SERVICE_FIRST_ROW_GAP = 52;
const SERVICE_ROW_GAP = 47;
const SERVICE_TRUNK_OFFSET = 35;
const SERVICE_ARROW_GAP = 12;
const DEPT_BUS_GAP = 24;
const DEPT_ARROW_GAP = 3;
const IPM_BRANCH_GAP = 18;

const DEPT_DISPLAY_LINES: Record<string, string[]> = {
  IPM: ["INSPECTION", "PROVINCIALE", "DES MINES"],
  DIT: ["DÉPARTEMENT", "INSPECTIONS DES", "TECHNIQUES (DIT)"],
  DIJ: ["DÉPARTEMENT", "JURIDIQUE (DIJ)"],
  DRIO: ["DÉPARTEMENT", "RENSEIGNEMENT,", "INVESTIGATIONS ET", "OPÉRATIONS (DRIO)"],
  DAF: ["DÉPARTEMENT", "ADMINISTRATION ET", "FINANCES (DAF)"],
  DITIC: [
    "DÉPARTEMENT",
    "INFORMATIQUE ET",
    "TECHNOLOGIES DE",
    "L'INFORMATION ET",
    "DE LA COMMUNICATION",
    "(DITIC)",
  ],
};

const DEPT_DISPLAY_LINES_EN: Record<string, string[]> = {
  IPM: ["PROVINCIAL", "MINE", "INSPECTION"],
  DIT: ["TECHNICAL", "INSPECTIONS", "DEPARTMENT (DIT)"],
  DIJ: ["LEGAL", "DEPARTMENT (DIJ)"],
  DRIO: ["INTELLIGENCE,", "INVESTIGATIONS AND", "OPERATIONS", "DEPARTMENT (DRIO)"],
  DAF: ["ADMINISTRATION", "AND FINANCE", "DEPARTMENT (DAF)"],
  DITIC: ["IT AND ICT", "DEPARTMENT", "(DITIC)"],
};

const MAIN_DEPARTMENTS = ["DIT", "DIJ", "DRIO", "DAF", "DITIC"] as const;
const SUPPORT_LEFT = ["CelCom", "CPM", "CPRP"] as const;
const SUPPORT_RIGHT = ["CIG", "CIP", "CAI"] as const;

function layoutOf(id: string): NodeLayout {
  const layout = NODE_LAYOUT[id];
  if (!layout) throw new Error(`Missing layout for org chart node: ${id}`);
  return layout;
}

function registerLayout(id: string, layout: NodeLayout): void {
  NODE_LAYOUT[id] = layout;
}

function serviceLayoutForDepartment(
  departmentId: string,
  serviceIndex: number,
): NodeLayout {
  const department = layoutOf(departmentId);

  return {
    x: department.x + department.width / 2,
    y:
      department.y +
      department.height +
      SERVICE_FIRST_ROW_GAP +
      serviceIndex * (SERVICE_SIZE.height + SERVICE_ROW_GAP),
    width: SERVICE_SIZE.width,
    height: SERVICE_SIZE.height,
  };
}

function topCenter(id: string): { x: number; y: number } {
  const n = layoutOf(id);
  return { x: n.x + n.width / 2, y: n.y };
}

function bottomCenter(id: string): { x: number; y: number } {
  const n = layoutOf(id);
  return { x: n.x + n.width / 2, y: n.y + n.height };
}

function rightCenter(id: string): { x: number; y: number } {
  const n = layoutOf(id);
  return { x: n.x + n.width, y: n.y + n.height / 2 };
}

function leftCenter(id: string): { x: number; y: number } {
  const n = layoutOf(id);
  return { x: n.x, y: n.y + n.height / 2 };
}

function spineX(): number {
  return bottomCenter("iga").x;
}

function supportTopY(): number {
  return rightCenter(SUPPORT_LEFT[0]).y;
}

function supportBottomY(): number {
  return rightCenter(SUPPORT_LEFT[SUPPORT_LEFT.length - 1]).y;
}

function ipmBranchY(): number {
  return bottomCenter("iga").y + IPM_BRANCH_GAP;
}

function deptBusY(): number {
  return topCenter(MAIN_DEPARTMENTS[0]).y - DEPT_BUS_GAP;
}

function pathFromPoints(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y}${rest.map((p) => ` L ${p.x} ${p.y}`).join("")}`;
}

function pathConnector(
  id: string,
  points: Array<{ x: number; y: number }>,
  arrowEnd = false,
  arrowOrient: "auto" | "right" = "auto",
): OrgChartConnector {
  return {
    id,
    path: pathFromPoints(points),
    arrowEnd,
    arrowOrient,
  };
}

function formatSupportLabel(label: string, abbr: string): string {
  return `${label} (${abbr})`;
}

function formatDepartmentLabel(abbr: string, locale: "fr" | "en"): string {
  const lines = locale === "en" ? DEPT_DISPLAY_LINES_EN[abbr] : DEPT_DISPLAY_LINES[abbr];
  return lines?.join("\n") ?? abbr;
}

function formatServiceLabel(label: string, abbr: string): string {
  return `${label} (${abbr})`;
}

function makeNode(
  id: string,
  label: string,
  tone: OrgChartNodeTone,
  compact?: boolean,
): Node<OrgChartNodeData> {
  const layout = layoutOf(id);

  return {
    id,
    type: "orgChart",
    position: { x: layout.x, y: layout.y },
    data: { label, tone, compact },
    width: layout.width,
    height: layout.height,
    style: {
      width: layout.width,
      height: layout.height,
    },
    draggable: false,
    selectable: false,
  };
}

function buildSpineAndSupportConnectors(): OrgChartConnector[] {
  const connectors: OrgChartConnector[] = [];
  const igBottom = bottomCenter("ig");
  const igaTop = topCenter("iga");
  const igaBottom = bottomCenter("iga");
  const ipmTop = topCenter("IPM");
  const spine = spineX();
  const supportTop = supportTopY();
  const supportBottom = supportBottomY();
  const ipmBranch = ipmBranchY();

  connectors.push(
    pathConnector("e-ig-iga", [igBottom, igaTop], true),
    pathConnector(
      "e-iga-spine",
      [igaBottom, { x: spine, y: igaBottom.y }, { x: spine, y: ipmBranch }],
      false,
    ),
    pathConnector(
      "e-iga-ipm-horizontal",
      [{ x: spine, y: ipmBranch }, { x: ipmTop.x, y: ipmBranch }],
      false,
    ),
    pathConnector(
      "e-iga-ipm-drop",
      [{ x: ipmTop.x, y: ipmBranch }, { x: ipmTop.x, y: ipmTop.y }],
      true,
    ),
    pathConnector(
      "e-spine-after-ipm",
      [{ x: spine, y: ipmBranch }, { x: spine, y: supportTop }],
      false,
    ),
    pathConnector(
      "e-support-spine",
      [{ x: spine, y: supportTop }, { x: spine, y: supportBottom }],
      false,
    ),
  );

  for (const id of SUPPORT_LEFT) {
    const y = rightCenter(id).y;
    const right = rightCenter(id).x;
    connectors.push(
      pathConnector(`e-spine-${id}`, [{ x: spine, y }, { x: right, y }], false),
    );
  }

  for (const id of SUPPORT_RIGHT) {
    const y = leftCenter(id).y;
    const left = leftCenter(id).x;
    connectors.push(
      pathConnector(`e-spine-${id}`, [{ x: spine, y }, { x: left, y }], false),
    );
  }

  const leftRailX = rightCenter("CelCom").x;
  const rightRailX = leftCenter("CIG").x;
  connectors.push(
    pathConnector(
      "e-support-left-rail",
      [{ x: leftRailX, y: supportTop }, { x: leftRailX, y: supportBottom }],
      false,
    ),
    pathConnector(
      "e-support-right-rail",
      [{ x: rightRailX, y: supportTop }, { x: rightRailX, y: supportBottom }],
      false,
    ),
  );

  return connectors;
}

function buildIpmAndDepartmentConnectors(): OrgChartConnector[] {
  const connectors: OrgChartConnector[] = [];
  const spine = spineX();
  const supportBottom = supportBottomY();
  const deptBus = deptBusY();

  connectors.push(
    pathConnector(
      "e-spine-dept-bus",
      [{ x: spine, y: supportBottom }, { x: spine, y: deptBus }],
      false,
    ),
  );

  const deptTops = MAIN_DEPARTMENTS.map((id) => topCenter(id));
  const busLeftX = deptTops[0].x;
  const busRightX = deptTops[deptTops.length - 1].x;

  connectors.push(
    pathConnector(
      "e-dept-bus",
      [{ x: busLeftX, y: deptBus }, { x: busRightX, y: deptBus }],
      false,
    ),
    pathConnector(
      "e-spine-to-dept-bus",
      [{ x: spine, y: deptBus }, { x: busLeftX, y: deptBus }],
      false,
    ),
  );

  for (const id of MAIN_DEPARTMENTS) {
    const top = topCenter(id);
    connectors.push(
      pathConnector(
        `e-dept-drop-${id}`,
        [
          { x: top.x, y: deptBus },
          { x: top.x, y: top.y - DEPT_ARROW_GAP },
        ],
        true,
      ),
    );
  }

  return connectors;
}

function buildServiceConnectors(
  departmentAbbr: string,
  serviceAbbrs: string[],
): OrgChartConnector[] {
  if (serviceAbbrs.length === 0) return [];

  const connectors: OrgChartConnector[] = [];
  const deptBottom = bottomCenter(departmentAbbr);
  const trunkX = deptBottom.x - SERVICE_TRUNK_OFFSET;
  const serviceYs = serviceAbbrs.map((id) => leftCenter(id).y);
  const trunkEndY = Math.max(...serviceYs);

  connectors.push(
    pathConnector(
      `e-${departmentAbbr}-trunk-bridge`,
      [deptBottom, { x: trunkX, y: deptBottom.y }],
      false,
    ),
    pathConnector(
      `e-${departmentAbbr}-trunk`,
      [
        { x: trunkX, y: deptBottom.y },
        { x: trunkX, y: trunkEndY },
      ],
      false,
    ),
  );

  for (const serviceId of serviceAbbrs) {
    const serviceLeft = leftCenter(serviceId);
    connectors.push(
      pathConnector(
        `e-${departmentAbbr}-${serviceId}`,
        [
          { x: trunkX, y: serviceLeft.y },
          { x: serviceLeft.x - SERVICE_ARROW_GAP, y: serviceLeft.y },
        ],
        true,
        "right",
      ),
    );
  }

  return connectors;
}

export function buildOrgChartFixedLayout(
  content: OrgChartDecreeContent,
  locale: "fr" | "en",
): { nodes: Node<OrgChartNodeData>[]; connectors: OrgChartConnector[] } {
  const nodes: Node<OrgChartNodeData>[] = [
    makeNode("ig", content.inspectorGeneral.toUpperCase(), "leadership"),
    makeNode("iga", content.deputyInspectorGeneral.toUpperCase(), "leadership", true),
  ];

  for (const unit of content.supportLeft) {
    nodes.push(
      makeNode(unit.abbr, formatSupportLabel(unit.label, unit.abbr), "support"),
    );
  }

  for (const unit of content.supportRight) {
    nodes.push(
      makeNode(unit.abbr, formatSupportLabel(unit.label, unit.abbr), "support"),
    );
  }

  const serviceConnectors: OrgChartConnector[] = [];

  for (const department of content.departments) {
    nodes.push(
      makeNode(
        department.abbr,
        formatDepartmentLabel(department.abbr, locale),
        "department",
      ),
    );

    const serviceIds: string[] = [];
    for (const [serviceIndex, service] of department.services.entries()) {
      serviceIds.push(service.abbr);
      registerLayout(
        service.abbr,
        serviceLayoutForDepartment(department.abbr, serviceIndex),
      );
      nodes.push(
        makeNode(
          service.abbr,
          formatServiceLabel(service.label, service.abbr),
          "service",
        ),
      );
    }

    if (department.abbr !== "IPM") {
      serviceConnectors.push(...buildServiceConnectors(department.abbr, serviceIds));
    }
  }

  const connectors: OrgChartConnector[] = [
    ...buildSpineAndSupportConnectors(),
    ...buildIpmAndDepartmentConnectors(),
    ...serviceConnectors,
  ];

  return { nodes, connectors };
}
