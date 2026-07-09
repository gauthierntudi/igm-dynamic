"use client";

import { Panel, useReactFlow, useStore } from "@xyflow/react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback } from "react";

import type { SupportedLocale } from "@/i18n/locales";

const FIT_VIEW_OPTIONS = { padding: 0.04, maxZoom: 1.2, duration: 200 } as const;
const ZOOM_STEP = 1.2;

type Props = {
  locale: SupportedLocale;
};

export function OrgChartZoomControls({ locale }: Props) {
  const { zoomTo, fitView, viewportInitialized } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);
  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);

  const zoomInLabel = locale === "en" ? "Zoom in" : "Zoom avant";
  const zoomOutLabel = locale === "en" ? "Zoom out" : "Zoom arrière";
  const resetLabel =
    locale === "en" ? "Reset view" : "Réinitialiser la vue";
  const zoomLevelLabel =
    locale === "en"
      ? `Zoom level ${Math.round(zoom * 100)} percent`
      : `Niveau de zoom ${Math.round(zoom * 100)} pour cent`;

  const canZoomIn = viewportInitialized && zoom < maxZoom - 0.01;
  const canZoomOut = viewportInitialized && zoom > minZoom + 0.01;

  const handleZoomIn = useCallback(() => {
    void zoomTo(Math.min(zoom * ZOOM_STEP, maxZoom), { duration: 150 });
  }, [maxZoom, zoom, zoomTo]);

  const handleZoomOut = useCallback(() => {
    void zoomTo(Math.max(zoom / ZOOM_STEP, minZoom), { duration: 150 });
  }, [minZoom, zoom, zoomTo]);

  const handleReset = useCallback(() => {
    void fitView({ ...FIT_VIEW_OPTIONS });
  }, [fitView]);

  return (
    <Panel position="bottom-right" className="igm-orgchart-zoom-controls-panel nodrag nopan nowheel">
      <div className="igm-orgchart-zoom-controls" role="toolbar" aria-label={zoomLevelLabel}>
        <button
          type="button"
          className="igm-orgchart-zoom-controls__btn"
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          aria-label={zoomOutLabel}
          title={zoomOutLabel}
        >
          <Minus size={17} strokeWidth={2.25} aria-hidden />
        </button>

        <span className="igm-orgchart-zoom-controls__level" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          className="igm-orgchart-zoom-controls__btn"
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          aria-label={zoomInLabel}
          title={zoomInLabel}
        >
          <Plus size={17} strokeWidth={2.25} aria-hidden />
        </button>

        <span className="igm-orgchart-zoom-controls__divider" aria-hidden />

        <button
          type="button"
          className="igm-orgchart-zoom-controls__btn igm-orgchart-zoom-controls__btn--reset"
          onClick={handleReset}
          disabled={!viewportInitialized}
          aria-label={resetLabel}
          title={resetLabel}
        >
          <RotateCcw size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </Panel>
  );
}

export const ORG_CHART_FIT_VIEW_OPTIONS = FIT_VIEW_OPTIONS;
