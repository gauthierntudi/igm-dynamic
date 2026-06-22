/** Retire le bloc « Action terrain » statique (remplacé par le composant React). */
export function stripActionSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-action:start -->");
  const end = html.indexOf("<!-- cms:home-action:end -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- cms:home-action:end -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
