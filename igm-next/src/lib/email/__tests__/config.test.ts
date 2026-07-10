import { afterEach, describe, expect, it } from "vitest";

import {
  emailConfigured,
  getEmailTransportMode,
  parseFromParts,
  resendConfigured,
  smtpConfigured,
} from "../config";

describe("email config", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("defaults to smtp when SYS_ENVOI is unset", () => {
    delete process.env.SYS_ENVOI;
    expect(getEmailTransportMode()).toBe("smtp");
  });

  it("switches to resend when SYS_ENVOI=resend", () => {
    process.env.SYS_ENVOI = "resend";
    expect(getEmailTransportMode()).toBe("resend");
  });

  it("detects smtp configuration", () => {
    process.env.SYS_ENVOI = "smtp";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_FROM = "IGM <noreply@example.com>";
    expect(smtpConfigured()).toBe(true);
    expect(emailConfigured()).toBe(true);
  });

  it("detects resend configuration", () => {
    process.env.SYS_ENVOI = "resend";
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "IGM <contact@igm.cd>";
    expect(resendConfigured()).toBe(true);
    expect(emailConfigured()).toBe(true);
  });

  it("parses from header with display name", () => {
    expect(parseFromParts("IGM Contact <noreply@igm.cd>")).toEqual({
      name: "IGM Contact",
      address: "noreply@igm.cd",
    });
  });
});
