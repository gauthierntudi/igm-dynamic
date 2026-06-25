/** Nombre d’articles sur la page d’accueil (section Actualités). */
export const HOME_NEWS_MAX_ITEMS = 4;

/** Nombre d’articles dans « Autres actualités » sur la page article. */
export const ARTICLE_RELATED_NEWS_MAX_ITEMS = 3;

/** Longueur max du titre affiché sur une carte actualité. */
export const NEWS_CARD_TITLE_MAX_LENGTH = 100;

/** Longueur max de l’extrait affiché sur une carte actualité. */
export const NEWS_CARD_EXCERPT_MAX_LENGTH = 180;

export function truncateNewsCardText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  if (maxLength <= 1) return "…";
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
