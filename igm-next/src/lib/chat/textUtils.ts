/** Extrait le texte lisible d'une chaîne HTML. */
export function stripHtml(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  return sanitizeChatText(stripped);
}

export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeForSearch(value: string): string[] {
  return normalizeForSearch(value)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 2);
}

const QUERY_STOP_WORDS = new Set([
  "a",
  "an",
  "au",
  "aux",
  "ce",
  "cette",
  "de",
  "des",
  "do",
  "does",
  "du",
  "en",
  "est",
  "have",
  "has",
  "i",
  "if",
  "il",
  "is",
  "je",
  "know",
  "la",
  "le",
  "les",
  "ma",
  "mes",
  "mon",
  "my",
  "nous",
  "pour",
  "que",
  "qui",
  "quoi",
  "savoir",
  "si",
  "sur",
  "the",
  "they",
  "this",
  "tu",
  "un",
  "une",
  "vais",
  "veux",
  "vous",
  "want",
  "we",
  "what",
  "you",
]);

/** Tokens utiles pour le classement RAG (sans mots vides ni « igm » trop générique). */
export function tokenizeQuery(value: string): string[] {
  return tokenizeForSearch(value).filter(
    (token) => !QUERY_STOP_WORDS.has(token) && token !== "igm",
  );
}

/** Retire chemins internes, URLs média et noms de fichiers du texte exposé au chat. */
export function sanitizeChatText(value: string): string {
  return value
    .replace(/\/api\/media\/file\/[^\s]+/gi, " ")
    .replace(/\/api\/[^\s]+/gi, " ")
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/\b[\w.-]+\.(?:jpe?g|png|gif|webp|svg|pdf|mp4|mov|m4v|webm|mp3|wav|m4a)(?:\?[^\s]*)?\b/gi, " ")
    .replace(/\?prefix=[^\s]+/gi, " ")
    .replace(/\b(?:diapo|slide|image|public)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COLLECT_SKIP_KEYS = new Set([
  "id",
  "updatedAt",
  "createdAt",
  "mimeType",
  "url",
  "href",
  "src",
  "filename",
  "poster",
  "thumbnail",
  "media",
  "image",
  "video",
  "file",
  "prefix",
  "alt",
  "sizes",
  "width",
  "height",
]);

function isInternalOrMediaString(text: string): boolean {
  if (/^https?:\/\//i.test(text)) return true;
  if (/^\/[^\s]/.test(text)) return true;
  if (/\/api\//i.test(text)) return true;
  if (/\.(jpe?g|png|gif|webp|svg|pdf|mp4|mov|m4v|webm|mp3|wav|m4a)(\?|$)/i.test(text)) return true;
  return false;
}

export function collectTextFields(
  value: unknown,
  parts: string[],
  depth = 0,
): void {
  if (depth > 8 || value == null) return;

  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text.length > 4000 || isInternalOrMediaString(text)) {
      return;
    }
    parts.push(text);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectTextFields(item, parts, depth + 1);
    return;
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (COLLECT_SKIP_KEYS.has(key)) {
        continue;
      }
      collectTextFields(nested, parts, depth + 1);
    }
  }
}

export function mergeTextParts(parts: string[], maxLength = 1200): string {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const cleaned = sanitizeChatText(part.replace(/\s+/g, " ").trim());
    if (!cleaned || cleaned.length < 3) continue;
    const key = normalizeForSearch(cleaned).slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(cleaned);
  }

  return sanitizeChatText(unique.join(" ").slice(0, maxLength));
}
