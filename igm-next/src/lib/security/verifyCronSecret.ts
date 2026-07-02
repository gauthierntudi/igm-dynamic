export function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("[cron] CRON_SECRET manquant sur l'environnement.");
    return false;
  }

  const auth = request.headers.get("authorization")?.trim();
  if (!auth?.startsWith("Bearer ")) {
    console.error("[cron] Authorization Bearer manquant ou invalide.");
    return false;
  }

  const token = auth.slice("Bearer ".length).trim();
  return token === secret;
}
