"use client";

import { ViewportPortal } from "@xyflow/react";
import { useId } from "react";

import type { OrgChartConnector } from "./buildOrgChartFixedLayout";

type Props = {
  connectors: OrgChartConnector[];
};

export function OrgChartConnectorsLayer({ connectors }: Props) {
  const markerAutoId = `${useId().replace(/:/g, "")}-auto`;
  const markerRightId = `${useId().replace(/:/g, "")}-right`;

  return (
    <ViewportPortal>
      <svg
        className="igm-orgchart-connectors"
        aria-hidden="true"
        style={{ overflow: "visible", pointerEvents: "none" }}
      >
        <defs>
          <marker
            id={markerAutoId}
            markerWidth="12"
            markerHeight="12"
            refX="11"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L12,6 L0,12 Z" fill="#1a1a1a" />
          </marker>
          <marker
            id={markerRightId}
            markerWidth="12"
            markerHeight="12"
            refX="11"
            refY="6"
            orient="0"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L12,6 L0,12 Z" fill="#1a1a1a" />
          </marker>
        </defs>
        <g>
          {connectors.map((connector) => (
            <path
              key={connector.id}
              d={connector.path}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={2}
              markerEnd={
                connector.arrowEnd
                  ? `url(#${connector.arrowOrient === "right" ? markerRightId : markerAutoId})`
                  : undefined
              }
            />
          ))}
        </g>
      </svg>
    </ViewportPortal>
  );
}
