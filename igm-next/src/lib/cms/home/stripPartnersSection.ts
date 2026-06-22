/** Retire le bloc « Partenaires » statique (remplacé par le composant React). */
export function stripPartnersSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-partners:start -->");
  const end = html.indexOf("<!-- cms:home-partners:end -->");

  if (start === -1 || end === -1 || end <= start) {
    return html;
  }

  const endMarker = "<!-- cms:home-partners:end -->";
  const endIndex = end + endMarker.length;

  return html.slice(0, start) + html.slice(endIndex);
}
