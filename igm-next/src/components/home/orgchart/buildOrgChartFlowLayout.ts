import type { OrgChartDecreeContent } from "./orgChartDecreeData";

export type OrgChartNodeTone = "leadership" | "support" | "department" | "service";

export type OrgChartNodeData = {
  label: string;
  sublabel?: string;
  tone: OrgChartNodeTone;
};

type LayoutNode = {
  id: string;
  width: number;
  height: number;
  data: OrgChartNodeData;
};

type LayoutEdge = {
  id: string;
  source: string;
  target: string;
};

const NODE_SIZE = {
  leadership: { width: 280, height: 64 },
  support: { width: 248, height: 54 },
  department: { width: 200, height: 76 },
  service: { width: 200, height: 58 },
} as const;

const COMPOUND_IDS = new Set([
  "support-band",
  "wing-left",
  "wing-right",
  "departments-band",
]);

export function buildOrgChartGraph(content: OrgChartDecreeContent): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  elkChildren: ElkChildren[];
  elkEdges: ElkEdge[];
} {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  const addNode = (
    id: string,
    label: string,
    sublabel: string | undefined,
    tone: OrgChartNodeTone,
  ) => {
    const size = NODE_SIZE[tone];
    nodes.push({ id, ...size, data: { label, sublabel, tone } });
  };

  const addEdge = (source: string, target: string) => {
    edges.push({ id: `${source}->${target}`, source, target });
  };

  addNode("ig", content.inspectorGeneral, undefined, "leadership");
  addNode("iga", content.deputyInspectorGeneral, undefined, "leadership");
  addEdge("ig", "iga");

  const wingLeftChildren = content.supportLeft.map((unit) => {
    addNode(unit.abbr, unit.label, unit.abbr, "support");
    return { id: unit.abbr, width: NODE_SIZE.support.width, height: NODE_SIZE.support.height };
  });

  const wingRightChildren = content.supportRight.map((unit) => {
    addNode(unit.abbr, unit.label, unit.abbr, "support");
    return { id: unit.abbr, width: NODE_SIZE.support.width, height: NODE_SIZE.support.height };
  });

  const departmentColumns = content.departments.map((department) => {
    addNode(department.abbr, department.label, department.abbr, "department");

    const serviceChildren = department.services.map((service) => {
      addNode(service.abbr, service.label, service.abbr, "service");
      addEdge(department.abbr, service.abbr);
      return { id: service.abbr, width: NODE_SIZE.service.width, height: NODE_SIZE.service.height };
    });

    return {
      id: `col-${department.abbr}`,
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.spacing.nodeNode": "14",
      },
      children: [
        { id: department.abbr, width: NODE_SIZE.department.width, height: NODE_SIZE.department.height },
        ...serviceChildren,
      ],
    };
  });

  const elkChildren: ElkChildren[] = [
    { id: "ig", width: NODE_SIZE.leadership.width, height: NODE_SIZE.leadership.height },
    { id: "iga", width: NODE_SIZE.leadership.width, height: NODE_SIZE.leadership.height },
    {
      id: "support-band",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.spacing.nodeNode": "24",
      },
      children: [
        {
          id: "wing-left",
          layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": "DOWN",
            "elk.spacing.nodeNode": "14",
          },
          children: wingLeftChildren,
        },
        {
          id: "wing-right",
          layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": "DOWN",
            "elk.spacing.nodeNode": "14",
          },
          children: wingRightChildren,
        },
      ],
    },
    {
      id: "departments-band",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "18",
      },
      children: departmentColumns,
    },
  ];

  const elkEdges: ElkEdge[] = [
    { id: "e-ig-iga", sources: ["ig"], targets: ["iga"] },
    { id: "e-iga-support", sources: ["iga"], targets: ["support-band"] },
    { id: "e-support-depts", sources: ["support-band"], targets: ["departments-band"] },
  ];

  for (const unit of content.supportLeft) addEdge("iga", unit.abbr);
  for (const unit of content.supportRight) addEdge("iga", unit.abbr);
  for (const department of content.departments) addEdge("iga", department.abbr);

  return { nodes, edges, elkChildren, elkEdges };
}

type ElkChildren = {
  id: string;
  width?: number;
  height?: number;
  layoutOptions?: Record<string, string>;
  children?: ElkChildren[];
};

type ElkEdge = {
  id: string;
  sources: string[];
  targets: string[];
};

type ElkLayoutNode = {
  id: string;
  x?: number;
  y?: number;
  children?: ElkLayoutNode[];
};

export function isOrgChartVisualNode(id: string): boolean {
  if (COMPOUND_IDS.has(id)) return false;
  if (id.startsWith("col-")) return false;
  return true;
}

export function collectElkPositions(
  node: ElkLayoutNode,
  offsetX = 0,
  offsetY = 0,
  acc = new Map<string, { x: number; y: number }>(),
): Map<string, { x: number; y: number }> {
  const x = offsetX + (node.x ?? 0);
  const y = offsetY + (node.y ?? 0);

  if (isOrgChartVisualNode(node.id)) {
    acc.set(node.id, { x, y });
  }

  for (const child of node.children ?? []) {
    collectElkPositions(child, x, y, acc);
  }

  return acc;
}

export const ORG_CHART_ELK_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "52",
  "elk.spacing.nodeNode": "24",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.edgeRouting": "ORTHOGONAL",
} as const;
