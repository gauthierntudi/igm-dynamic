export const TURNSTILE_FORM_FIELD = "cf-turnstile-response";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

function turnstileSecretKey(): string | undefined {
  const raw = process.env.TURNSTILE_SECRET_KEY?.trim();
  return raw || undefined;
}

/** Vérification serveur activée (clé secrète configurée). */
export function isTurnstileServerEnabled(): boolean {
  return Boolean(turnstileSecretKey());
}

/**
 * Valide un jeton Turnstile auprès de Cloudflare.
 * Sans clé secrète : ignoré en dev, refusé en production.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = turnstileSecretKey();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY manquante en production.");
      return { ok: false, error: "Vérification de sécurité indisponible." };
    }
    return { ok: true };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: "Veuillez valider le contrôle de sécurité." };
  }

  const body = new URLSearchParams({
    secret,
    response: trimmed,
  });
  const ip = remoteIp?.trim();
  if (ip) {
    body.set("remoteip", ip);
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP", res.status);
      return { ok: false, error: "Contrôle de sécurité invalide. Réessayez." };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (data.success) {
      return { ok: true };
    }

    if (process.env.NODE_ENV !== "production" && data["error-codes"]?.length) {
      console.warn("[turnstile] siteverify errors:", data["error-codes"].join(", "));
    }

    return { ok: false, error: "Contrôle de sécurité invalide. Réessayez." };
  } catch (error) {
    console.error("[turnstile] siteverify failed", error);
    return { ok: false, error: "Contrôle de sécurité indisponible. Réessayez." };
  }
}
