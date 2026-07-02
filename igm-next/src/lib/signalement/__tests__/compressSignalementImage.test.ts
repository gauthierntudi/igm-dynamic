import { describe, expect, it } from "vitest";

import {
  shouldCompressSignalementImage,
  SIGNALEMENT_IMAGE_COMPRESS_MIN_BYTES,
} from "../compressSignalementImage";

describe("shouldCompressSignalementImage", () => {
  it("compresses large JPEG and PNG only", () => {
    const large = SIGNALEMENT_IMAGE_COMPRESS_MIN_BYTES + 1;
    expect(
      shouldCompressSignalementImage({ type: "image/jpeg", size: large }),
    ).toBe(true);
    expect(
      shouldCompressSignalementImage({ type: "image/png", size: large }),
    ).toBe(true);
  });

  it("skips small images and non-images", () => {
    expect(
      shouldCompressSignalementImage({
        type: "image/jpeg",
        size: SIGNALEMENT_IMAGE_COMPRESS_MIN_BYTES,
      }),
    ).toBe(false);
    expect(
      shouldCompressSignalementImage({ type: "video/mp4", size: 5_000_000 }),
    ).toBe(false);
    expect(
      shouldCompressSignalementImage({ type: "audio/mpeg", size: 5_000_000 }),
    ).toBe(false);
  });
});
