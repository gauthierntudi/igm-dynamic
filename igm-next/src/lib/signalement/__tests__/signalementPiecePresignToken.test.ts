import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSignalementPiecePresignToken,
  verifySignalementPiecePresignToken,
} from "../signalementPiecePresignToken";

describe("signalementPiecePresignToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a signed presign token", () => {
    vi.stubEnv("PAYLOAD_SECRET", "test-secret-for-presign-token-roundtrip");

    const token = createSignalementPiecePresignToken({
      filename: "abc.jpg",
      prefix: "",
      mimeType: "image/jpeg",
      filesize: 1024,
    });

    expect(token).toBeTruthy();

    const parsed = verifySignalementPiecePresignToken(token!);
    expect(parsed).toMatchObject({
      filename: "abc.jpg",
      prefix: "",
      mimeType: "image/jpeg",
      filesize: 1024,
    });
  });

  it("rejects tampered tokens", () => {
    vi.stubEnv("PAYLOAD_SECRET", "test-secret");

    const token = createSignalementPiecePresignToken({
      filename: "abc.jpg",
      prefix: "",
      mimeType: "image/jpeg",
      filesize: 1024,
    });

    expect(verifySignalementPiecePresignToken(`${token}x`)).toBeNull();
  });
});
