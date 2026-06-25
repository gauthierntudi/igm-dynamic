/** Retire le bloc « Actualités » statique (remplacé par le composant React). */
export function stripNewsSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-news:start -->");
  const end = html.indexOf("<!-- cms:home-news:end -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- cms:home-news:end -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
