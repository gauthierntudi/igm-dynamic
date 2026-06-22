/** Retire l’ancienne section équipe statique (remplacée par l’organigramme React). */
export function stripOrgChartSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-orgchart:start -->");
  const end = html.indexOf("<!-- cms:home-orgchart:end -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- cms:home-orgchart:end -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
