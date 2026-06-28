/** Extrait le texte lisible d'une chaîne HTML. */
export function stripHtml(html: string): string {
  return html
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

export function collectTextFields(
  value: unknown,
  parts: string[],
  depth = 0,
): void {
  if (depth > 8 || value == null) return;

  if (typeof value === "string") {
    const text = value.trim();
    if (text && !text.startsWith("http") && text.length <= 4000) {
      parts.push(text);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectTextFields(item, parts, depth + 1);
    return;
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "id" || key === "updatedAt" || key === "createdAt" || key === "mimeType") {
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
    const cleaned = part.replace(/\s+/g, " ").trim();
    if (!cleaned || cleaned.length < 3) continue;
    const key = normalizeForSearch(cleaned).slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(cleaned);
  }

  return unique.join(" ").slice(0, maxLength);
}
