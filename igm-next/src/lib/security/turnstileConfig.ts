/** Clé site Turnstile (publique) — widget formulaire signalement. */
export function turnstileSiteKey(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return raw || undefined;
}

export function isTurnstileClientEnabled(): boolean {
  return Boolean(turnstileSiteKey());
}
