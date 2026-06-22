/** Retire le bloc « Chiffres » statique (remplacé par le composant React). */
export function stripStatsSection(html: string): string {
  const start = html.indexOf("<!-- section chiffres -->");
  const end = html.indexOf("<!-- /section chiffres -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- /section chiffres -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
