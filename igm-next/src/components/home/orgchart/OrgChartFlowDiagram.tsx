"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";

import { getOrgChartDecreeContent } from "./orgChartDecreeData";
import { layoutOrgChartWithElk } from "./layoutOrgChartWithElk";
import { orgChartFlowNodeTypes } from "./OrgChartFlowNode";
import type { OrgChartNodeData } from "./buildOrgChartFlowLayout";

import "./orgchart-flow.css";

type Props = {
  locale: SupportedLocale;
};

function OrgChartFlowCanvas({ locale }: Props) {
  const content = useMemo(() => getOrgChartDecreeContent(locale), [locale]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<OrgChartNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const { fitView } = useReactFlow();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    layoutOrgChartWithElk(content)
      .then((layout) => {
        if (cancelled) return;
        setNodes(layout.nodes);
        setEdges(layout.edges);
        setLoading(false);
        requestAnimationFrame(() => {
          fitView({ padding: 0.18, duration: 0 });
        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [content, fitView, setEdges, setNodes]);

  return (
    <figure className="igm-orgchart-decree">
      <figcaption>{content.caption}</figcaption>

      <div className="igm-orgchart-flow" aria-busy={loading}>
        {loading ? (
          <p className="igm-orgchart-flow__status">
            {locale === "en" ? "Loading org chart…" : "Chargement de l'organigramme…"}
          </p>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={orgChartFlowNodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            panOnScroll
            zoomOnScroll
            zoomOnPinch
            minZoom={0.25}
            maxZoom={1.75}
            proOptions={{ hideAttribution: true }}
          />
        )}
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
