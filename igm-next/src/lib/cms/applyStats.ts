import type { CmsStat } from "./types";

/** Met à jour `data-target` sur les éléments portant `data-stat-key`. */
export function applyCmsStatsToHtml(html: string, stats: CmsStat[]): string {
  if (!stats.length) return html;

  const byKey = new Map(stats.map((s) => [s.key, s]));

  return html.replace(/data-stat-key="([^"]+)"([^>]*)>/gi, (full, key: string, middle: string) => {
    const stat = byKey.get(key);
    if (!stat) return full;

    let attrs = middle;
    if (/data-target="/i.test(attrs)) {
      attrs = attrs.replace(/data-target="[^"]*"/i, `data-target="${stat.value}"`);
    } else {
      attrs += ` data-target="${stat.value}"`;
    }

    return `data-stat-key="${key}"${attrs}>`;
  });
}
