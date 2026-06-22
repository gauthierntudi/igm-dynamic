/** Retire le bloc « À propos » statique (remplacé par le composant React). */
export function stripAboutSection(html: string): string {
  const start = html.indexOf("<!-- cms:home-about:start -->");
  const strategyStart = html.indexOf("<!-- cms:home-strategy:start -->");

  if (start === -1 || strategyStart === -1 || strategyStart <= start) {
    return html;
  }

  return html.slice(0, start) + html.slice(strategyStart);
}
