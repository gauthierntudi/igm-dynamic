/** Retire le bloc « Stratégie » statique (remplacé par le composant React). */
export function stripStrategySection(html: string): string {
  const start = html.indexOf("<!-- cms:home-strategy:start -->");
  const statsStart = html.indexOf("<!-- section chiffres -->");

  if (start === -1 || statsStart === -1 || statsStart <= start) {
    return html;
  }

  return html.slice(0, start) + html.slice(statsStart);
}
