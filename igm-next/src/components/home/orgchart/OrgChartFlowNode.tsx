import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import type { OrgChartNodeData } from "./buildOrgChartFlowLayout";

function OrgChartFlowNodeComponent({ data }: NodeProps) {
  const nodeData = data as OrgChartNodeData;

  return (
    <div className={`igm-orgchart-flow-node igm-orgchart-flow-node--${nodeData.tone}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="igm-orgchart-flow-handle"
        isConnectable={false}
      />
      <strong>{nodeData.label}</strong>
      {nodeData.sublabel ? <span>{nodeData.sublabel}</span> : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="igm-orgchart-flow-handle"
        isConnectable={false}
      />
    </div>
  );
}

export const OrgChartFlowNode = memo(OrgChartFlowNodeComponent);

export const orgChartFlowNodeTypes = {
  orgChart: OrgChartFlowNode,
};
