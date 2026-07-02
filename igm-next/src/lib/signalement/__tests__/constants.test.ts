import { describe, expect, it } from "vitest";

import {
  isAllowedSignalementMime,
  isSignalementAudioMime,
  isSignalementVideoMime,
} from "../constants";

describe("signalement attachment mime helpers", () => {
  it("allows common image, audio and video types", () => {
    expect(isAllowedSignalementMime("image/jpeg", "photo.jpg")).toBe(true);
    expect(isAllowedSignalementMime("audio/mpeg", "note.mp3")).toBe(true);
    expect(isAllowedSignalementMime("video/mp4", "preuve.mp4")).toBe(true);
    expect(isAllowedSignalementMime("video/webm", "capture.webm")).toBe(true);
  });

  it("distinguishes video webm from audio webm", () => {
    expect(isSignalementVideoMime("video/webm", "clip.webm")).toBe(true);
    expect(isSignalementAudioMime("video/webm", "clip.webm")).toBe(false);
    expect(isSignalementAudioMime("audio/webm", "voice.webm")).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(isAllowedSignalementMime("application/pdf", "doc.pdf")).toBe(false);
    expect(isAllowedSignalementMime("text/plain", "notes.txt")).toBe(false);
  });
});
