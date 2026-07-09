"use client";

import {
  ReactFlow,
  ReactFlowProvider,
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

type Props = {
  locale: SupportedLocale;
};

function OrgChartFlowCanvas({ locale }: Props) {
  const content = useMemo(() => getOrgChartDecreeContent(locale), [locale]);

  const { nodes, connectors } = useMemo(
    () => buildOrgChartFixedLayout(content, locale),
    [content, locale],
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
