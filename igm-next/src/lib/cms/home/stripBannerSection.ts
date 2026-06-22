/** Retire le bloc bannière statique (remplacé par le composant React). */
export function stripBannerSection(html: string): string {
  const start = html.indexOf('<div class="home4-banner-section');
  const aboutStart = html.indexOf("<!-- cms:home-about:start -->");

  if (start === -1 || aboutStart === -1 || aboutStart <= start) {
    return html;
  }

  return html.slice(0, start) + html.slice(aboutStart);
}
