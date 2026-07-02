export function isPublishedHomePage(segments: string[]): boolean {
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0] === "marketing-agency") return true;
  return false;
}

export function pageSlugFromSegments(segments: string[]): string {
  return segments.join("/");
}
