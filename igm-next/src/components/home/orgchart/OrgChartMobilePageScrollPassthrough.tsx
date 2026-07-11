"use client";

import { useStoreApi, type CoordinateExtent } from "@xyflow/react";
import { useEffect, useState, type RefObject } from "react";

const MOBILE_MQ = "(max-width: 767px)";
const BOUNDARY_EPSILON_PX = 4;
const PAGE_SCROLL_CLASS = "igm-orgchart-flow__pane--page-scroll";
const PAGE_SCROLL_CONTAINER_CLASS = "igm-orgchart-flow--page-scroll";

type ViewportState = {
  x: number;
  y: number;
  zoom: number;
};

type Props = {
  containerRef: RefObject<HTMLElement | null>;
  translateExtent: CoordinateExtent;
};

function getVerticalPanLimits(
  viewport: ViewportState,
  containerHeight: number,
  translateExtent: CoordinateExtent,
): { canPanUp: boolean; canPanDown: boolean } {
  const zoom = viewport.zoom;
  const visibleTop = -viewport.y / zoom;
  const visibleBottom = (containerHeight - viewport.y) / zoom;
  const [[, minY], [, maxY]] = translateExtent;
  const epsilon = BOUNDARY_EPSILON_PX / zoom;

  return {
    canPanUp: visibleTop > minY + epsilon,
    canPanDown: visibleBottom < maxY - epsilon,
  };
}

function shouldPassVerticalScrollToPage(
  deltaX: number,
  deltaY: number,
  canPanUp: boolean,
  canPanDown: boolean,
): boolean {
  if (deltaY === 0) {
    return false;
  }

  const verticalIntent = Math.abs(deltaY) > Math.abs(deltaX);
  if (!verticalIntent) {
    return false;
  }

  if (deltaY < 0 && !canPanUp) {
    return true;
  }

  if (deltaY > 0 && !canPanDown) {
    return true;
  }

  return false;
}

function enableInstantPageScroll(): void {
  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";
}

function restorePageScrollBehavior(): void {
  document.documentElement.style.scrollBehavior = "";
  document.body.style.scrollBehavior = "";
}

function scrollPageByPixels(deltaY: number): void {
  const scrollElement = document.scrollingElement ?? document.documentElement;
  scrollElement.scrollTop -= deltaY;
}

export function OrgChartMobilePageScrollPassthrough({
  containerRef,
  translateExtent,
}: Props) {
  const store = useStoreApi();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let cleanupListeners: (() => void) | undefined;

    const attachListeners = (): boolean => {
      const pane = container.querySelector<HTMLElement>(".react-flow__pane");
      if (!pane) {
        return false;
      }

      let activePointerId: number | null = null;
      let pageScrollActive = false;
      let previousClientX = 0;
      let previousClientY = 0;
      let previousViewportY = 0;

      const readViewportState = (): { viewport: ViewportState; height: number } => {
        const { transform, height } = store.getState();
        return {
          viewport: {
            x: transform[0],
            y: transform[1],
            zoom: transform[2],
          },
          height,
        };
      };

      const beginPageScrollGesture = () => {
        pageScrollActive = true;
        enableInstantPageScroll();
        pane.classList.add(PAGE_SCROLL_CLASS);
        container.classList.add(PAGE_SCROLL_CONTAINER_CLASS);
        pane.style.touchAction = "pan-y";
      };

      const endPageScrollGesture = () => {
        pageScrollActive = false;
        restorePageScrollBehavior();
        pane.classList.remove(PAGE_SCROLL_CLASS);
        container.classList.remove(PAGE_SCROLL_CONTAINER_CLASS);
        pane.style.touchAction = "";
      };

      const endGesture = (pointerId: number) => {
        if (activePointerId !== pointerId) {
          return;
        }

        activePointerId = null;
        endPageScrollGesture();
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "touch") {
          return;
        }

        activePointerId = event.pointerId;
        pageScrollActive = false;
        previousClientX = event.clientX;
        previousClientY = event.clientY;
        previousViewportY = readViewportState().viewport.y;
        pane.classList.remove(PAGE_SCROLL_CLASS);
        container.classList.remove(PAGE_SCROLL_CONTAINER_CLASS);
        pane.style.touchAction = "";
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "touch") {
          return;
        }

        if (activePointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - previousClientX;
        const deltaY = event.clientY - previousClientY;
        previousClientX = event.clientX;
        previousClientY = event.clientY;

        if (pageScrollActive) {
          event.stopImmediatePropagation();
          event.preventDefault();
          scrollPageByPixels(deltaY);
          return;
        }

        const { viewport, height } = readViewportState();
        const verticalAttempt = Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 0;
        const yClamped = verticalAttempt && Math.abs(viewport.y - previousViewportY) < 0.5;
        previousViewportY = viewport.y;

        const { canPanUp, canPanDown } = getVerticalPanLimits(
          viewport,
          height,
          translateExtent,
        );

        if (
          !yClamped &&
          !shouldPassVerticalScrollToPage(deltaX, deltaY, canPanUp, canPanDown)
        ) {
          return;
        }

        beginPageScrollGesture();
        event.stopImmediatePropagation();
        event.preventDefault();

        try {
          if (pane.hasPointerCapture(event.pointerId)) {
            pane.releasePointerCapture(event.pointerId);
          }
        } catch {
          // Pointer capture may already be released.
        }

        scrollPageByPixels(deltaY);
      };

      const onPointerEnd = (event: PointerEvent) => {
        endGesture(event.pointerId);
      };

      const pointerOptions: AddEventListenerOptions = { capture: true };
      const moveOptions: AddEventListenerOptions = { capture: true, passive: false };

      pane.addEventListener("pointerdown", onPointerDown, pointerOptions);
      pane.addEventListener("pointermove", onPointerMove, moveOptions);
      pane.addEventListener("pointerup", onPointerEnd, pointerOptions);
      pane.addEventListener("pointercancel", onPointerEnd, pointerOptions);

      cleanupListeners = () => {
        endPageScrollGesture();
        pane.removeEventListener("pointerdown", onPointerDown, pointerOptions);
        pane.removeEventListener("pointermove", onPointerMove, moveOptions);
        pane.removeEventListener("pointerup", onPointerEnd, pointerOptions);
        pane.removeEventListener("pointercancel", onPointerEnd, pointerOptions);
      };

      return true;
    };

    if (!attachListeners()) {
      const frameId = requestAnimationFrame(() => {
        if (!disposed) {
          attachListeners();
        }
      });

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        cleanupListeners?.();
        restorePageScrollBehavior();
      };
    }

    return () => {
      disposed = true;
      cleanupListeners?.();
      restorePageScrollBehavior();
    };
  }, [containerRef, isMobile, store, translateExtent]);

  return null;
}
