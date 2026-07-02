import { afterEach, describe, expect, it, vi } from "vitest";

import { TURNSTILE_FORM_FIELD, verifyTurnstileToken } from "../turnstile";

describe("verifyTurnstileToken", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("skips verification in development when secret is unset", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "development";

    const result = await verifyTurnstileToken(null);
    expect(result).toEqual({ ok: true });
  });

  it("rejects in production when secret is unset", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "production";

    const result = await verifyTurnstileToken("token");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("indisponible");
    }
  });

  it("rejects empty token when secret is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "test";

    const result = await verifyTurnstileToken("  ");
    expect(result).toEqual({ ok: false, error: "Veuillez valider le contrôle de sécurité." });
  });

  it("calls Cloudflare siteverify with token and remote IP", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "test";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyTurnstileToken("abc-token", "203.0.113.1");
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect((init.body as URLSearchParams).get("secret")).toBe("test-secret");
    expect((init.body as URLSearchParams).get("response")).toBe("abc-token");
    expect((init.body as URLSearchParams).get("remoteip")).toBe("203.0.113.1");
  });

  it("exports the standard Turnstile form field name", () => {
    expect(TURNSTILE_FORM_FIELD).toBe("cf-turnstile-response");
  });
});
