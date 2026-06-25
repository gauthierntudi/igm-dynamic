/** Retire le bloc « Contact » statique (remplacé par le composant React). */
export function stripContactSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-contact:start -->");
  const end = html.indexOf("<!-- cms:home-contact:end -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- cms:home-contact:end -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
