import type { SupportedLocale } from "@/i18n/locales";

const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.537995480033!2d15.295193375669728!3d-4.309473846405503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a6a3300232a3a87%3A0xadb4aac562811969!2sInspection%20g%C3%A9n%C3%A9rale%20des%20Mines!5e0!3m2!1sfr!2scd!4v1782671827349!5m2!1sfr!2scd";

const DEFAULT_MAP_OPEN_URL =
  "https://www.google.com/maps/place/Inspection+g%C3%A9n%C3%A9rale+des+Mines/@-4.3094738,15.2951934,17z";

function localizeEmbedUrl(url: string, locale: SupportedLocale): string {
  if (locale === "en") {
    return url.replace(/!1sfr!2scd/g, "!1sen!2scd");
  }
  return url;
}

export function buildContactMapEmbedUrl(
  _address: string | null | undefined,
  locale: SupportedLocale,
): string {
  const customUrl = process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL?.trim();
  if (customUrl) return localizeEmbedUrl(customUrl, locale);

  return localizeEmbedUrl(DEFAULT_MAP_EMBED_URL, locale);
}

export function buildContactMapOpenUrl(
  _address: string | null | undefined,
  locale: SupportedLocale,
): string {
  const hl = locale === "en" ? "en" : "fr";
  return `${DEFAULT_MAP_OPEN_URL}?hl=${hl}`;
}
