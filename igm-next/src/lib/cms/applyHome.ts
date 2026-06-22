import { buildHomeSections } from "./home/render";
import type { HomeRenderContext } from "./home/types";

function replaceCmsSection(html: string, key: string, replacement: string | null): string {
  if (!replacement?.trim()) return html;

  const start = `<!-- cms:${key}:start -->`;
  const end = `<!-- cms:${key}:end -->`;
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return html;
  }

  return `${html.slice(0, startIdx + start.length)}\n${replacement}\n${html.slice(endIdx)}`;
}

/** Injecte le contenu du global Accueil dans le HTML statique. */
export function applyHomeToHtml(html: string, ctx: HomeRenderContext | null): string {
  if (!ctx?.home) return html;

  const sections = buildHomeSections(ctx);
  let out = html;

  for (const [key, content] of Object.entries(sections)) {
    out = replaceCmsSection(out, key, content);
  }

  return out;
}
