import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import type { OrgChartNodeData } from "./buildOrgChartFixedLayout";

function OrgChartFlowNodeComponent({ data }: NodeProps) {
  const nodeData = data as OrgChartNodeData;

  return (
    <div
      className={[
        "igm-orgchart-flow-node",
        `igm-orgchart-flow-node--${nodeData.tone}`,
        nodeData.compact ? "igm-orgchart-flow-node--compact" : "",
        nodeData.tone === "service" ? "igm-orgchart-flow-node--service" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="igm-orgchart-flow-node__label">{nodeData.label}</span>
    </div>
  );
}

export const OrgChartFlowNode = memo(OrgChartFlowNodeComponent);

export const orgChartFlowNodeTypes = {
  orgChart: OrgChartFlowNode,
};
