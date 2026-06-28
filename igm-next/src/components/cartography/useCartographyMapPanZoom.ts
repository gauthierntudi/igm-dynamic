import { useCallback, useEffect, useRef, useState } from "react";

type Transform = { x: number; y: number; scale: number };

const MOBILE_MQ = "(max-width: 991px)";
/** Zoom initial mobile — assez fort pour lire les noms (pan/zoom disponible). */
const DEFAULT_SCALE = 2.85;
const MIN_SCALE = 1.7;
const MAX_SCALE = 4.5;
/** Point focal approx. du territoire RDC sur la carte SVG. */
const MAP_FOCUS_X = 0.47;
const MAP_FOCUS_Y = 0.51;
const PAN_THRESHOLD = 8;

function pinchDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function clampTransform(
  viewport: HTMLElement,
  stage: HTMLElement,
  transform: Transform,
): Transform {
  const { x, y, scale } = transform;
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const sw = stage.offsetWidth * scale;
  const sh = stage.offsetHeight * scale;

  let nextX = x;
  let nextY = y;

  if (sw <= vw) {
    nextX = (vw - sw) / 2;
  } else {
    nextX = Math.min(0, Math.max(vw - sw, nextX));
  }

  if (sh <= vh) {
    nextY = (vh - sh) / 2;
  } else {
    nextY = Math.min(0, Math.max(vh - sh, nextY));
  }

  return { x: nextX, y: nextY, scale };
}

function initialMobileTransform(viewport: HTMLElement, stage: HTMLElement): Transform {
  const scale = DEFAULT_SCALE;
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const contentW = stage.offsetWidth;
  const contentH = stage.offsetHeight;
  const focusX = contentW * MAP_FOCUS_X;
  const focusY = contentH * MAP_FOCUS_Y;
  const x = vw / 2 - focusX * scale;
  const y = vh / 2 - focusY * scale;

  return clampTransform(viewport, stage, { x, y, scale });
}

function applyStageTransform(stage: HTMLElement, transform: Transform): void {
  stage.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`;
}

export function useCartographyMapPanZoom(loaded: boolean) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; transform: Transform } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; transform: Transform } | null>(null);
  const suppressClickRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);

  const applyTransform = useCallback((next: Transform) => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return;

    const clamped = isMobile
      ? clampTransform(viewport, stage, next)
      : { x: 0, y: 0, scale: 1 };

    transformRef.current = clamped;
    applyStageTransform(stage, clamped);
  }, [isMobile]);

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage || !isMobile) return;

    applyTransform(initialMobileTransform(viewport, stage));
  }, [applyTransform, isMobile]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!loaded || !viewport || !stage) return;

    if (isMobile) {
      requestAnimationFrame(() => {
        applyTransform(initialMobileTransform(viewport, stage));
      });
      return;
    }

    applyTransform({ x: 0, y: 0, scale: 1 });
  }, [applyTransform, isMobile, loaded]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!loaded || !isMobile || !viewport || !stage) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      viewport.setPointerCapture(event.pointerId);
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointersRef.current.size === 1) {
        panStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          transform: { ...transformRef.current },
        };
        suppressClickRef.current = false;
      }

      if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()];
        panStartRef.current = null;
        pinchStartRef.current = {
          distance: pinchDistance(pts[0], pts[1]),
          transform: { ...transformRef.current },
        };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointersRef.current.has(event.pointerId)) return;

      const previous = pointersRef.current.get(event.pointerId)!;
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointersRef.current.size === 2 && pinchStartRef.current) {
        const pts = [...pointersRef.current.values()];
        const distance = pinchDistance(pts[0], pts[1]);
        const ratio = distance / pinchStartRef.current.distance;
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, pinchStartRef.current.transform.scale * ratio),
        );

        const rect = viewport.getBoundingClientRect();
        const centerX = (pts[0].x + pts[1].x) / 2 - rect.left;
        const centerY = (pts[0].y + pts[1].y) / 2 - rect.top;
        const base = pinchStartRef.current.transform;
        const scaleRatio = nextScale / base.scale;

        applyTransform({
          scale: nextScale,
          x: centerX - (centerX - base.x) * scaleRatio,
          y: centerY - (centerY - base.y) * scaleRatio,
        });
        suppressClickRef.current = true;
        return;
      }

      if (pointersRef.current.size === 1 && panStartRef.current) {
        const dx = event.clientX - panStartRef.current.x;
        const dy = event.clientY - panStartRef.current.y;

        if (Math.hypot(dx, dy) > PAN_THRESHOLD) {
          suppressClickRef.current = true;
        }

        applyTransform({
          ...panStartRef.current.transform,
          x: panStartRef.current.transform.x + dx,
          y: panStartRef.current.transform.y + dy,
        });
      }

      if (
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > PAN_THRESHOLD
      ) {
        suppressClickRef.current = true;
      }
    };

    const endPointer = (event: PointerEvent) => {
      pointersRef.current.delete(event.pointerId);

      if (pointersRef.current.size < 2) {
        pinchStartRef.current = null;
      }

      if (pointersRef.current.size === 0) {
        panStartRef.current = null;
      } else if (pointersRef.current.size === 1) {
        const remaining = [...pointersRef.current.entries()][0];
        panStartRef.current = {
          x: remaining[1].x,
          y: remaining[1].y,
          transform: { ...transformRef.current },
        };
      }

      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endPointer);
      viewport.removeEventListener("pointercancel", endPointer);
    };
  }, [applyTransform, isMobile, loaded]);

  const shouldSuppressClick = useCallback(() => {
    const suppress = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppress;
  }, []);

  return {
    viewportRef,
    stageRef,
    isMobile,
    resetView,
    shouldSuppressClick,
  };
}
