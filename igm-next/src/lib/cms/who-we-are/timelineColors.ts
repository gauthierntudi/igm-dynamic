/** Bleus charte IGM du plus foncé au plus clair ; dernier segment = or. */
export const TIMELINE_BLUE_PALETTE = [
  "#0c1f3d",
  "#102a52",
  "#153a7a",
  "#1a4088",
  "#1b4491",
  "#2d5fae",
  "#4a7cc4",
] as const;

export const TIMELINE_GOLD = "#f6bf0d";

const LIGHT_BACKGROUNDS = new Set<string>([TIMELINE_GOLD, "#f6bf0d"]);

export function normalizeHexColor(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }

  return undefined;
}

export function defaultTimelineSegmentColor(index: number, total: number): string {
  if (total <= 0) return TIMELINE_BLUE_PALETTE[0];
  if (index === total - 1) return TIMELINE_GOLD;

  const blueSteps = total - 1;
  if (blueSteps <= 1) return TIMELINE_BLUE_PALETTE[0];

  const paletteMax = TIMELINE_BLUE_PALETTE.length - 1;
  const paletteIndex = Math.round((index / (blueSteps - 1)) * paletteMax);
  return TIMELINE_BLUE_PALETTE[paletteIndex];
}

export function timelineTextColorForBackground(background: string): string {
  const normalized = normalizeHexColor(background) ?? background.toLowerCase();
  if (LIGHT_BACKGROUNDS.has(normalized)) return "#0c1f3d";

  const hex = normalized.replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.62 ? "#0c1f3d" : "#ffffff";
}

export function resolveTimelineMilestoneColors(
  index: number,
  total: number,
  segmentColorRaw?: string | null,
  bubbleColorRaw?: string | null,
  fallbackSegmentColorRaw?: string | null,
  fallbackBubbleColorRaw?: string | null,
): {
  segmentColor: string;
  segmentTextColor: string;
  bubbleColor?: string;
  bubbleTextColor?: string;
} {
  const segmentColor =
    normalizeHexColor(segmentColorRaw) ??
    normalizeHexColor(fallbackSegmentColorRaw) ??
    defaultTimelineSegmentColor(index, total);

  const bubbleColor =
    normalizeHexColor(bubbleColorRaw) ?? normalizeHexColor(fallbackBubbleColorRaw);

  return {
    segmentColor,
    segmentTextColor: timelineTextColorForBackground(segmentColor),
    ...(bubbleColor
      ? {
          bubbleColor,
          bubbleTextColor: timelineTextColorForBackground(bubbleColor),
        }
      : {}),
  };
}
