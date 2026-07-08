import type { Edge, Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";

import type { OrgChartDecreeContent } from "./orgChartDecreeData";
import {
  ORG_CHART_ELK_OPTIONS,
  buildOrgChartGraph,
  collectElkPositions,
  type OrgChartNodeData,
} from "./buildOrgChartFlowLayout";

const elk = new ELK();

export async function layoutOrgChartWithElk(
  content: OrgChartDecreeContent,
): Promise<{ nodes: Node<OrgChartNodeData>[]; edges: Edge[] }> {
  const { nodes, edges, elkChildren, elkEdges } = buildOrgChartGraph(content);

  const layout = await elk.layout({
    id: "root",
    layoutOptions: ORG_CHART_ELK_OPTIONS,
    children: elkChildren,
    edges: elkEdges,
  });

  const positions = collectElkPositions(layout);

  const flowNodes: Node<OrgChartNodeData>[] = nodes.map((node) => ({
    id: node.id,
    type: "orgChart",
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: node.data,
    width: node.width,
    height: node.height,
    draggable: false,
    selectable: false,
  }));

  const flowEdges: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    style: { stroke: "#1a1a1a", strokeWidth: 1.5 },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}
