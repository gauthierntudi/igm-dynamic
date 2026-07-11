"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  type CoordinateExtent,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo } from "react";

import type { SupportedLocale } from "@/i18n/locales";

import { buildOrgChartFixedLayout } from "./buildOrgChartFixedLayout";
import { OrgChartConnectorsLayer } from "./OrgChartConnectorsLayer";
import {
  ORG_CHART_FIT_VIEW_OPTIONS,
  OrgChartZoomControls,
} from "./OrgChartZoomControls";
import { getOrgChartDecreeContent } from "./orgChartDecreeData";
import { orgChartFlowNodeTypes } from "./OrgChartFlowNode";
import type { OrgChartNodeData } from "./buildOrgChartFixedLayout";

import "./orgchart-flow.css";

const ORG_CHART_PAN_PADDING = 72;

function getOrgChartTranslateExtent(
  nodes: Node<OrgChartNodeData>[],
): CoordinateExtent {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const width = node.width ?? 0;
    const height = node.height ?? 0;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  }

  if (!Number.isFinite(minX)) {
    return [
      [-Infinity, -Infinity],
      [Infinity, Infinity],
    ];
  }

  return [
    [minX - ORG_CHART_PAN_PADDING, minY - ORG_CHART_PAN_PADDING],
    [maxX + ORG_CHART_PAN_PADDING, maxY + ORG_CHART_PAN_PADDING],
  ];
}

type Props = {
  locale: SupportedLocale;
};

function OrgChartFlowCanvas({ locale }: Props) {
  const content = useMemo(() => getOrgChartDecreeContent(locale), [locale]);

  const { nodes, connectors } = useMemo(
    () => buildOrgChartFixedLayout(content, locale),
    [content, locale],
  );

  const translateExtent = useMemo(
    () => getOrgChartTranslateExtent(nodes as Node<OrgChartNodeData>[]),
    [nodes],
  );

  const onInit = useCallback((instance: ReactFlowInstance<Node<OrgChartNodeData>>) => {
    requestAnimationFrame(() => {
      void instance.fitView({ ...ORG_CHART_FIT_VIEW_OPTIONS, duration: 0 });
    });
  }, []);

  return (
    <figure className="igm-orgchart-decree">
      <figcaption>{content.caption}</figcaption>

      <div className="igm-orgchart-flow">
        <ReactFlow
          nodes={nodes as Node<OrgChartNodeData>[]}
          edges={[]}
          nodeTypes={orgChartFlowNodeTypes}
          onInit={onInit}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          preventScrolling={false}
          minZoom={0.35}
          maxZoom={1.35}
          translateExtent={translateExtent}
          proOptions={{ hideAttribution: true }}
        >
          <OrgChartConnectorsLayer connectors={connectors} />
          <OrgChartZoomControls locale={locale} />
        </ReactFlow>
      </div>

      <p className="igm-orgchart-flow__hint">{content.panHint}</p>

      <ul className="igm-orgchart-legend" aria-label={locale === "en" ? "Legend" : "Légende"}>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--leadership" />
          {content.legend.leadership}
        </li>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--support" />
          {content.legend.support}
        </li>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--department" />
          {content.legend.department}
        </li>
        <li>
          <span className="igm-orgchart-legend-swatch igm-orgchart-legend-swatch--service" />
          {content.legend.service}
        </li>
      </ul>
    </figure>
  );
}

export function OrgChartFlowDiagram({ locale }: Props) {
  return (
    <ReactFlowProvider>
      <OrgChartFlowCanvas locale={locale} />
    </ReactFlowProvider>
  );
}

/** @deprecated Alias — préférer OrgChartFlowDiagram */
export const OrgChartDecreeDiagram = OrgChartFlowDiagram;
